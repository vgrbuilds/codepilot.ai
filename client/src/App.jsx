import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import RepositoriesPage from './pages/RepositoriesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { 
  ProjectOutlined, 
  SyncOutlined, 
  UserOutlined, 
  LogoutOutlined,
  RobotOutlined 
} from '@ant-design/icons';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('landing'); // 'landing' or 'dashboard'
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'repos', 'profile'

  // Fetch the user profile from backend
  const fetchProfile = async (token) => {
    try {
      const res = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        setView('landing');
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      localStorage.removeItem('token');
      setView('landing');
    } finally {
      setLoading(false);
    }
  };

  // Exchange GitHub temp code for API JWT session token
  const handleOAuthCallback = async (code) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      
      if (res.ok && data.token && data.user) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setView('dashboard');
      } else {
        console.error("OAuth callback error:", data.error);
      }
    } catch (err) {
      console.error("OAuth exchange failed:", err);
    } finally {
      // Clean up URL parameters in browser history
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, document.title, url.pathname);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      setTimeout(() => {
        handleOAuthCallback(code);
      }, 0);
    } else if (token) {
      setTimeout(() => {
        fetchProfile(token);
        setView('dashboard');
      }, 0);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('landing');
  };

  const handleUpdateProfile = async (username, email) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, error: "Authentication token missing." };

    try {
      const res = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(prev => ({ ...prev, ...data.user }));
        return { success: true };
      } else {
        return { success: false, error: data.error || "Failed to update profile." };
      }
    } catch (err) {
      console.error("Update profile failed:", err);
      return { success: false, error: "Network connection error occurred." };
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, error: "Authentication token missing." };

    try {
      const res = await fetch('http://localhost:8000/api/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem('token');
        setUser(null);
        setView('landing');
        return { success: true };
      } else {
        return { success: false, error: data.error || "Failed to delete account." };
      }
    } catch (err) {
      console.error("Account deletion failed:", err);
      return { success: false, error: "Network connection error occurred." };
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#030712] flex items-center justify-center text-slate-300 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-slate-800 border-t-blue-500 animate-spin"></div>
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">Establishing session...</p>
        </div>
      </div>
    );
  }

  if (view === 'landing' || !user) {
    return (
      <LandingPage 
        user={user} 
        onLogout={handleLogout} 
        onUpdateProfile={handleUpdateProfile} 
        onDeleteAccount={handleDeleteAccount}
        onLaunchDashboard={() => setView('dashboard')}
      />
    );
  }

  // Dashboard Workspace Layout
  return (
    <div className="h-screen bg-[#060911] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900/60 bg-[#060911]/80 backdrop-blur-md relative">
        <div className="mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            onClick={() => setView('landing')} 
            className="flex items-center gap-2.5 text-md font-bold tracking-tight text-white group cursor-pointer select-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <RobotOutlined className="text-base" />
            </div>
            <span>
              CodePilot<span className="text-blue-500 font-extrabold">.ai</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img 
              src={user.avatarUrl} 
              alt={user.username} 
              className="h-7 w-7 rounded-full border border-blue-500 shadow-sm"
            />
            <span className="text-slate-300 text-xs font-semibold hidden sm:inline">{user.username}</span>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 rounded border border-slate-800 bg-transparent text-slate-400 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <LogoutOutlined className="text-xs" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-grow flex flex-col md:flex-row relative z-10 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 border-r border-slate-900 bg-[#070b15]/60 backdrop-blur-md p-4 flex flex-col gap-1 shrink-0 select-none overflow-y-auto">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 mb-3">Navigation</div>
          
          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'projects' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <ProjectOutlined className="text-sm" />
            <span>Active Projects</span>
          </button>

          <button 
            onClick={() => setActiveTab('repos')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'repos' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <SyncOutlined className="text-sm" />
            <span>Sync Repositories</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'profile' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <UserOutlined className="text-sm" />
            <span>Settings & Profile</span>
          </button>

          <div className="mt-auto pt-6 border-t border-slate-900 px-3 hidden md:block">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Usage Stats</div>
            <div className="grid grid-cols-2 gap-2 mt-2 select-none">
              <div className="bg-[#0b1120] p-2.5 rounded-lg border border-slate-900">
                <div className="text-[8px] text-slate-500 font-bold uppercase">Repos</div>
                <div className="text-xs font-bold text-white mt-0.5">{user.stats?.reposAnalyzed || 0}</div>
              </div>
              <div className="bg-[#0b1120] p-2.5 rounded-lg border border-slate-900">
                <div className="text-[8px] text-slate-500 font-bold uppercase">Chats</div>
                <div className="text-xs font-bold text-white mt-0.5">{user.stats?.questionsAsked || 0}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Workspace Main Panel */}
        <main className="flex-grow p-6 flex flex-col overflow-hidden min-w-0">
          {activeTab === 'projects' && <HomePage user={user} onRefreshProfile={() => fetchProfile(localStorage.getItem('token'))} />}
          {activeTab === 'repos' && <RepositoriesPage onNavigateToProjects={() => setActiveTab('projects')} />}
          {activeTab === 'profile' && (
            <ProfilePage 
              user={user} 
              onUpdateProfile={handleUpdateProfile} 
              onDeleteAccount={handleDeleteAccount} 
              onLogout={handleLogout} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
