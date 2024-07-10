//tilController.js
const { db } = require('../database/db');
const { getUserByGitHubId } = require('../database/model');
const { model } = require('../database/model');
const dotenv = require('dotenv');
dotenv.config();

async function fetchTils(req, res) {
  try {
    const { user_github_id, gitcat_secret } = req.query;

    if (!user_github_id || !gitcat_secret) {
      throw new Error('user_github_id or gitcat_secret is not given');
    }
    if (gitcat_secret !== process.env.GITCAT_SECRET) {
      throw new Error('gitcat_secret does not match!');
    }

    const user = await model.GetUserByUserGithubId(user_github_id);
    if (!user) {
      throw new Error('User not found');
    }

    const [tils] = await db.execute(`
      SELECT TILs.*, Commits.commit_msg, Commits.commit_date
      FROM TILs
      JOIN Commits ON TILs.commit_id = Commits.commit_id
      WHERE TILs.user_id = ?
    `, [user.user_id]);

    res.status(200).json({ status: 'success', tils: tils });
  } catch (error) {
    console.error('Error fetching TILs:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

async function fetchSingleTil(req, res) {
    try {
        const {user_github_id, commit_id, gitcat_secret } = req.query;
        
        if (!user_github_id || !commit_id || !gitcat_secret) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }
        if (gitcat_secret !== process.env.GITCAT_SECRET) {
            throw new Error('gitcat_secret does not match!');
        }

        const user = await model.GetUserByUserGithubId(user_github_id);

        const [tilResult] = await db.execute(`SELECT til_id FROM TILs WHERE commit_id = ?`, [commit_id]);
        console.log('tilResult:', tilResult);
        if (tilResult.length == 0) {
            const [commitResult] = await db.execute(
                `SELECT commit_msg, commit_date FROM Commits WHERE commit_id = ?`,
                [commit_id]
            );

            if (commitResult.length === 0) {throw new Error('Commit not found'); }

            const { commit_msg, commit_date } = commitResult[0];

            await db.execute(
                `INSERT INTO TILs (user_id, til_content, commit_id, commit_msg, commit_date) VALUES (?, ?, ?, ?, ?)`,
                [user.user_id, "", commit_id, commit_msg, commit_date]
            );
        }
        const [tilObj] = await db.execute('SELECT * FROM TILs WHERE commit_id = ?', [commit_id]);
        console.log('tilObj', tilObj);
        res.status(200).json({ status: 'success', til: tilObj });
    } catch(error) {
        console.error('Error fetching TIL:', error);
        res.status(500).json({ status: 'error', message: error.message });

    }
}

async function patchTil(req, res) {
    try {
        const { user_github_id, commit_id, gitcat_secret } = req.query;
        const { til_content } = req.body;

        if (!user_github_id || !commit_id || !gitcat_secret || !til_content) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }
        if (gitcat_secret !== process.env.GITCAT_SECRET) {
            throw new Error('gitcat_secret does not match!');
        }

        const user = await getUserByGitHubId(user_github_id);
        // Example: Validate the gitcat_secret here, if needed
        // ...

        // Check if the TIL object already exists
        const [tilResult] = await db.execute(`SELECT til_id FROM TILs WHERE commit_id = ?`, [commit_id]);

        if (tilResult.length == 0) {
            throw('TIL NOW FOUND');
        } else {
            // Update the existing TIL object
            await db.execute(
                `UPDATE TILs SET til_content = ? WHERE commit_id = ?`,
                [til_content, commit_id]
            );
        } 
        res.status(200).json({ status: 'success', message: 'TIL content updated successfully' });
    } catch (error) {
        console.error('Error updating TIL content:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
  fetchTils,
  fetchSingleTil,
  patchTil
};
