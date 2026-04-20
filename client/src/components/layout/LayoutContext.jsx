import { createContext, useCallback, useContext, useState } from 'react';

// Layout context for the Add Client modal + the mobile sidebar drawer.
const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [addClientOpen,       setAddClientOpen]       = useState(false);
  const [mobileSidebarOpen,   setMobileSidebarOpen]   = useState(false);

  return (
    <LayoutContext.Provider value={{
      addClientOpen,
      openAddClient:       useCallback(() => setAddClientOpen(true),  []),
      closeAddClient:      useCallback(() => setAddClientOpen(false), []),
      mobileSidebarOpen,
      openMobileSidebar:   useCallback(() => setMobileSidebarOpen(true),  []),
      closeMobileSidebar:  useCallback(() => setMobileSidebarOpen(false), []),
      toggleMobileSidebar: useCallback(() => setMobileSidebarOpen(v => !v), [])
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);

// Cross-component notifications. Pages subscribe via useEffect.
export const notifyProjectsChanged = () =>
  window.dispatchEvent(new CustomEvent('projects:changed'));
export const notifyClientsChanged  = () =>
  window.dispatchEvent(new CustomEvent('clients:changed'));
