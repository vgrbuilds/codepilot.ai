import { DeleteOutlined } from '@ant-design/icons';

const ProjectHeader = ({ project, onDelete }) => {
  return (
    <div className="px-6 py-4 border-b border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/20 text-left">
      <div>
        <h2 className="text-base font-extrabold text-white">{project.github.name}</h2>
        <div className="text-[10px] text-slate-450 mt-1 select-none">
          URL: <a href={project.github.url} target="_blank" rel="noreferrer" className="text-blue-450 font-mono hover:underline">{project.github.fullName}</a>
          <span className="mx-2">•</span>
          Branch: <span className="text-slate-400 font-mono">{project.github.branch}</span>
        </div>
      </div>

      <button 
        onClick={onDelete}
        className="text-slate-500 hover:text-red-400 hover:border-red-900/40 p-1.5 rounded-lg border border-transparent hover:bg-red-950/10 transition-all duration-200 cursor-pointer self-end sm:self-auto"
        title="Disconnect Project Workspace"
      >
        <DeleteOutlined className="text-sm" />
      </button>
    </div>
  );
};

export default ProjectHeader;
