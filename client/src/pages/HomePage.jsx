import { useState, useEffect, useRef } from 'react';
import { 
  ProjectOutlined,
  LoadingOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

// Import modular sub-components
import ProjectSidebar from '../components/ProjectSidebar.jsx';
import ProjectHeader from '../components/ProjectHeader.jsx';
import OverviewTab from '../components/OverviewTab.jsx';
import ChatTab from '../components/ChatTab.jsx';
import CodeReviewTab from '../components/CodeReviewTab.jsx';
import AutoDocsTab from '../components/AutoDocsTab.jsx';

const HomePage = ({ user, onRefreshProfile }) => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'chat', 'review', 'docs'

  // Chat States
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Review States
  const [reviewFocus, setReviewFocus] = useState('general');
  const [reviewReport, setReviewReport] = useState('');
  const [generatingReview, setGeneratingReview] = useState(false);

  // Doc States
  const [docType, setDocType] = useState('comprehensive');
  const [documentation, setDocumentation] = useState('');
  const [generatingDocs, setGeneratingDocs] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch Projects List
  const fetchProjects = async (selectId = null) => {
    try {
      const res = await fetch('http://localhost:8000/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.projects) {
        setProjects(data.projects);
        
        if (selectId) {
          const updated = data.projects.find(p => p._id === selectId);
          if (updated) setActiveProject(updated);
        } else if (data.projects.length > 0 && !activeProject) {
          setActiveProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error('Fetch projects failed:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Poll Ingestion Status
  useEffect(() => {
    let interval = null;
    if (activeProject && (activeProject.ingestionStatus === 'pending' || activeProject.ingestionStatus === 'processing')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/projects/${activeProject._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.project) {
            setActiveProject(data.project);
            setProjects(prev => prev.map(p => p._id === data.project._id ? data.project : p));
            
            if (data.project.ingestionStatus === 'completed') {
              clearInterval(interval);
              onRefreshProfile(); // Update usage counts
            } else if (data.project.ingestionStatus === 'failed') {
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Polling project status failed:', err);
        }
      }, 3000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeProject]);

  // Fetch Chat History
  const fetchChatHistory = async () => {
    if (!activeProject || activeProject.ingestionStatus !== 'completed') return;
    try {
      const res = await fetch(`http://localhost:8000/api/chat/${activeProject._id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    setReviewReport('');
    setDocumentation('');
    setActiveTab('summary');
  }, [activeProject?._id]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending || !activeProject) return;

    const tempUserMsg = {
      _id: 'temp-' + Date.now(),
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const res = await fetch(`http://localhost:8000/api/chat/${activeProject._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: tempUserMsg.content })
      });
      const data = await res.json();

      if (res.ok && data.message) {
        setMessages(prev => prev.filter(m => m._id !== tempUserMsg._id).concat(data.message));
        onRefreshProfile();
      } else {
        setMessages(prev => prev.filter(m => m._id !== tempUserMsg._id));
        alert(data.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Send message failed:', err);
      setMessages(prev => prev.filter(m => m._id !== tempUserMsg._id));
    } finally {
      setSending(false);
    }
  };

  // Clear Chat History
  const handleClearChat = async () => {
    if (!activeProject || !window.confirm('Clear all conversation history?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/chat/${activeProject._id}/messages`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages([]);
      }
    } catch (err) {
      console.error('Clear chat failed:', err);
    }
  };

  // Trigger Code Review Agent
  const handleGenerateReview = async () => {
    if (!activeProject || generatingReview) return;
    setGeneratingReview(true);
    setReviewReport('');

    try {
      const res = await fetch(`http://localhost:8000/api/projects/${activeProject._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ focusArea: reviewFocus })
      });
      const data = await res.json();
      if (res.ok && data.report) {
        setReviewReport(data.report);
      } else {
        alert(data.error || 'Failed to generate code review.');
      }
    } catch (err) {
      console.error('Review generation failed:', err);
    } finally {
      setGeneratingReview(false);
    }
  };

  // Trigger Documentation Agent
  const handleGenerateDocs = async () => {
    if (!activeProject || generatingDocs) return;
    setGeneratingDocs(true);
    setDocumentation('');

    try {
      const res = await fetch(`http://localhost:8000/api/projects/${activeProject._id}/docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ docType })
      });
      const data = await res.json();
      if (res.ok && data.documentation) {
        setDocumentation(data.documentation);
      } else {
        alert(data.error || 'Failed to generate documentation.');
      }
    } catch (err) {
      console.error('Documentation generation failed:', err);
    } finally {
      setGeneratingDocs(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    if (!activeProject || !window.confirm(`Are you sure you want to disconnect and delete "${activeProject.github.name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${activeProject._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveProject(null);
        fetchProjects();
        onRefreshProfile();
      }
    } catch (err) {
      console.error('Delete project failed:', err);
    }
  };

  if (loadingProjects) {
    return (
      <div className="flex-grow flex items-center justify-center text-slate-400">
        <LoadingOutlined className="text-xl animate-spin mr-2" />
        <span className="text-xs font-semibold">Loading projects...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center max-w-lg mx-auto text-center py-20 select-none">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-650/10 text-blue-400 border border-blue-500/20 mb-6">
          <ProjectOutlined className="text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-white">No Connected Projects</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          You haven't connected any repositories to CodePilot.ai yet. Go to the "Sync Repositories" tab to import your first GitHub repository.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0">
      
      {/* Sidebar List */}
      <ProjectSidebar 
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onReload={() => fetchProjects(activeProject?._id)}
      />

      {/* Main Workspace Workspace */}
      {activeProject && (
        <div className="flex-grow flex flex-col bg-[#0b0f19]/60 backdrop-blur-md rounded-2xl border border-slate-900/60 overflow-hidden h-full min-h-0">
          
          <ProjectHeader 
            project={activeProject}
            onDelete={handleDeleteProject}
          />

          {/* Ingestion progress or fail block */}
          {activeProject.ingestionStatus !== 'completed' ? (
            <div className="flex-grow flex flex-col items-center justify-center p-8 select-none">
              {activeProject.ingestionStatus === 'failed' ? (
                <div className="flex flex-col items-center text-center max-w-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
                    <ExclamationCircleOutlined className="text-lg" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Indexing Failed</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    An error occurred while fetching, chunking, or generating embeddings for this repository. Please make sure the repository branch exists and contains readable code files.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center max-w-sm">
                  <div className="w-10 h-10 rounded-full border-[3px] border-slate-800 border-t-blue-500 animate-spin mb-4"></div>
                  <h4 className="text-sm font-bold text-white">Indexing Codebase...</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    CodePilot.ai is currently parsing and vectorizing your codebase. This takes between 10 seconds and a few minutes depending on repository size.
                  </p>
                  <div className="mt-4 px-3 py-1 rounded bg-[#0b1120] border border-slate-900 text-[10px] text-blue-400 font-bold uppercase tracking-wider font-mono">
                    STATUS: {activeProject.ingestionStatus}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Main workspace interface tabs */
            <div className="flex-grow flex flex-col min-h-0">
              
              {/* Tab selector buttons */}
              <div className="flex border-b border-slate-900 bg-slate-950/10 px-4 select-none">
                {['summary', 'chat', 'review', 'docs'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                      activeTab === tab 
                        ? 'border-blue-500 text-blue-400' 
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'summary' ? 'Overview' : tab === 'chat' ? 'CodePilot Chat' : tab === 'review' ? 'Code Review' : 'Auto Docs'}
                  </button>
                ))}
              </div>

              {/* Render Selected Tab Panel */}
              <div className="flex-grow flex flex-col p-6 min-h-0 overflow-hidden">
                {activeTab === 'summary' && (
                  <OverviewTab summary={activeProject.summary} />
                )}
                {activeTab === 'chat' && (
                  <ChatTab 
                    messages={messages}
                    inputMessage={inputMessage}
                    setInputMessage={setInputMessage}
                    sending={sending}
                    onSubmit={handleSendMessage}
                    onClear={handleClearChat}
                    messagesEndRef={messagesEndRef}
                  />
                )}
                {activeTab === 'review' && (
                  <CodeReviewTab 
                    reviewFocus={reviewFocus}
                    setReviewFocus={setReviewFocus}
                    reviewReport={reviewReport}
                    generatingReview={generatingReview}
                    onGenerate={handleGenerateReview}
                  />
                )}
                {activeTab === 'docs' && (
                  <AutoDocsTab 
                    docType={docType}
                    setDocType={setDocType}
                    documentation={documentation}
                    generatingDocs={generatingDocs}
                    onGenerate={handleGenerateDocs}
                  />
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default HomePage;
