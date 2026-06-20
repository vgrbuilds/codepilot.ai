/**
 * GitHub OAuth Authentication service.
 * Redirects the user to GitHub's authorization page.
 */
export const githubOauth = () => {
  const GITHUB_CLIENT_ID = 'Ov23libiQMbU9qeN3E7x';
  const REDIRECT_URI = window.location.origin; // Redirects back to the frontend homepage
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=read:user,user:email`;
  
  // Redirect to GitHub login
  window.location.href = githubAuthUrl;
};
