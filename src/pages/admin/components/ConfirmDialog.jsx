import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ open, title, text, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className={`confirm ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="confirm__backdrop" aria-label="Cancel" onClick={onCancel} />
      <div className="confirm__panel">
        <h3 className="confirm__title">
          <AlertTriangle size={20} style={{ color: 'var(--danger)' }} /> {title}
        </h3>
        <p className="confirm__text">{text}</p>
        <div className="confirm__actions">
          <button type="button" className="btn btn--outline" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;