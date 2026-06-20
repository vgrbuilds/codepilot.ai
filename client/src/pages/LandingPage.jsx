import { useState, useEffect } from "react";
import { 
  GithubOutlined, 
  RobotOutlined, 
  CodeOutlined, 
  ThunderboltOutlined, 
  FileTextOutlined, 
  DeploymentUnitOutlined 
} from "@ant-design/icons";
import { githubOauth } from "../services/githubOauth";

const LandingPage = ({ user, onLogout, onUpdateProfile, onDeleteAccount, onLaunchDashboard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Keep edit inputs synchronized with user changes
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setEditUsername(user.username || "");
        setEditEmail(user.email || "");
      }, 0);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!editUsername.trim() || !editEmail.trim()) {
      setError("Username and email cannot be empty.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await onUpdateProfile(editUsername, editEmail);
    setLoading(false);
    
    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error || "Failed to update profile.");
    }
  };

  const handleDeleteAccountAction = async () => {
    setError("");
    const result = await onDeleteAccount();
    if (!result.success) {
      setError(result.error || "Failed to delete account.");
      setDeleteConfirm(false);
    }
  };

  return (
    <div className="theme-bg-screen font-sans flex flex-col relative overflow-x-hidden pb-12">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[800px] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900/60 bg-[#060911]/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-md font-bold tracking-tight text-white group cursor-pointer select-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <RobotOutlined className="text-base" />
            </div>
            <span>
              CodePilot<span className="text-blue-555 font-extrabold">.ai</span>
            </span>
          </div>

          {/* Dynamically render user state in navigation */}
          {user ? (
            <div className="flex items-center gap-3">
              <img 
                src={user.avatarUrl} 
                alt={user.username} 
                className="h-7 w-7 rounded-full border border-blue-500 shadow-sm"
              />
              <span className="text-slate-300 text-xs font-semibold hidden sm:inline">{user.username}</span>
              <button 
                onClick={onLogout}
                className="px-3 py-1 rounded border border-slate-800 bg-transparent text-slate-400 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={githubOauth}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#000000] border border-slate-800 text-white text-xs font-semibold hover:bg-[#09090b] hover:border-slate-700 transition-all duration-200 cursor-pointer"
            >
              <GithubOutlined className="text-sm" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 flex-grow flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center pt-20 pb-8 w-full">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Introducing CodePilot 1.0
          </div>

          {/* Heading */}
          <h1 className="theme-text-heading max-w-4xl">
            Supercharge your <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              codebase understanding
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-base md:text-lg text-slate-400 leading-relaxed">
            CodePilot connects to your repositories and operates as an expert assistant—helping you map system architecture, generate documentation, and query code logic instantly.
          </p>

          {/* OAuth Login CTA / Welcome Panel */}
          <div className="mt-12 w-full max-w-md">
            
            {user ? (
              isEditing ? (
                /* Editing Profile View */
                <div className="theme-card-portal text-left w-full">
                  <h3 className="text-xl font-extrabold text-white text-center mb-6">
                    Edit Profile Details
                  </h3>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 text-xs">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Username</label>
                      <input 
                        type="text" 
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="Username"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-2 w-full">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 text-sm"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button 
                      onClick={() => { setIsEditing(false); setError(""); }}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-800 bg-slate-900/10 text-slate-400 hover:text-white hover:border-slate-800 transition-all duration-200 cursor-pointer text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-8 pt-6 border-t border-slate-900">
                    <div className="text-[10px] text-red-500 uppercase tracking-wider font-bold mb-2">Danger Zone</div>
                    {deleteConfirm ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-[11px] text-slate-400">Are you absolutely sure? This permanently deletes your profile and clears all synced history from CodePilot.ai.</p>
                        <div className="flex gap-2 mt-1">
                          <button 
                            onClick={handleDeleteAccountAction}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Yes, Delete Account
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(false)}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-850 bg-slate-900/10 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirm(true)}
                        className="w-full px-4 py-2 rounded-xl border border-red-900/40 bg-red-950/10 text-red-450 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900 transition-all duration-200 cursor-pointer text-xs font-semibold text-center"
                      >
                        Delete Account
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Logged In View */
                <div className="theme-card-portal">
                  <div className="relative mb-6">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className="h-16 w-16 rounded-full border-2 border-blue-500 shadow-lg mx-auto"
                    />
                    <div className="absolute bottom-0 right-1/2 translate-x-8 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-blue-400 shadow-sm">
                      <RobotOutlined className="text-[10px]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-white">
                    Welcome back, {user.username}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Authenticated via <span className="text-blue-400 font-mono">{user.email}</span>
                  </p>

                  {/* Profile Stats Summary */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-6 p-4 rounded-xl border border-slate-900 bg-slate-950/40 text-left select-none">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Repos Synced</div>
                      <div className="text-base font-bold text-white mt-0.5">{user.stats?.reposAnalyzed || 0}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Queries Sent</div>
                      <div className="text-base font-bold text-white mt-0.5">{user.stats?.questionsAsked || 0}</div>
                    </div>
                  </div>

                  <div className="mt-6 w-full flex flex-col gap-2">
                    <button 
                      onClick={onLaunchDashboard}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    >
                      <RobotOutlined className="text-base" />
                      <span>Launch Dashboard</span>
                    </button>
                    <div className="flex gap-2 w-full mt-1">
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-850 bg-slate-900/10 text-slate-300 hover:text-white hover:border-slate-800 transition-all duration-200 cursor-pointer text-xs font-semibold"
                      >
                        Edit Profile
                      </button>
                      <button 
                        onClick={onLogout}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-850 bg-slate-900/10 text-slate-450 hover:text-white hover:border-slate-800 transition-all duration-200 cursor-pointer text-xs font-semibold"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Logged Out View */
              <div className="flex flex-col items-center">
                <button 
                  onClick={githubOauth}
                  className="theme-btn-primary group"
                >
                  <GithubOutlined className="text-xl text-white group-hover:scale-110 transition-transform duration-200" />
                  <span>Continue with GitHub</span>
                </button>
                <div className="mt-3 text-[11px] text-slate-500">
                  No credit card required. Sync your public or private repositories.
                </div>
              </div>
            )}

          </div>

          {/* Dashboard Mockup Showcase */}
          <div className="mt-16 w-full max-w-5xl rounded-xl border border-slate-800/80 bg-slate-950/60 p-2 shadow-2xl backdrop-blur-md relative group">
            <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-650 opacity-15 blur-2xl group-hover:opacity-25 transition duration-1000"></div>
            <div className="relative rounded-lg bg-[#0A0E17] border border-slate-800/60 overflow-hidden flex flex-col h-[400px]">
              
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-850 bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  <span className="text-xs text-slate-400 font-mono ml-2">CodePilot Dashboard — react-redux-app</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono bg-slate-850 px-2 py-0.5 rounded border border-slate-800">CONNECTED</div>
              </div>

              {/* Window Body Layout */}
              <div className="flex flex-grow overflow-hidden text-left font-sans text-sm">
                
                {/* Left Sidebar - File Explorer Mockup */}
                <div className="w-48 border-r border-slate-850 bg-[#090C14] p-3 hidden sm:flex flex-col gap-2 font-mono text-xs text-slate-400 select-none">
                  <div className="text-slate-500 font-bold text-[10px] tracking-wider uppercase mb-1">Explorer</div>
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">📁 src</div>
                  <div className="pl-4 flex flex-col gap-1.5 text-slate-400">
                    <div>📁 components</div>
                    <div className="text-blue-400 font-medium">📁 services</div>
                    <div className="pl-4 text-emerald-400">📄 githubOauth.js</div>
                    <div>📁 pages</div>
                    <div className="text-blue-450">📄 App.jsx</div>
                    <div>📄 main.jsx</div>
                  </div>
                  <div className="mt-auto pt-2 border-t border-slate-850 flex items-center gap-1.5 text-slate-500">
                    <span>📦 v1.0.0</span>
                  </div>
                </div>

                {/* Middle Pane - Chat Interface Mockup */}
                <div className="flex-grow flex flex-col bg-[#0A0D16] border-r border-slate-850">
                  {/* Chat History */}
                  <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs">
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 font-bold">U</div>
                      <div className="bg-slate-900 px-3 py-2 rounded-lg text-slate-300 max-w-[85%] border border-slate-800">
                        Where is the GitHub OAuth function implemented and how is it used in the landing page?
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold">CP</div>
                      <div className="bg-slate-950 px-3 py-2 rounded-lg text-slate-300 max-w-[85%] border border-slate-850 space-y-2">
                        <p>The GitHub OAuth logic is exported from <span className="text-emerald-400 font-mono">[githubOauth.js](file:///src/services/githubOauth.js)</span>:</p>
                        <pre className="bg-slate-900 p-2 rounded text-[10px] border border-slate-850 font-mono text-slate-400">
{`export const githubOauth = () => {
  console.log("GitHub OAuth initiated...");
};`}
                        </pre>
                        <p>It is triggered by the <span className="text-blue-400 font-mono">onClick</span> event handler of the "Continue with GitHub" button in <span className="text-blue-400 font-mono">[LandingPage.jsx](file:///src/pages/LandingPage.jsx)</span>.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-3 border-t border-slate-850 bg-[#090C14] flex gap-2">
                    <input type="text" placeholder="Ask CodePilot anything about the codebase..." disabled className="flex-grow bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed" />
                    <button disabled className="bg-blue-600 text-white px-3 py-1 rounded text-xs opacity-50 cursor-not-allowed">Send</button>
                  </div>
                </div>

                {/* Right Pane - Visual Dependency Graph Mockup */}
                <div className="w-56 bg-[#080B13] p-4 hidden lg:flex flex-col gap-3 font-sans text-xs select-none">
                  <div className="text-slate-500 font-bold text-[10px] tracking-wider uppercase mb-1">Architecture</div>
                  
                  <div className="flex flex-col gap-4 items-center justify-center h-full pb-8">
                    <div className="px-3 py-1.5 rounded-md border border-blue-500/30 bg-blue-950/20 text-blue-300 font-mono text-[10px] w-full text-center">main.jsx</div>
                    <div className="h-3 w-0.5 bg-slate-700"></div>
                    <div className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-300 font-mono text-[10px] w-full text-center">App.jsx</div>
                    <div className="h-3 w-0.5 bg-slate-700"></div>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <div className="px-2 py-1 rounded border border-indigo-500/20 bg-indigo-950/10 text-indigo-400 font-mono text-[9px] text-center">LandingPage.jsx</div>
                      <div className="px-2 py-1 rounded border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 font-mono text-[9px] text-center">githubOauth.js</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </section>

        {/* Features / Capabilities Grid */}
        <section className="py-24 w-full border-t border-slate-900">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Built for speed, styled for developer productivity
            </h2>
            <p className="mt-4 text-slate-400 text-sm md:text-base">
              A comprehensive set of tools designed to remove codebase friction.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full">
            
            {/* Feature 1 */}
            <div className="theme-card-feature">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-5">
                <CodeOutlined className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-white">AST Deep Parse</h3>
              <p className="mt-2.5 text-xs text-slate-450 leading-relaxed">
                Indexes code files, libraries, configuration settings, and component maps automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="theme-card-feature">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-5">
                <ThunderboltOutlined className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-white">AI Assistant</h3>
              <p className="mt-2.5 text-xs text-slate-450 leading-relaxed">
                Ask specific questions about business rules, layouts, or functions and get exact, contextual responses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="theme-card-feature">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-5">
                <DeploymentUnitOutlined className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-white">Module Visuals</h3>
              <p className="mt-2.5 text-xs text-slate-450 leading-relaxed">
                Maps out imports, file connections, and function call chains visually.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="theme-card-feature">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-5">
                <FileTextOutlined className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-white">Auto Docs</h3>
              <p className="mt-2.5 text-xs text-slate-450 leading-relaxed">
                Generates module explainers and API outlines automatically as you navigate.
              </p>
            </div>

          </div>

        </section>

        {/* 3-Step Setup Flow */}
        <section className="py-20 w-full border-t border-slate-900 flex flex-col items-center">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Get started in under a minute
            </h2>
            <p className="mt-4 text-slate-400 text-sm">
              Connecting CodePilot to your project workflow is simple.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 w-full max-w-4xl text-center">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-blue-400 font-bold mb-4 font-mono">
                01
              </div>
              <h4 className="text-sm font-bold text-white">Link GitHub Account</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Sign in securely with one-click GitHub OAuth. No setup required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-indigo-400 font-bold mb-4 font-mono">
                02
              </div>
              <h4 className="text-sm font-bold text-white">Index Repository</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Select your project. CodePilot constructs an abstract syntax tree of your codebase.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-purple-400 font-bold mb-4 font-mono">
                03
              </div>
              <h4 className="text-sm font-bold text-white">Explore & Query</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Ask questions, examine architecture maps, and onboard new developers instantly.
              </p>
            </div>

          </div>

          {/* Action button at bottom */}
          {!user && (
            <div className="mt-16">
              <button 
                onClick={githubOauth}
                className="theme-btn-primary group"
              >
                <GithubOutlined className="text-xl text-white group-hover:scale-110 transition-transform duration-200" />
                <span>Connect Repository Now</span>
              </button>
            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950/20 py-10 w-full mt-12 z-10">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold">
            <RobotOutlined className="text-sm text-blue-500" />
            <span>© 2026 CodePilot.ai. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;