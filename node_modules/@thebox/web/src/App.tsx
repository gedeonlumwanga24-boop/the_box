import { useState } from 'react';
import './App.css';
import { AdminProductsPage } from './features/admin/AdminProductsPage';
import { StorefrontPage } from './features/client/StorefrontPage';

export default function App() {
  const [activeView, setActiveView] = useState<'client' | 'admin'>('client');

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-brand">THE BOX</div>

        <div className="app-segmented-control" aria-label="Toggle de vue">
          <button
            type="button"
            className={activeView === 'client' ? 'segment active' : 'segment'}
            onClick={() => setActiveView('client')}
          >
            Client
          </button>
          <button
            type="button"
            className={activeView === 'admin' ? 'segment active' : 'segment'}
            onClick={() => setActiveView('admin')}
          >
            Admin
          </button>
        </div>
      </header>

      {activeView === 'client' ? <StorefrontPage /> : <AdminProductsPage />}
    </div>
  );
}

