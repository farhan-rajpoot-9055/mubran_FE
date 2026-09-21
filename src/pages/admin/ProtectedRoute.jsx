import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-state" style={{ minHeight: '60vh', justifyContent: 'center' }}>
        <Loader2 className="spinner" style={{ width: 34, height: 34 }} />
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}