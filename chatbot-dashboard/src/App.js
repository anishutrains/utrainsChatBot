import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import ConversationView from './components/ConversationView';
import Settings from './components/Settings';
import Contact from './components/contacts';
import Login from './components/Login';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div style={{ display: 'flex', flex: 1 }}>
          {isAuthenticated && <Sidebar />}
          <main style={{ padding: '20px', flex: 1 }}>
            <Routes>
              <Route
                path="/login"
                element={<Login onLoginSuccess={handleLoginSuccess} />}
              />
              {isAuthenticated ? (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/user/:id" element={<ConversationView />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/contacts" element={<Contact />} />
                </>
              ) : (
                <Route path="*" element={<Navigate to="/login" />} />
              )}
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
