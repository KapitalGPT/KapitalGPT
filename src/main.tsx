import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import RetellCallAgentPage from './pages/RetellCallAgentPage.tsx';
import { UserProvider } from './context/UserContext.tsx';


createRoot(document.getElementById('root')!).render(


  <StrictMode>
      <BrowserRouter>
     <UserProvider>
        <Routes>
          <Route
            element={<App />}
            path="/"
          />

          <Route
            element={<RetellCallAgentPage />}
            path="/retell-call-agent"
          />
          <Route
            path="*"
            element={<h1>404 Not Found</h1>}
          />
        </Routes>
    </UserProvider>
      </BrowserRouter>
  </StrictMode>
);
