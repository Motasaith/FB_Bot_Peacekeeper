import { Headset, Moon, Sun } from 'lucide-react';

const Header = ({ onNavigate, currentPage, darkMode, toggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm dark:shadow-lg transition-all">
      <div className="flex items-center gap-2 text-blue-600 dark:text-emerald-400">
        <Headset size={32} />
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            FB <span className="text-blue-600 dark:text-emerald-400">Automator</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <nav className="flex gap-2">
            <button 
            onClick={() => onNavigate('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'dashboard' 
                    ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
            >
            Dashboard
            </button>

        </nav>

        <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Toggle Theme"
        >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
