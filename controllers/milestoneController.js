import { Octokit } from '@octokit/rest';
import db from '../models/db.js';

export async function getMilestones(req, res) {
  console.log(`Fetching milestones for repo_id: ${req.params.repo_id}`);
  try {
    const [milestones] = await db.execute('SELECT * FROM Milestones WHERE repo_id = ?', [req.params.repo_id]);
    res.json({ status: 'success', milestones });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function addMilestone(req, res) {
  console.log('Adding a new milestone:', req.body);
  try {
    const { title, description, due_date } = req.body;
    const [result] = await db.execute('INSERT INTO Milestones (title, description, due_date) VALUES (?, ?, ?)', [title, description, due_date]);
    res.json({ status: 'success', milestone_id: result.insertId });
  } catch (error) {
    console.error('Error adding milestone:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function editMilestone(req, res) {
  console.log(`Editing milestone with id: ${req.params.milestone_id}`, req.body);
  try {
    const { title, description, due_date } = req.body;
    await db.execute('UPDATE Milestones SET title = ?, description = ?, due_date = ? WHERE id = ?', [title, description, due_date, req.params.milestone_id]);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error editing milestone:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
