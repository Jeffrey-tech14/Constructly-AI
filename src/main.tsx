import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { PlanProvider } from '@/contexts/PlanContext';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById("root")!).render(
  <HashRouter>
  <PlanProvider>
    <AuthProvider>
    <App />
    </AuthProvider>
  </PlanProvider>
  </HashRouter>);
