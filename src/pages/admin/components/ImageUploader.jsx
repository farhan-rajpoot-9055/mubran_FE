import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import api from '../../../api/apiClient.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of Array.from(files).slice(0, 10)) {
        const res = await api.upload('/admin/upload', file);
        uploaded.push(res.data.url);
      }
      onChange([...images, ...uploaded]);
    } catch (e) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="uploader">
      <div
        className="uploader__drop"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        aria-label="Upload product images"
      >
        {uploading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 className="spinner" size={18} /> Uploading…
          </span>
        ) : (
          <>
            <Upload size={24} style={{ margin: '0 auto 0.4rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--ink)' }}>Click or drag images here</p>
            <p style={{ fontSize: '0.8rem' }}>JPG, PNG, WEBP or GIF · up to 5MB each · first image is the cover</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="uploader__previews">
          {images.map((src, i) => (
            <div className="uploader__preview" key={`${src}-${i}`}>
              {i === 0 && (
                <span
                  className="chip-badge chip-badge--rose"
                  style={{ position: 'absolute', left: 4, bottom: 4, zIndex: 2, fontSize: '0.62rem' }}
                >
                  Cover
                </span>
              )}
              <img
                src={src.startsWith('http') ? src : `${window.location.origin}${src}`}
                alt={`Product image ${i + 1}`}
                onError={(e) => { e.currentTarget.style.opacity = '0.25'; }}
              />
              <button
                type="button"
                aria-label={`Remove image ${i + 1}`}
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;