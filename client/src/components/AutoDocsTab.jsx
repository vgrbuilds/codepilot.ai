import { FileTextOutlined, LoadingOutlined } from '@ant-design/icons';
import MarkdownRenderer from './MarkdownRenderer.jsx';

const AutoDocsTab = ({ 
  docType, 
  setDocType, 
  documentation, 
  generatingDocs, 
  onGenerate 
}) => {
  return (
    <div className="space-y-6 max-w-4xl text-left overflow-y-auto h-full pr-2 min-h-0">
      
      {/* Header controls trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-950/30 rounded-xl border border-slate-900 select-none">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-650/10 text-blue-400 border border-blue-500/20">
            <FileTextOutlined className="text-lg" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Generate Codebase Documentation</h4>
            <p className="text-[10px] text-slate-455 mt-0.5">Generate technical architecture blueprints, API specifications, and developer guides.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select 
            value={docType} 
            onChange={(e) => setDocType(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-350 px-2 py-1 rounded text-xs focus:outline-none"
            disabled={generatingDocs}
          >
            <option value="comprehensive">Comprehensive Docs</option>
            <option value="api">API Specs</option>
            <option value="architecture">Architecture Blueprint</option>
          </select>
          
          <button 
            onClick={onGenerate}
            disabled={generatingDocs}
            className="bg-blue-650 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            {generatingDocs ? (
              <>
                <LoadingOutlined className="animate-spin" /> Documenting...
              </>
            ) : (
              <>
                <FileTextOutlined /> Run Docs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress placeholder */}
      {generatingDocs && (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-950/10 rounded-xl border border-slate-900 select-none">
          <LoadingOutlined className="text-2xl animate-spin text-blue-500 mb-3" />
          <span className="text-xs font-semibold">Generating Documentation manuals...</span>
          <span className="text-[10px] text-slate-550 mt-1">This typically takes 10-15 seconds.</span>
        </div>
      )}

      {/* Compiled documentation report output */}
      {!generatingDocs && documentation && (
        <div className="bg-slate-950/25 p-6 rounded-xl border border-slate-900 select-text">
          <MarkdownRenderer content={documentation} />
        </div>
      )}
    </div>
  );
};

export default AutoDocsTab;
