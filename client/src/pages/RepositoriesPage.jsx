import { useState, useEffect } from 'react';
import { 
  SyncOutlined, 
  SearchOutlined, 
  LoadingOutlined, 
  GithubOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const RepositoriesPage = ({ onNavigateToProjects }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingId, setSyncingId] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch repositories from GitHub via backend
  const fetchGitHubRepositories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/repositories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.repositories) {
        setRepos(data.repositories);
      } else {
        setError(data.error || 'Failed to retrieve GitHub repositories.');
      }
    } catch (err) {
      console.error('Failed fetching repos:', err);
      setError('Network connection error. Failed to load repositories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubRepositories();
  }, []);

  // Filter Repositories based on query
  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sync / Import Repository to Projects
  const handleSyncRepository = async (repo) => {
    setSyncingId(repo.githubId);
    try {
      const res = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          githubId: repo.githubId,
          name: repo.name,
          fullName: repo.fullName,
          url: repo.url,
          branch: repo.branch
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Successfully registered! Navigate to projects dashboard
        onNavigateToProjects();
      } else {
        alert(data.error || 'Failed to sync repository.');
      }
    } catch (err) {
      console.error('Sync repository failed:', err);
      alert('Network error occurred. Failed to start repository sync.');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 select-none">
        <div>
          <h2 className="text-xl font-extrabold text-white">Sync GitHub Repositories</h2>
          <p className="text-xs text-slate-400 mt-1">Select and import a repository to generate AI analytics, summaries, and start chatting.</p>
        </div>
        <button 
          onClick={fetchGitHubRepositories}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg border border-slate-800 bg-[#0b0f19]/40 hover:bg-slate-900/50 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
        >
          {loading ? <LoadingOutlined className="animate-spin" /> : <SyncOutlined />}
          <span>Refresh Repos</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative mb-6 select-none">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <SearchOutlined className="text-xs" />
        </span>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter repositories by name..."
          className="w-full pl-10 pr-4 py-2 bg-slate-950/20 border border-slate-900 focus:border-blue-500/50 focus:outline-none rounded-xl text-xs text-slate-200 placeholder-slate-500 font-medium"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 select-none">
          <LoadingOutlined className="text-2xl animate-spin text-blue-500 mb-3" />
          <span className="text-xs font-semibold">Retrieving your GitHub repositories...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="py-12 flex flex-col items-center justify-center text-center max-w-sm mx-auto select-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
            <ExclamationCircleOutlined className="text-lg" />
          </div>
          <h4 className="text-sm font-bold text-white">Failed to Load Repos</h4>
          <p className="text-xs text-slate-400 mt-2">{error}</p>
          <button 
            onClick={fetchGitHubRepositories}
            className="mt-4 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-550 text-white font-semibold text-xs cursor-pointer transition-colors"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Repos list */}
      {!loading && !error && (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
          {filteredRepos.length === 0 ? (
            <div className="py-16 text-center text-slate-500 border border-dashed border-slate-900 rounded-2xl select-none">
              <GithubOutlined className="text-3xl mb-2" />
              <p className="text-xs font-semibold">No repositories found matching your query.</p>
            </div>
          ) : (
            filteredRepos.map((repo) => (
              <div 
                key={repo.githubId}
                className="p-4 rounded-xl border border-slate-900 bg-slate-950/20 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white truncate">{repo.name}</span>
                    {repo.private && (
                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-bold uppercase select-none">Private</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1 truncate">{repo.fullName}</div>
                </div>

                <button 
                  onClick={() => handleSyncRepository(repo)}
                  disabled={syncingId !== null}
                  className="bg-blue-650 hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {syncingId === repo.githubId ? (
                    <>
                      <LoadingOutlined className="animate-spin text-xs" />
                      <span>Syncing</span>
                    </>
                  ) : (
                    <>
                      <SyncOutlined className="text-xs" />
                      <span>Sync Codebase</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoriesPage;
