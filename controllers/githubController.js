const axios = require('axios');
const db = require('../models/db').db;

exports.getOwnersAndRepos = async (req, res) => {
  try {
    if (!!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: No user' });
    }
    if (!req.user.access_token) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: No access token found' });
    }
    const accessToken = req.user.access_token;
    console.log("accessToken", accessToken);

    // GitHub API 호출
    const [userResponse, orgsResponse] = await Promise.all([
      axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${accessToken}` }
      }),
      axios.get('https://api.github.com/user/orgs', {
        headers: { Authorization: `token ${accessToken}` }
      })
    ]);

    const user = userResponse.data;
    const orgs = orgsResponse.data;

    // 사용자와 조직 정보를 데이터베이스에 저장
    await db.execute('INSERT INTO Owners (owner_github_id, owner_name, is_organization) VALUES (?, ?, ?)', [user.id, user.login, 0]);
    for (const org of orgs) {
      await db.execute('INSERT INTO Owners (owner_github_id, owner_name, is_organization) VALUES (?, ?, ?)', [org.id, org.login, 1]);
    }

    // 사용자와 조직의 리포지토리 가져오기
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `token ${accessToken}` }
    });
    const repos = reposResponse.data;

    for (const repo of repos) {
      await db.execute('INSERT INTO Repositories (repo_github_id, repo_name, repo_url, owner_github_id) VALUES (?, ?, ?, ?)', [repo.id, repo.name, repo.html_url, repo.owner.id]);
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error fetching owners and repos:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.fetchRepositoryData = async (req, res) => {
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

    // GitHub API를 통해 특정 리포지토리 데이터 가져오기
    const repoResponse = await axios.get(`https://api.github.com/repos/${repo.owner_github_id}/${repo.repo_name}`, {
      headers: { Authorization: `token ${accessToken}` }
    });

    const repoData = repoResponse.data;

    // 리포지토리 데이터 업데이트
    await db.execute('UPDATE Repositories SET repo_name = ?, repo_url = ? WHERE repo_id = ?', [repoData.name, repoData.html_url, repoId]);

    res.json({ status: 'success', repository: repoData });
  } catch (error) {
    console.error('Error fetching repository data:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
