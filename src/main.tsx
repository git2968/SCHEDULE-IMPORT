import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { CustomAppsProvider } from './context/CustomAppsContext';
import { CustomCategoriesProvider } from './context/CustomCategoriesContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <SettingsProvider>
          <ScheduleProvider>
            <CustomCategoriesProvider>
              <CustomAppsProvider>
                <App />
                <ToastContainer 
                  position="top-right" 
                  autoClose={3000} 
                  closeButton={true}
                  theme="light"
                />
              </CustomAppsProvider>
            </CustomCategoriesProvider>
          </ScheduleProvider>
        </SettingsProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
); 