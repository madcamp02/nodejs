const { db } = require('../database/db');
const { model } = require('../database/model');
const dotenv = require('dotenv');
dotenv.config();

async function retrieveMlstnsIssuesLabels(req, res) {
  try {
    const msltn_obj_list = [];
    const issue_obj_list = [];
    const label_obj_list = [];

    console.log('retrieving milestones...');
    const { user_github_id, owner_github_id, repo_github_id, gitcat_secret } = req.query;
    if (!user_github_id || !owner_github_id || !repo_github_id || !gitcat_secret) throw new Error('user_github_id, owner_github_id, repo_github_id, or gitcat_secret is not given');
    if (gitcat_secret != process.env.GITCAT_SECRET) throw new Error('gitcat_secret does not match!');

    const user = await model.GetUserByUserGithubId(user_github_id);
    console.log('milestone from :: USER', user);
    const owner = await model.GetOwnerByOwnerGithubId(owner_github_id);
    console.log('owner: ', owner);
    const repo = await model.GetRepoByRepoGithubId(owner_github_id, repo_github_id);
    console.log('repo::', repo);

    // Dynamic import for @octokit/rest
    const { Octokit } = await import('@octokit/rest');

    const octokit = new Octokit({
      auth: user.access_token
    });

    // Fetch milestones
    const { data: milestones } = await octokit.issues.listMilestones({
      owner: owner.owner_name,
      repo: repo.repo_name,
      state: 'all'
    });

    console.log('milestones:', milestones);

    const mlstnIdMap = {};
    for (const milestone of milestones) {
      const [result] = await db.execute(
        'INSERT INTO Milestones (mlstn_state, mlstn_title, mlstn_due, mlstn_descr, owner_github_id, repo_github_id, mlstn_github_id) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE mlstn_state = VALUES(mlstn_state), mlstn_title = VALUES(mlstn_title), mlstn_due = VALUES(mlstn_due), mlstn_descr = VALUES(mlstn_descr)',
        [
          milestone.state === 'open' ? 1 : 0,
          milestone.title,
          milestone.due_on ? new Date(milestone.due_on) : null,
          milestone.description,
          owner_github_id,
          repo_github_id,
          milestone.id
        ]
      );
      
      const mlstnId = result.insertId || (await db.execute(
        'SELECT mlstn_id FROM Milestones WHERE owner_github_id = ? AND repo_github_id = ? AND mlstn_github_id = ?',
        [owner_github_id, repo_github_id, milestone.id]
      ))[0][0].mlstn_id;

      mlstnIdMap[milestone.id] = mlstnId;

      msltn_obj_list.push({
        mlstn_id: mlstnId,
        mlstn_state: milestone.state === 'open' ? 1 : 0,
        mlstn_title: milestone.title,
        mlstn_due: milestone.due_on ? new Date(milestone.due_on) : null,
        mlstn_descr: milestone.description,
        owner_github_id: owner_github_id,
        repo_github_id: repo_github_id,
        mlstn_github_id: milestone.id
      });
    }

    // Fetch labels
    const { data: labels } = await octokit.issues.listLabelsForRepo({
      owner: owner.owner_name,
      repo: repo.repo_name
    });

    console.log('labels:', labels);

    // Save labels to the database
    const labelIdMap = {};
    for (const label of labels) {
      const [result] = await db.execute(
        'INSERT INTO Labels (label_name, label_color, owner_github_id, repo_github_id, label_github_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE label_name = VALUES(label_name), label_color = VALUES(label_color)',
        [
          label.name,
          label.color,
          owner_github_id,
          repo_github_id,
          label.id
        ]
      );

      const labelId = result.insertId || (await db.execute(
        'SELECT label_id FROM Labels WHERE label_github_id = ? AND owner_github_id = ? AND repo_github_id = ?',
        [label.id, owner_github_id, repo_github_id]
      ))[0][0].label_id;

      labelIdMap[label.id] = labelId;

      label_obj_list.push({
        label_id: labelId,
        label_name: label.name,
        label_color: label.color,
        owner_github_id: owner_github_id,
        repo_github_id: repo_github_id,
        label_github_id: label.id
      });
    }

    // Fetch issues
    const { data: issues } = await octokit.issues.listForRepo({
      owner: owner.owner_name,
      repo: repo.repo_name,
      state: 'all'
    });

    console.log('issues:', issues);

    const [savedMilestones] = await db.execute(
      'SELECT * FROM Milestones WHERE owner_github_id = ? AND repo_github_id = ?',
      [owner_github_id, repo_github_id]
    );

    for (const issue of issues) {
      const milestoneId = issue.milestone ? savedMilestones.find(m => m.mlstn_github_id === issue.milestone.id).mlstn_id : null;
      const labelIds = issue.labels.map(label => labelIdMap[label.id]);
      console.log('inserting...', issue);
      const [result] = await db.execute(
        'INSERT INTO Issues (issue_title, issue_state, mlstn_id, label_id_list, owner_github_id, repo_github_id, issue_github_id) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE issue_title = VALUES(issue_title), issue_state = VALUES(issue_state), mlstn_id = VALUES(mlstn_id), label_id_list = VALUES(label_id_list)',
        [
          issue.title,
          issue.state === 'open' ? 1 : 0,
          milestoneId,
          JSON.stringify(labelIds),
          owner_github_id,
          repo_github_id,
          issue.id
        ]
      );

      issue_obj_list.push({
        issue_id: result.insertId,
        issue_title: issue.title,
        issue_state: issue.state === 'open' ? 1 : 0,
        mlstn_id: milestoneId,
        label_id_list: labelIds,
        owner_github_id: owner_github_id,
        repo_github_id: repo_github_id,
        issue_github_id: issue.id
      });
    }

    res.status(200).json({
      status: 'success',
      milestones: msltn_obj_list,
      issues: issue_obj_list,
      labels: label_obj_list
    });
  } catch (error) {
    console.error('Error fetching milestones, issues, and labels:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

module.exports = {
  retrieveMlstnsIssuesLabels
};
