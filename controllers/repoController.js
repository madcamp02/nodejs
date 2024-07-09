import { Octokit } from '@octokit/rest';
import db from '../models/db.js';

export async function getOwnersAndRepos(req, res) {
  try {
    if (!req.user || !req.user.access_token) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: No user' });
    }
    const accessToken = req.user.access_token;
    console.log("accessToken", accessToken);

    const octokit = new Octokit({
      auth: accessToken
    });

    const { data: user } = await octokit.users.getAuthenticated();
    const { data: orgs } = await octokit.orgs.listForAuthenticatedUser();

    await db.execute('INSERT INTO Owners (owner_github_id, owner_name, is_organization) VALUES (?, ?, ?)', [user.id, user.login, 0]);
    for (const org of orgs) {
      await db.execute('INSERT INTO Owners (owner_github_id, owner_name, is_organization) VALUES (?, ?, ?)', [org.id, org.login, 1]);
    }

    const { data: repos } = await octokit.repos.listForAuthenticatedUser();

    for (const repo of repos) {
      await db.execute('INSERT INTO Repositories (repo_github_id, repo_name, repo_url, owner_github_id) VALUES (?, ?, ?, ?)', [repo.id, repo.name, repo.html_url, repo.owner.id]);
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error fetching owners and repos:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function fetchRepositoryData(req, res) {
  try {
    if (!req.user || !req.user.access_token) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: No access token found' });
    }
    const repoId = req.params.repo_id;
    const [repoResult] = await db.execute('SELECT * FROM Repositories WHERE repo_id = ?', [repoId]);
    
    if (repoResult.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Repository not found' });
    }

    const repo = repoResult[0];
    const accessToken = req.user.access_token;

    const octokit = new Octokit({
      auth: accessToken
    });

    const { data: repoData } = await octokit.repos.get({
      owner: repo.owner_github_id,
      repo: repo.repo_name
    });

    await db.execute('UPDATE Repositories SET repo_name = ?, repo_url = ? WHERE repo_id = ?', [repoData.name, repoData.html_url, repoId]);

    res.json({ status: 'success', repository: repoData });
  } catch (error) {
    console.error('Error fetching repository data:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
