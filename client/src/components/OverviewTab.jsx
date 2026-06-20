import { ProjectOutlined } from '@ant-design/icons';
import MarkdownRenderer from './MarkdownRenderer.jsx';

const OverviewTab = ({ summary }) => {
  return (
    <div className="space-y-4 max-w-3xl text-left select-text overflow-y-auto h-full pr-2 min-h-0">
      <div className="flex items-center gap-2 text-white font-bold text-sm select-none">
        <ProjectOutlined className="text-blue-400" />
        <span>Repository Analysis Summary</span>
      </div>
      {summary ? (
        <div className="bg-slate-950/25 p-5 rounded-xl border border-slate-900">
          <MarkdownRenderer content={summary} />
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">No summary generated. Wait a moment for analysis to complete.</p>
      )}
    </div>
  );
};

export default OverviewTab;
