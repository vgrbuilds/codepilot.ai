import { CommentOutlined, DeleteOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons';
import MarkdownRenderer from './MarkdownRenderer.jsx';

const ChatTab = ({ 
  messages, 
  inputMessage, 
  setInputMessage, 
  sending, 
  onSubmit, 
  onClear, 
  messagesEndRef 
}) => {
  return (
    <div className="flex-grow flex flex-col min-h-0 relative">
      
      {/* Clear conversation logs */}
      {messages.length > 0 && (
        <button 
          onClick={onClear}
          className="absolute right-0 top-0 text-[10px] text-slate-500 hover:text-slate-350 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer select-none"
        >
          <DeleteOutlined /> Clear History
        </button>
      )}

      {/* Messages Logs */}
      <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4 text-xs min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10 select-none">
            <CommentOutlined className="text-3xl mb-3 text-slate-650" />
            <p className="font-bold text-xs text-slate-400">CodePilot Chat Workspace</p>
            <p className="text-[10px] mt-1 text-slate-500 max-w-xs text-center leading-relaxed">Ask questions about architectural patterns, API schemas, dependency layers, or layout scripts in this project.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="flex gap-3 text-left">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-bold select-none text-[10px] ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-slate-350' 
                  : 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              }`}>
                {msg.role === 'user' ? 'U' : 'CP'}
              </div>
              <div className={`px-4 py-2.5 rounded-xl border max-w-[85%] select-text leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-950/20 border-slate-900 text-slate-300 whitespace-pre-wrap'
                  : 'bg-slate-950/40 border-blue-900/15 text-slate-200'
              }`}>
                {msg.role === 'user' ? (
                  <div>{msg.content}</div>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
                
                {/* Render references/sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-900/60 select-none">
                    <div className="text-[9px] text-slate-550 uppercase tracking-widest font-bold mb-1.5">Referenced Files</div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <span key={i} className="text-[9px] bg-slate-900 text-slate-450 px-2 py-0.5 rounded font-mono border border-slate-850">
                          📄 {src.filePath.split('/').pop()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {sending && (
          <div className="flex gap-3 text-left">
            <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px] select-none font-bold">
              <LoadingOutlined className="animate-spin" />
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-900/60 text-slate-450 italic">
              Thinking, codebase retrieval parsing in progress...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Box */}
      <form onSubmit={onSubmit} className="flex gap-2 bg-[#090d16] border border-slate-900 p-2.5 rounded-xl">
        <input 
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask CodePilot anything about the codebase..."
          className="flex-grow bg-slate-950/40 border border-slate-900 rounded-lg px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          disabled={sending}
        />
        <button 
          type="submit"
          disabled={sending || !inputMessage.trim()}
          className="bg-blue-650 hover:bg-blue-600 text-white rounded-lg px-4 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30"
        >
          <SendOutlined className="text-xs" />
        </button>
      </form>

    </div>
  );
};

export default ChatTab;
