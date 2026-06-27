import { useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './RoadPicker.module.css';

const HIGHWAY_SUFFIX = {
  service: 'service road',
  residential: 'residential',
  living_street: 'living street',
  unclassified: 'road',
  tertiary: 'road',
  tertiary_link: 'road',
  secondary: 'road',
  secondary_link: 'road',
  primary: 'road',
  primary_link: 'road',
  trunk: 'main road',
  trunk_link: 'main road',
  motorway: 'motorway',
  motorway_link: 'motorway slip',
  track: 'track',
  path: 'path',
  footway: 'footpath',
  cycleway: 'cycleway',
  busway: 'bus road',
};

const HIGHWAY_STANDALONE = {
  service: 'Service road',
  residential: 'Residential road',
  living_street: 'Living street',
  unclassified: 'Unnamed road',
  tertiary: 'Tertiary road',
  tertiary_link: 'Tertiary road',
  secondary: 'Secondary road',
  secondary_link: 'Secondary road',
  primary: 'Primary road',
  primary_link: 'Primary road',
  trunk: 'Main road',
  trunk_link: 'Main road',
  motorway: 'Motorway',
  motorway_link: 'Motorway slip road',
  track: 'Track',
  path: 'Path',
  footway: 'Footpath',
  cycleway: 'Cycleway',
  busway: 'Bus road',
};

async function getRoadName(lat, lng, signal) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json` +
    `&lat=${lat}&lon=${lng}&zoom=17`;
  const res = await fetch(url, { signal, headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('geocode failed');
  const data = await res.json();
  const name =
    data.address?.road ||
    data.address?.pedestrian ||
    data.address?.footway ||
    data.address?.path ||
    data.address?.cycleway ||
    null;
  const wayId = data.osm_type === 'way' ? data.osm_id : null;

  if (name) return { name, wayId };

  const suffix = data.class === 'highway' ? HIGHWAY_SUFFIX[data.type] : null;

  const locality =
    data.address?.neighbourhood ||
    data.address?.suburb ||
    data.address?.quarter ||
    data.address?.residential ||
    null;

  if (locality && suffix) return { name: `${locality}, ${suffix}`, wayId };

  try {
    const res2 = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=15`,
      { signal, headers: { 'Accept-Language': 'en' } }
    );
    const data2 = await res2.json();
    const nearest = data2.address?.road || data2.address?.pedestrian || null;
    if (nearest) {
      return { name: suffix ? `${nearest}, ${suffix}` : nearest, wayId };
    }
  } catch { /* ignore */ }

  const standalone = data.class === 'highway' ? HIGHWAY_STANDALONE[data.type] : null;
  return { name: standalone, wayId };
}

async function getRoadGeometry(wayId, name, lat, lng, signal) {
  let query;
  if (wayId) {
    query = `[out:json][timeout:8];way(${wayId});out geom;`;
  } else if (name) {
    const safe = name.replace(/"/g, '\\"');
    query = `[out:json][timeout:8];way[name="${safe}"][highway](around:200,${lat},${lng});out geom;`;
  } else {
    query = `[out:json][timeout:8];way(around:40,${lat},${lng})[highway];out geom;`;
  }

  const overpassEndpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];

  let res;
  for (const endpoint of overpassEndpoints) {
    try {
      res = await fetch(endpoint, { method: 'POST', body: query, signal });
      if (res.ok) break;
    } catch (e) {
      if (e.name === 'AbortError') throw e;
    }
  }
  if (!res?.ok) return [];
  const { elements } = await res.json();
  if (!elements?.length) return [];

  if (wayId) {
    return (elements[0].geometry || []).map((p) => [p.lat, p.lon]);
  }

  const click = [lat, lng];
  let best = null;
  let bestDist = Infinity;
  for (const way of elements) {
    const pts = (way.geometry || []).map((p) => [p.lat, p.lon]);
    const d = minDistToPolyline(click, pts);
    if (d < bestDist) { bestDist = d; best = pts; }
  }
  return best || [];
}

function minDistToPolyline(pt, polyline) {
  let min = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    min = Math.min(min, distToSegment(pt, polyline[i], polyline[i + 1]));
  }
  return min;
}

function distToSegment(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function MapEvents({ onTap, busy }) {
  useMapEvents({
    click(e) {
      if (!busy) onTap(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function RoadPicker({ center, onRoadSelect, locationLabel }) {
  const [road, setRoad] = useState(null);
  const [polyline, setPolyline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [mapOpen, setMapOpen] = useState(true);
  const [closing, setClosing] = useState(false);
  const abortRef = useRef(null);

  async function handleTap(lat, lng) {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setErr(null);
    setPolyline([]);

    try {
      const { name, wayId } = await getRoadName(lat, lng, ctrl.signal);
      if (ctrl.signal.aborted) return;

      const partial = { name, lat, lng };
      setRoad(partial);
      if (name) onRoadSelect(partial);

      if (!name && !wayId) {
        setErr('No road found here — tap directly on a road line.');
        setLoading(false);
        return;
      }

      const pts = await getRoadGeometry(wayId, name, lat, lng, ctrl.signal);
      if (ctrl.signal.aborted) return;

      setPolyline(pts);
      onRoadSelect({ name, polyline: pts, lat, lng });
      setTimeout(() => setClosing(true), 1000);
    } catch (e) {
      if (e.name === 'AbortError') return;
      setErr('Could not load road data. Check your connection.');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }

  function openMapToChange() {
    setMapOpen(true);
    setClosing(false);
    setErr(null);
  }

  function handleTransitionEnd(e) {
    if (closing && e.propertyName === 'opacity') {
      setMapOpen(false);
      setClosing(false);
    }
  }

  const userDotIcon = L.divIcon({
    className: '',
    html: `<div class="${styles.userDot}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const rowName = road?.name ?? locationLabel ?? 'Select a road below';

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.row} ${road ? styles.rowConfirmed : ''}`}
        onClick={!mapOpen && road ? openMapToChange : undefined}
        style={{ cursor: !mapOpen && road ? 'pointer' : 'default' }}
      >
        <span className={styles.rowName}>{rowName}</span>
        <div className={styles.rowRight}>
          {loading && <span className={styles.spinner} />}
          {!loading && road && (
            <svg className={styles.tickIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
          {!mapOpen && road && <span className={styles.changePill}>Change</span>}
        </div>
      </button>

      {err && <p className={styles.errText}>{err}</p>}

      {mapOpen && (
        <div
          className={`${styles.mapSection} ${closing ? styles.mapSectionClosing : ''}`}
          onTransitionEnd={handleTransitionEnd}
        >
          <div className={`${styles.mapWrap} ${loading ? styles.mapBusy : ''}`}>
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={17}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={20}
              />
              <MapEvents onTap={handleTap} busy={loading} />

              {polyline.length > 0 && (<>
                <Polyline
                  positions={polyline}
                  pathOptions={{ color: '#e67700', weight: 7, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
                />
                <Polyline
                  positions={polyline}
                  pathOptions={{ color: '#fff', weight: 2.5, opacity: 0.6, lineCap: 'butt', dashArray: '10 10' }}
                />
              </>)}

              {road && (
                <CircleMarker
                  center={[road.lat, road.lng]}
                  radius={11}
                  pathOptions={{ fillColor: '#e67700', color: '#fff', weight: 3, fillOpacity: 1 }}
                />
              )}

              <Marker position={[center.lat, center.lng]} icon={userDotIcon} />
            </MapContainer>
          </div>
          <p className={styles.mapFooter}>Pinch to zoom · tap a road to select it</p>
        </div>
      )}
    </div>
  );
}
