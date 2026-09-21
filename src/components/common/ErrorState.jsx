import { CloudOff } from 'lucide-react';

export function ErrorState({ title = 'Something went wrong', text, action, retry }) {
  return (
    <div className="page-state">
      <div className="page-state__icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
        <CloudOff size={30} />
      </div>
      <h2 className="page-state__title">{title}</h2>
      {text && <p className="page-state__text">{text}</p>}
      {action}
      {retry && (
        <button type="button" className="btn btn--outline btn--sm" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;