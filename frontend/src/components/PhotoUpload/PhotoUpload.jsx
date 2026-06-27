import { useRef, useState } from 'react';
import styles from './PhotoUpload.module.css';
import { uploadPhoto } from '../../api/client.js';

function compressImage(file, maxWidth = 1000, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    };
    img.onerror = reject;
    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_BYTES = 2 * 1024 * 1024;

export default function PhotoUpload({ onUploaded }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  async function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('uploading');
    setErrorMsg('');
    try {
      const blob = await compressImage(file);
      if (blob.size > MAX_BYTES) {
        setStatus('error');
        setErrorMsg('Image is too large (max 2 MB). Try a lower resolution photo.');
        onUploaded(null);
        return;
      }
      setPreviewUrl(URL.createObjectURL(blob));
      const publicUrl = await uploadPhoto(blob);
      onUploaded(publicUrl);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Upload failed — tap to retry');
      onUploaded(null);
    }
  }

  function handleRemove(e) {
    e.stopPropagation();
    setPreviewUrl(null);
    setStatus('idle');
    setErrorMsg('');
    onUploaded(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.hiddenInput}
        onChange={handleChange}
      />
      <button
        type="button"
        className={`${styles.slot} ${status === 'uploading' ? styles.slotUploading : ''}`}
        onClick={() => inputRef.current?.click()}
        aria-label="Add photo"
      >
        {status === 'uploading' ? (
          <span className={styles.spinner} />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </button>
      {previewUrl && (
        <div className={styles.thumb}>
          <img src={previewUrl} alt="Preview" className={styles.thumbImg} />
          <button type="button" className={styles.removeBtn} onClick={handleRemove} aria-label="Remove photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
      {status === 'error' && <span className={styles.errorText}>{errorMsg}</span>}
    </div>
  );
}
