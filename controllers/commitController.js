const { model } = require('../database/model');
const { db } = require('../database/db');
const dotenv = require('dotenv');
dotenv.config();

let cachedCommits = [];

async function retrieveCommits(req, res) {
  try {
    console.log('Retrieving commits...');
    const { user_github_id, owner_github_id, repo_github_id, gitcat_secret } = req.query;
    if (!user_github_id || !owner_github_id || !repo_github_id || !gitcat_secret) throw new Error('user_github_id, owner_github_id, repo_github_id, or gitcat_secret is not given');
    if (gitcat_secret !== process.env.GITCAT_SECRET) throw new Error('gitcat_secret does not match!');

    const user = await model.GetUserByUserGithubId(user_github_id);
    if (!user) throw new Error('User not found');
    console.log('User:', user);

    const owner = await model.GetOwnerByOwnerGithubId(owner_github_id);
    if (!owner) throw new Error('Owner not found');
    console.log('Owner:', owner);

    const repo = await model.GetRepoByRepoGithubId(owner_github_id, repo_github_id);
    if (!repo) throw new Error('Repository not found');
    console.log('Repo:', repo);

    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: user.access_token });

    // Fetch commits for the specified repository
    const { data: commits } = await octokit.repos.listCommits({
      owner: owner.owner_name,
      repo: repo.repo_name
    });

    console.log('Fetched commits from GitHub:', commits.length);

    // Transform commits data to a suitable format and store in the database
    commit_obj_list = [];
    for (const commit of commits) {
      const transformedCommit = {
        ai_labeled: 0,  // Assuming AI labeling is not done yet
        commit_msg: commit.commit.message,
        commit_date: new Date(commit.commit.author.date),
        til_id: null,  // Assuming no TIL ID associated yet
        issue_id_list: JSON.stringify([]),  // Assuming no issues associated yet
        owner_github_id: owner_github_id,
        repo_github_id: repo_github_id,
        commit_github_id: commit.sha,
      };

      // Insert into database
      const [result] = await db.execute(
        'INSERT INTO Commits (ai_labeled, commit_msg, commit_date, til_id, issue_id_list, owner_github_id, repo_github_id, commit_github_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE commit_msg = VALUES(commit_msg), commit_date = VALUES(commit_date)',
        [
          transformedCommit.ai_labeled,
          transformedCommit.commit_msg,
          transformedCommit.commit_date,
          transformedCommit.til_id,
          transformedCommit.issue_id_list,
          transformedCommit.owner_github_id,
          transformedCommit.repo_github_id,
          transformedCommit.commit_github_id
        ]
      );

      transformedCommit.commit_id = result.insertId || (await db.execute(
        'SELECT commit_id FROM Commits WHERE commit_github_id = ?',
        [commit.sha]
      ))[0][0].commit_id;

      commit_obj_list.push(transformedCommit);
    }

    console.log(`Commits for repository ${repo.repo_name}:`, commit_obj_list);
    res.status(200).json({ status: 'success', commits: commit_obj_list });
  } catch (error) {
    console.error('Error retrieving commits:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

function fetchCommits(req, res) {
  try {
    console.log('Fetching cached commits...');
    res.status(200).json({ status: 'success', commits: cachedCommits });
  } catch (error) {
    console.error('Error fetching cached commits:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

module.exports = {
  retrieveCommits,
  fetchCommits
};
