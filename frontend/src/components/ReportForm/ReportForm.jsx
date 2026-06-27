import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';
import styles from './ReportForm.module.css';
import PhotoUpload from '../PhotoUpload/PhotoUpload.jsx';
import RoadPicker from '../RoadPicker/RoadPicker.jsx';
import { ISSUES } from '../../constants/categories.js';
import { api } from '../../api/client.js';

const ISSUE_ICONS = {
  potholes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18h18M3 18V8h18v10"/><ellipse cx="12" cy="14.5" rx="4" ry="2.5"/>
    </svg>
  ),
  waterlogging: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0 0 16 0c0-4.5-8-13-8-13z"/>
    </svg>
  ),
  littering: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  ),
  construction: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  streetlight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 3.5-2.5 5.5-3 6.5H9C8.5 14.5 6 12.5 6 9a6 6 0 0 1 6-6z"/>
      <path d="M9 17h6"/>
    </svg>
  ),
  dust: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2"/><path d="M12.59 19.41A2 2 0 1 0 14 16H2"/>
      <path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
  drainage: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
  ),
  footpath: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18M3 6h4M10 6h4M17 6h4M3 13h4M10 13h4M17 13h4"/>
      <path d="M7 6v7M13 6v7"/>
    </svg>
  ),
};

function scoreLabel(score) {
  if (score === null) return null;
  if (score <= 20) return 'Critical';
  if (score <= 40) return 'Poor';
  if (score <= 60) return 'Fair';
  if (score <= 80) return 'Good';
  return 'Excellent';
}

const GRADIENT_STOPS = [
  { pct: 0,   r: 0xB8, g: 0x4C, b: 0x4C },
  { pct: 18,  r: 0xD9, g: 0x7A, b: 0x6A },
  { pct: 38,  r: 0xE8, g: 0xA5, b: 0x67 },
  { pct: 52,  r: 0xE5, g: 0xB9, b: 0x4A },
  { pct: 72,  r: 0x8F, g: 0xAE, b: 0x7A },
  { pct: 88,  r: 0x5D, g: 0x8F, b: 0x63 },
  { pct: 100, r: 0x35, g: 0x66, b: 0x45 },
];

function scoreColor(score) {
  if (score === null) return 'var(--label)';
  const s = Math.max(0, Math.min(100, score));
  let lo = GRADIENT_STOPS[0];
  let hi = GRADIENT_STOPS[GRADIENT_STOPS.length - 1];
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    if (s >= GRADIENT_STOPS[i].pct && s <= GRADIENT_STOPS[i + 1].pct) {
      lo = GRADIENT_STOPS[i]; hi = GRADIENT_STOPS[i + 1]; break;
    }
  }
  const t = hi.pct === lo.pct ? 0 : (s - lo.pct) / (hi.pct - lo.pct);
  const mix = (a, b) => Math.round(a + (b - a) * t);
  return `rgb(${mix(lo.r, hi.r)}, ${mix(lo.g, hi.g)}, ${mix(lo.b, hi.b)})`;
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] },
  };
}

export default function ReportForm({ onPublished, showToast }) {
  const [roadScore, setRoadScore] = useState(null);
  const [areaLabel, setAreaLabel] = useState('');
  const [issues, setIssues] = useState(new Set());
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [pickedRoad, setPickedRoad] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [manualLocation, setManualLocation] = useState(null);
  const [locSearch, setLocSearch] = useState('');
  const [locResults, setLocResults] = useState([]);
  const [locSearching, setLocSearching] = useState(false);
  const locSearchTimer = useRef(null);

  const scoreMotionVal = useMotionValue(0);
  const springScore = useSpring(scoreMotionVal, { stiffness: 250, damping: 20 });

  useEffect(() => {
    scoreMotionVal.set(roadScore ?? 0);
  }, [roadScore, scoreMotionVal]);

  useMotionValueEvent(springScore, 'change', (v) => setDisplayScore(Math.min(100, Math.max(0, Math.round(v)))));

  function handleIssueToggle(key) {
    setIssues((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleLocSearch(q) {
    setLocSearch(q);
    clearTimeout(locSearchTimer.current);
    if (!q.trim()) { setLocResults([]); return; }
    locSearchTimer.current = setTimeout(async () => {
      setLocSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q + ' Gurgaon')}`
        );
        const data = await res.json();
        setLocResults(data);
      } catch {
        // silent
      } finally {
        setLocSearching(false);
      }
    }, 450);
  }

  function handleLocPick(result) {
    const loc = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setManualLocation(loc);
    setAreaLabel(result.display_name.split(',').slice(0, 2).join(',').trim());
    setLocResults([]);
    setLocSearch('');
  }

  function resetForm() {
    setRoadScore(null); setAreaLabel(''); setIssues(new Set());
    setComment(''); setPhotoUrl(null); setPickedRoad(null);
    setManualLocation(null); setLocSearch(''); setLocResults([]);
    setMapKey((k) => k + 1); scoreMotionVal.set(0);
  }

  async function handleSubmit() {
    if (!manualLocation) { showToast('Search and select your road first.'); return; }
    if (roadScore === null) { showToast('Rate the road first.'); return; }
    setSubmitting(true);
    try {
      const reportLat = pickedRoad?.lat ?? manualLocation.lat;
      const reportLng = pickedRoad?.lng ?? manualLocation.lng;
      const report = await api.createReport({
        lat: reportLat, lng: reportLng,
        areaLabel: areaLabel.trim() || pickedRoad?.name || 'Unnamed location',
        photoUrl, ratings: {}, tags: Array.from(issues),
        comment: comment.trim(), score: roadScore,
      });
      showToast('Report published.');
      onPublished(report);
      resetForm();
    } catch (err) {
      showToast(err.message || 'Could not save. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const effectiveLocation = manualLocation;
  const fillPct = `${roadScore ?? 0}%`;
  const label = scoreLabel(roadScore);

  return (
    <div className={styles.form}>
      <div className={styles.container}>

        <motion.div className={styles.hero} {...fadeUp(0.06)}>
          <h2 className={styles.heroTitle}>Score the<br />Road</h2>
          <p className={styles.heroSub}>Build better roads through community feedback</p>
        </motion.div>

        <motion.div className={styles.section} {...fadeUp(0.12)}>
          <p className={styles.sectionLabel}>Road Location</p>
          {!manualLocation && (
            <div className={styles.locSearchWrap}>
              <div className={styles.locSearchBox}>
                <input
                  type="text"
                  className={styles.locSearchInput}
                  placeholder="e.g. Sector 49, DLF Phase 2…"
                  value={locSearch}
                  onChange={(e) => handleLocSearch(e.target.value)}
                />
                {locSearching && <span className={styles.locSearchSpinner} />}
              </div>
              {locResults.length > 0 && (
                <ul className={styles.locResults}>
                  {locResults.map((r, i) => (
                    <li key={i} className={styles.locResult} onClick={() => handleLocPick(r)}>
                      {r.display_name.split(',').slice(0, 3).join(', ')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {manualLocation && (
            <div className={styles.manualLocRow}>
              <span className={styles.manualLocLabel}>{areaLabel.split(',').slice(0, 2).join(',').trim()}</span>
              <button
                type="button"
                className={styles.manualLocChange}
                onClick={() => { setManualLocation(null); setPickedRoad(null); setAreaLabel(''); }}
              >
                Change
              </button>
            </div>
          )}
          {(locStatus === 'success' || manualLocation) && effectiveLocation && (
            <RoadPicker
              key={mapKey}
              center={effectiveLocation}
              locationLabel={areaLabel.split(',')[0].trim()}
              onRoadSelect={(road) => { setPickedRoad(road); if (road.name) setAreaLabel(road.name); }}
            />
          )}
        </motion.div>

        <motion.div className={styles.section} {...fadeUp(0.18)}>
          <p className={styles.sectionLabel}>Road Condition</p>
          <div className={styles.scoreBlock}>
            <span className={styles.scoreNumber} style={{ color: scoreColor(roadScore) }}>
              {roadScore === null ? '00' : displayScore}
            </span>
            <span className={styles.scoreBadge} style={{ color: scoreColor(roadScore) }}>
              {label || ''}
            </span>
          </div>
          <input
            type="range" min="0" max="100"
            className={styles.slider}
            style={{ '--fill': fillPct }}
            value={roadScore ?? 0}
            onChange={(e) => setRoadScore(Number(e.target.value))}
          />
          <div className={styles.sliderEndLabels}>
            <span>Critical</span>
            <span className={`${styles.sliderHint} ${roadScore !== null ? styles.sliderHintGone : ''}`}>drag to score</span>
            <span>Excellent</span>
          </div>
        </motion.div>

        <motion.div className={styles.section} {...fadeUp(0.24)}>
          <p className={styles.sectionLabel}>Problems</p>
          <div className={styles.chips}>
            {ISSUES.map((issue) => {
              const checked = issues.has(issue.key);
              return (
                <motion.button
                  key={issue.key} type="button"
                  className={`${styles.chip} ${checked ? styles.chipActive : ''}`}
                  onClick={() => handleIssueToggle(issue.key)}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className={styles.chipIcon}>{ISSUE_ICONS[issue.key]}</span>
                  {issue.chipLabel}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div className={styles.section} {...fadeUp(0.3)}>
          <p className={styles.sectionLabel}>Photo <span className={styles.optional}>(optional)</span></p>
          <div className={styles.photoArea}><PhotoUpload onUploaded={setPhotoUrl} /></div>
          <p className={styles.photoCaption}>Photos help authorities act faster</p>
        </motion.div>

        <motion.div className={styles.section} style={{ borderBottom: 'none' }} {...fadeUp(0.36)}>
          <p className={styles.sectionLabel}>Note <span className={styles.optional}>(optional)</span></p>
          <textarea
            className={styles.textarea} rows={3}
            placeholder="Anything else to add?"
            value={comment} onChange={(e) => setComment(e.target.value)}
          />
        </motion.div>

      </div>

      <div className={styles.ctaWrap}>
        <motion.button type="button" className={styles.ctaBtn} onClick={handleSubmit} disabled={submitting} whileTap={{ scale: 0.98 }}>
          {submitting ? 'Publishing…' : 'Publish report'}
          {!submitting && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
}
