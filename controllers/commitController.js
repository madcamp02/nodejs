import { Octokit } from '@octokit/rest';
import db from '../models/db.js';

export async function getCommits(req, res) {
  console.log(`Fetching commits for repo_id: ${req.params.repo_id}`);
  try {
    const [commits] = await db.execute('SELECT * FROM Commits WHERE repo_id = ?', [req.params.repo_id]);
    res.json({ status: 'success', commits });
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function getCommitDetails(req, res) {
  console.log(`Fetching details for commit_id: ${req.params.commit_id}`);
  try {
    const [commit] = await db.execute('SELECT * FROM Commits WHERE commit_id = ?', [req.params.commit_id]);
    res.json({ status: 'success', commit });
  } catch (error) {
    console.error('Error fetching commit details:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function addIssueToCommit(req, res) {
  console.log(`Adding issue_id: ${req.params.issue_id} to commit_id: ${req.params.commit_id}`);
  try {
    const { commit_id, issue_id } = req.params;
    await db.execute('UPDATE Commits SET issue_ids = JSON_ARRAY_APPEND(issue_ids, "$", ?) WHERE commit_id = ?', [issue_id, commit_id]);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error adding issue to commit:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
