import axios from 'axios';

/**
 * Service handling interaction with the GitHub API.
 */

export const exchangeCodeForToken = async (code) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('GitHub Client ID or Client Secret is not configured in environment variables.');
  }

  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error_description || response.data.error);
    }

    return response.data.access_token;
  } catch (error) {
    console.error('exchangeCodeForToken error:', error.message);
    throw new Error(`GitHub token exchange failed: ${error.message}`);
  }
};

export const getGithubProfile = async (accessToken) => {
  try {
    const userRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    const profile = userRes.data;

    let email = profile.email;
    try {
      const emailsRes = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });
      const primaryEmailObj = emailsRes.data.find(e => e.primary && e.verified) || emailsRes.data[0];
      if (primaryEmailObj) {
        email = primaryEmailObj.email;
      }
    } catch (e) {
      console.warn('Could not fetch user emails from GitHub:', e.message);
    }

    return {
      id: profile.id.toString(),
      username: profile.login,
      email: email || '',
      avatarUrl: profile.avatar_url
    };
  } catch (error) {
    console.error('getGithubProfile error:', error.message);
    throw new Error(`Failed to fetch GitHub profile: ${error.message}`);
  }
};

export const getUserRepositories = async (accessToken) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      params: {
        per_page: 100,
        sort: 'updated',
        affiliation: 'owner,collaborator'
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    return response.data.map(repo => ({
      githubId: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      branch: repo.default_branch || 'main',
      private: repo.private
    }));
  } catch (error) {
    console.error('getUserRepositories error:', error.message);
    throw new Error(`Failed to fetch GitHub repositories: ${error.message}`);
  }
};

export const getRepositoryTree = async (owner, repo, branch, accessToken) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}`,
      {
        params: { recursive: 1 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    if (response.data.truncated) {
      console.warn('GitHub tree response was truncated due to repository size.');
    }

    return response.data.tree || [];
  } catch (error) {
    console.error(`getRepositoryTree error for ${owner}/${repo}:`, error.message);
    throw new Error(`Failed to read repository files tree from GitHub: ${error.message}`);
  }
};

export const getFileBlob = async (owner, repo, sha, accessToken) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    const data = response.data;
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf8');
    }
    
    return data.content || '';
  } catch (error) {
    console.error(`getFileBlob error for sha ${sha}:`, error.message);
    throw new Error(`Failed to fetch file content from GitHub: ${error.message}`);
  }
};