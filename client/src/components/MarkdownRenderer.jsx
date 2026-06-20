import React from 'react';
import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  silent: true
});

const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  try {
    // Parse markdown to HTML
    const htmlContent = marked.parse(content);
    return (
      <div 
        className={`markdown-content select-text ${className}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return <div className={`select-text whitespace-pre-wrap ${className}`}>{content}</div>;
  }
};

export default MarkdownRenderer;
