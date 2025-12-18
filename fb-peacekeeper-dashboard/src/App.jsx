import React from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import WatcherPanel from './components/Watcher/WatcherPanel';

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      <main>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'watcher' && <WatcherPanel />}
      </main>
      <ToastContainer position="bottom-right" theme="colored" autoClose={3000} />
    </div>
  );
}

export default App;
