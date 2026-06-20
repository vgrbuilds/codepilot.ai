import { analyzeCodebase } from '../agents/analysis.agent.js';
import { updateProjectSummary } from '../services/project.service.js';

/**
 * Analysis workflow coordinates repository structure and sample analysis
 * via the Analysis Agent, formatting it into a clean Markdown layout.
 */
export const runAnalysisWorkflow = async (projectId, filesList, codeSamples) => {
  try {
    console.log(`Analysis Workflow: Triggering codebase analysis for project ${projectId}...`);

    const analysisResult = await analyzeCodebase(filesList, codeSamples);

    const formattedSummary = `### CodePilot.ai Codebase Overview

${analysisResult.summary || 'Overview not available.'}

#### Tech Stack and Languages
${
  analysisResult.stack && analysisResult.stack.length > 0
    ? analysisResult.stack.map(tech => `- **${tech}**`).join('\n')
    : 'No specific frameworks identified.'
}

#### Architecture and Layout
${analysisResult.architecture || 'Default repository directory structure.'}
`;

    await updateProjectSummary(projectId, formattedSummary);
    console.log(`Analysis Workflow completed. Summary updated for project ${projectId}.`);

  } catch (error) {
    console.error('Analysis Workflow failed:', error.message);
    const fallbackText = '### CodePilot.ai Codebase Overview\nCould not generate summary report automatically.';
    await updateProjectSummary(projectId, fallbackText);
  }
};
