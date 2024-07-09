import { Octokit } from '@octokit/rest';
import db from '../models/db.js';

export async function addIssue(req, res) {
  try {
    const { title, description, milestone_id } = req.body;
    const [result] = await db.execute('INSERT INTO Issues (title, description, milestone_id) VALUES (?, ?, ?)', [title, description, milestone_id]);
    res.json({ status: 'success', issue_id: result.insertId });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function editIssue(req, res) {
  try {
    const { title, description, milestone_id } = req.body;
    await db.execute('UPDATE Issues SET title = ?, description = ?, milestone_id = ? WHERE id = ?', [title, description, milestone_id, req.params.issue_id]);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function closeIssue(req, res) {
  try {
    await db.execute('UPDATE Issues SET status = "closed" WHERE id = ?', [req.params.issue_id]);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}
