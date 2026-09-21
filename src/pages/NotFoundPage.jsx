import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Seo } from '../components/common/Seo.jsx';

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page Not Found" description="The page you are looking for could not be found." noIndex />
      <div className="container">
        <div className="page-state" style={{ minHeight: '60vh', justifyContent: 'center' }}>
          <div className="page-state__icon"><Compass size={30} /></div>
          <h1 className="page-state__title" style={{ fontSize: '2rem' }}>404 — Page not found</h1>
          <p className="page-state__text">The link may be broken or the page may have moved.</p>
          <Link to="/" className="btn btn--primary" style={{ marginTop: '0.8rem' }}>Back to Home</Link>
        </div>
      </div>
    </>
  );
}