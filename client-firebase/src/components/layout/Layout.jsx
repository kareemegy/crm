import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import {
  LayoutProvider, useLayout, notifyClientsChanged
} from './LayoutContext.jsx';
import ClientFormModal from '../clients/ClientFormModal.jsx';
import { ConfirmProvider } from '../ui/ConfirmDialog.jsx';
import ToastHost from '../ui/ToastHost.jsx';
import { startRealtime, stopRealtime } from '../../realtime/firestore.js';

function Shell() {
  const { addClientOpen, closeAddClient } = useLayout();
  const { pathname } = useLocation();

  useEffect(() => {
    startRealtime();
    return () => stopRealtime();
  }, []);

  return (
    <div className="flex h-full bg-ink-bg dark:bg-night-bg text-ink-text dark:text-night-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main key={pathname} className="flex-1 overflow-auto animate-fade-in">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <ClientFormModal
        open={addClientOpen}
        onClose={closeAddClient}
        onSaved={() => { closeAddClient(); notifyClientsChanged(); }}
      />

      <ToastHost />
    </div>
  );
}

export default function Layout() {
  return (
    <LayoutProvider>
      <ConfirmProvider>
        <Shell />
      </ConfirmProvider>
    </LayoutProvider>
  );
}
