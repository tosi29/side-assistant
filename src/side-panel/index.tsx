import '../global.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { proxyStore } from '../app/proxyStore';
import SidePanel from './SidePanel';

proxyStore.ready().then(() => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Provider store={proxyStore}>
        <SidePanel />
      </Provider>
    </React.StrictMode>
  );
});
