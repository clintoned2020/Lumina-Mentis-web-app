import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Root render error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>App failed to render</h1>
          <p style={{ marginBottom: 12 }}>A runtime error occurred during startup.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Initialize Google Analytics from environment variable
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_ID) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
}

const root = ReactDOM.createRoot(document.getElementById('root'));

async function bootstrap() {
  try {
    const { default: App } = await import('@/App.jsx');
    root.render(
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    );
  } catch (error) {
    console.error('Startup import error:', error);
    root.render(
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Startup module failed</h1>
        <p style={{ marginBottom: 12 }}>A file failed to load during app startup.</p>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
          {String(error?.message || error)}
        </pre>
      </div>
    );
  }
}

bootstrap();