import { PackageOpen } from 'lucide-react';

export function EmptyState({ icon: Icon = PackageOpen, title, text, action }) {
  return (
    <div className="page-state">
      <div className="page-state__icon">
        <Icon size={30} />
      </div>
      <h2 className="page-state__title">{title}</h2>
      {text && <p className="page-state__text">{text}</p>}
      {action}
    </div>
  );
}

export default EmptyState;