import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import FetchPage from './pages/FetchPage';
import SentimentPage from './pages/SentimentPage';
import ReplyPage from './pages/ReplyPage';
import RunAllPage from './pages/RunAllPage';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);

  // Toggle Dark Mode
  useEffect(() => {
    // Check local storage or system preference if needed in future
    // For now, default to false or stick to simple toggle
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'fetch':
        return <FetchPage onNavigate={setCurrentPage} />;
      case 'sentiment':
        return <SentimentPage onNavigate={setCurrentPage} />;
      case 'replies':
        return <ReplyPage onNavigate={setCurrentPage} />;
      case 'run-all':
        return <RunAllPage onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col">
      <Header 
        onNavigate={setCurrentPage} 
        activePage={currentPage}
        toggleTheme={toggleTheme}
        darkMode={darkMode}
      />
      
      <main className="flex-1 pt-24 pb-48 px-4 relative z-10">
         {renderPage()}
      </main>

      <Footer onNavigate={setCurrentPage} />

      <ToastContainer position="bottom-right" theme={darkMode ? "dark" : "light"} />
    </div>
  );
}

export default App;
