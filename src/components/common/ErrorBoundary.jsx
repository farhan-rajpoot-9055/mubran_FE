import { Component } from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-state" style={{ minHeight: '60vh', display: 'grid', placeContent: 'center' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h1 className="page-state__title">Something went wrong</h1>
            <p className="page-state__text mb-4">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button type="button" className="btn btn--primary" onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
            <Link to="/" className="btn btn--outline" style={{ marginLeft: '0.6rem' }}>
              Go home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;