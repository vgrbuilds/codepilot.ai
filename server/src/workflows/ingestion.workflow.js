import { getRepositoryTree, getFileBlob } from '../services/github.service.js';
import { splitAndEmbedFile } from '../agents/ingestion.agent.js';
import { saveChunks } from '../services/chunk.service.js';
import { updateIngestionStatus } from '../services/project.service.js';
import { updateRepositoryStatus } from '../services/repository.service.js';
import { runAnalysisWorkflow } from './analysis.workflow.js';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';

const parseGithubUrl = (url) => {
  try {
    const parsed = new URL(url);
    const paths = parsed.pathname.split('/').filter(Boolean);
    if (paths.length >= 2) {
      return { owner: paths[0], repoName: paths[1].replace('.git', '') };
    }
    throw new Error('Invalid URL format');
  } catch (e) {
    const cleanUrl = url.replace('https://github.com/', '');
    const parts = cleanUrl.split('/');
    return { owner: parts[0], repoName: parts[1]?.replace('.git', '') || '' };
  }
};

const isProcessableFile = (filePath) => {
  const excludePatterns = [
    'node_modules/',
    'bower_components/',
    '.git/',
    '.github/',
    'dist/',
    'build/',
    'out/',
    'coverage/',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'tsconfig.tsbuildinfo'
  ];

  if (excludePatterns.some(pattern => filePath.includes(pattern))) {
    return false;
  }

  const processableExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.json',
    '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs',
    '.go', '.rb', '.php', '.rs', '.swift', '.kt',
    '.html', '.css', '.scss', '.md', '.yml', '.yaml', '.sh'
  ];

  return processableExtensions.some(ext => filePath.endsWith(ext));
};

const getLanguage = (filePath) => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const langMap = {
    js: 'javascript',
    jsx: 'javascript-react',
    ts: 'typescript',
    tsx: 'typescript-react',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rb: 'ruby',
    php: 'php',
    rs: 'rust',
    html: 'html',
    css: 'css',
    md: 'markdown',
    json: 'json'
  };
  return langMap[ext] || 'text';
};

/**
 * Orchestrates repository ingestion, codebase chunking, and embedding.
 */
export const runIngestionWorkflow = async (projectId, repositoryId, githubUrl, branch, accessToken) => {
  console.log(`Ingestion Workflow started for project ${projectId}...`);

  try {
    await updateIngestionStatus(projectId, 'processing');
    await updateRepositoryStatus(repositoryId, 'processing');

    const { owner, repoName } = parseGithubUrl(githubUrl);
    if (!owner || !repoName) {
      throw new Error(`Could not parse owner/repo details from ${githubUrl}`);
    }

    const tree = await getRepositoryTree(owner, repoName, branch, accessToken);
    const processableNodes = tree.filter(node => node.type === 'blob' && isProcessableFile(node.path));

    console.log(`Ingestion: Found ${processableNodes.length} code files to index.`);

    const maxFiles = 80;
    const nodesToIngest = processableNodes.slice(0, maxFiles);

    const chunksToSave = [];
    const summarySamples = [];

    for (const node of nodesToIngest) {
      try {
        const content = await getFileBlob(owner, repoName, node.sha, accessToken);
        if (!content || content.trim() === '') continue;

        const basename = node.path.split('/').pop();
        if (basename === 'README.md' || basename === 'package.json' || node.path.includes('server.js') || node.path.includes('App.jsx') || summarySamples.length < 5) {
          summarySamples.push(`File: ${node.path}\nContent:\n${content.substring(0, 1000)}\n---`);
        }

        const fileChunks = await splitAndEmbedFile(node.path, content);
        
        fileChunks.forEach(c => {
          chunksToSave.push({
            repositoryId,
            filePath: node.path,
            language: getLanguage(node.path),
            content: c.content,
            embedding: c.embedding,
            metadata: {
              ...c.metadata,
              sha: node.sha,
              size: node.size
            }
          });
        });

      } catch (fileError) {
        console.error(`Failed to parse file ${node.path}:`, fileError.message);
      }
    }

    if (chunksToSave.length > 0) {
      console.log(`Ingestion: Saving ${chunksToSave.length} codebase chunks to MongoDB...`);
      await saveChunks(chunksToSave);
    }

    console.log('Ingestion: Triggering Analysis Workflow for summary report...');
    const filesList = nodesToIngest.map(n => ({ path: n.path, size: n.size }));
    const codeSamples = summarySamples.join('\n\n');
    await runAnalysisWorkflow(projectId, filesList, codeSamples);

    await updateIngestionStatus(projectId, 'completed');
    await updateRepositoryStatus(repositoryId, 'completed');

    const project = await Project.findById(projectId);
    if (project) {
      await User.findByIdAndUpdate(project.userId, {
        $inc: { 'stats.reposAnalyzed': 1 }
      });
    }

    console.log(`Ingestion Workflow completed successfully for project ${projectId}.`);
  } catch (error) {
    console.error(`Ingestion Workflow failed for project ${projectId}:`, error.message);
    await updateIngestionStatus(projectId, 'failed');
    await updateRepositoryStatus(repositoryId, 'failed');
  }
};