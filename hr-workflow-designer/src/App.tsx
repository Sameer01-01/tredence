import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';

function App() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightMode]);

  const toggleTheme = () => setIsLightMode((v) => !v);

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Dashboard isLightMode={isLightMode} toggleTheme={toggleTheme} />} />
          <Route path="/editor" element={<Editor isLightMode={isLightMode} toggleTheme={toggleTheme} />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
