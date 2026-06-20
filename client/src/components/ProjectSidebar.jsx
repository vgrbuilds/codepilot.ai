import React, { useState } from 'react';
import { 
  ProjectOutlined, 
  ReloadOutlined, 
  LoadingOutlined, 
  FolderOutlined, 
  BranchesOutlined,
  SearchOutlined
} from '@ant-design/icons';

const ProjectSidebar = ({ projects, activeProject, onSelectProject, onReload }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(proj => 
    proj.github.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proj.github.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full lg:w-72 flex flex-col shrink-0 text-left select-none h-full min-h-0 bg-[#070b15]/20 p-4 rounded-2xl border border-slate-900/60 overflow-hidden">
      
      {/* Title & Reload Row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Active Workspaces ({projects.length})</span>
        <button 
          onClick={onReload} 
          className="text-slate-500 hover:text-white cursor-pointer transition-colors"
          title="Reload Workspaces"
        >
          <ReloadOutlined className="text-xs" />
        </button>
      </div>

      {/* Search Input Box */}
      <div className="mb-4 relative px-1">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
          <SearchOutlined />
        </span>
        <input 
          type="text"
          placeholder="Filter workspaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#04060e]/50 border border-slate-900 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30 transition-colors"
        />
      </div>

      {/* Projects List Container */}
      <div className="flex-grow flex flex-col gap-2 overflow-y-auto pr-1 min-h-0">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            No workspaces matched.
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const isActive = activeProject?._id === proj._id;
            return (
              <div 
                key={proj._id}
                onClick={() => onSelectProject(proj)}
                className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col gap-1.5 ${
                  isActive 
                    ? 'bg-blue-950/15 border-blue-500/30' 
                    : 'bg-slate-950/10 border-slate-900/50 hover:bg-slate-900/10 hover:border-slate-850'
                }`}
              >
                {/* Active left indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-[20%] w-[3px] h-[60%] bg-blue-500 rounded-r-md"></div>
                )}

                {/* Header line: name and status */}
                <div className="flex items-start justify-between gap-2 pl-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderOutlined className={`text-xs shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                    <span className="font-bold text-xs text-white truncate max-w-[130px]">{proj.github.name}</span>
                  </div>
                  
                  {/* Status badge */}
                  {proj.ingestionStatus === 'completed' && (
                    <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 select-none">Ready</span>
                  )}
                  {proj.ingestionStatus === 'processing' && (
                    <span className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 select-none">
                      <LoadingOutlined className="animate-spin text-[8px]" /> Ingesting
                    </span>
                  )}
                  {proj.ingestionStatus === 'pending' && (
                    <span className="text-[8px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-450 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 select-none">Queued</span>
                  )}
                  {proj.ingestionStatus === 'failed' && (
                    <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 select-none">Failed</span>
                  )}
                </div>

                {/* Repo full name and branch */}
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium pl-5 min-w-0">
                  <BranchesOutlined className="text-[8px] shrink-0" />
                  <span className="truncate">{proj.github.branch}</span>
                  <span className="text-slate-600">•</span>
                  <span className="truncate max-w-[100px]" title={proj.github.fullName}>{proj.github.fullName.split('/')[0]}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
