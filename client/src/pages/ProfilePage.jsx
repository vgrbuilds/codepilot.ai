import { useState, useEffect } from 'react';
import { 
  UserOutlined, 
  MailOutlined, 
  GithubOutlined, 
  SaveOutlined, 
  DeleteOutlined, 
  LoadingOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const ProfilePage = ({ user, onUpdateProfile, onDeleteAccount, onLogout }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setError('Username and email cannot be empty.');
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await onUpdateProfile(username, email);
      if (res.success) {
        setSuccess('Profile updated successfully.');
        setEditing(false);
      } else {
        setError(res.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('An error occurred while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    try {
      const res = await onDeleteAccount();
      if (!res.success) {
        setError(res.error || 'Failed to delete account.');
        setShowDeleteModal(false);
      }
    } catch (err) {
      setError('An error occurred during account deletion.');
    }
  };

  if (!user) return null;

  return (
    <div className="flex-grow flex flex-col max-w-3xl mx-auto w-full text-left relative z-10 select-none">
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-white">Developer Profile & Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Manage your connected account details, sync statistics, and credentials configuration.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 flex flex-col gap-5 p-5 rounded-2xl border border-slate-900 bg-slate-950/20 backdrop-blur-md">
          <div className="relative mx-auto mt-2">
            <img 
              src={user.avatarUrl} 
              alt={user.username} 
              className="h-20 w-20 rounded-full border-2 border-blue-500 shadow-md shadow-blue-500/10"
            />
            <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-blue-400 shadow-sm">
              <GithubOutlined className="text-xs" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-bold text-white">{user.username}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">@{user.githubUsername}</p>
          </div>

          <div className="border-t border-slate-900 pt-4 mt-2">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-3">Sync Statistics</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center bg-[#070b14] px-3.5 py-2.5 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-450 font-semibold">Repos Indexed</span>
                <span className="text-xs font-extrabold text-white">{user.stats?.reposAnalyzed || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-[#070b14] px-3.5 py-2.5 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-450 font-semibold">Queries Asked</span>
                <span className="text-xs font-extrabold text-white">{user.stats?.questionsAsked || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Edit Form */}
        <div className="md:col-span-2 flex flex-col p-6 rounded-2xl border border-slate-900 bg-slate-950/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-900">
            <span className="text-xs font-bold text-white">General Information</span>
            {!editing && (
              <button 
                onClick={() => setEditing(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                Edit Details
              </button>
            )}
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-xs">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs font-medium text-slate-350">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserOutlined />
                </span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!editing || saving}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/30 border border-slate-900 focus:border-blue-500/50 focus:outline-none rounded-xl text-xs text-slate-200 placeholder-slate-600 disabled:opacity-50"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <MailOutlined />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing || saving}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/30 border border-slate-900 focus:border-blue-500/50 focus:outline-none rounded-xl text-xs text-slate-200 placeholder-slate-600 disabled:opacity-50"
                  placeholder="Email"
                />
              </div>
            </div>

            {editing && (
              <div className="flex gap-2.5 pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-650 hover:bg-blue-600 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <LoadingOutlined className="animate-spin" /> : <SaveOutlined />}
                  <span>Save Changes</span>
                </button>
                <button 
                  type="button"
                  disabled={saving}
                  onClick={() => { setEditing(false); setError(''); }}
                  className="px-4 py-2 rounded-xl border border-slate-800 bg-[#070b14] hover:text-white hover:border-slate-700 text-slate-400 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Danger Zone */}
          {!editing && (
            <div className="mt-8 pt-6 border-t border-slate-900 text-left">
              <div className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-2">Danger Zone</div>
              <p className="text-[10px] text-slate-500 mb-4">Permanently erase your account, active workspace projects, message logs, and codebase chunk vector databases.</p>
              
              {!showDeleteModal ? (
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 rounded-xl border border-red-950/30 bg-red-950/10 hover:bg-red-950/20 text-red-450 hover:text-red-400 hover:border-red-900/40 font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-[10px]"
                >
                  <DeleteOutlined />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl border border-red-950/30 bg-red-950/15 max-w-md">
                  <div className="flex gap-2 text-red-450 items-start mb-3">
                    <ExclamationCircleOutlined className="text-sm mt-0.5" />
                    <span className="text-[10px] font-bold">This operation is irreversible! Are you sure?</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-3 py-1.5 bg-red-650 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Yes, Delete Account
                    </button>
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="px-3 py-1.5 border border-slate-800 bg-[#070b14] hover:text-white rounded-lg text-[10px] font-bold text-slate-450 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
