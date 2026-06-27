import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapView.module.css';
import LocationSearch from '../LocationSearch/LocationSearch.jsx';
import { scoreColor } from '../../utils/score.js';
import { INDIA_CENTER } from '../../constants/categories.js';

function pinIcon(score) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${scoreColor(score)}" class="${styles.pin}">${score}</div>`,
    iconSize: [34, 34],
  });
}

// react-leaflet needs an explicit resize nudge when its container was
// hidden (display:none) at mount time — otherwise tiles render blank
// until the next pan/zoom. This fires that nudge on tab switch.
function ResizeOnShow() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [map]);
  return null;
}

// Flies the map to wherever LocationSearch resolved a place to. Lives
// inside MapContainer (only useMap() can access the map instance);
// re-fires whenever the parent passes a new target.
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1.2 });
  }, [target, map]);
  return null;
}

export default function MapView({ reports, onSelect, flyToTarget, onSearchLocation }) {
  return (
    <>
      <LocationSearch onLocate={(lat, lng, label) => onSearchLocation({ lat, lng, label })} />
      <div className={styles.mapWrap}>
        <MapContainer center={INDIA_CENTER} zoom={5} style={{ width: '100%', height: '100%' }}>
          <ResizeOnShow />
          <FlyTo target={flyToTarget} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
            maxZoom={19}
          />
          {reports.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={pinIcon(r.score)}
              eventHandlers={{ click: () => onSelect(r.id) }}
            />
          ))}
        </MapContainer>
      </div>
      <p className={styles.hint}>Tap a marker for that spot's score and details.</p>
    </>
  );
}
