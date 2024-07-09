const { db } = require('./db');

const model = {
    GetUserByUserGithubId: async (user_github_id) => {
        try {
            const [rows] = await db.execute('SELECT * FROM Users WHERE user_github_id = ?', [user_github_id]);
            if (rows.length !== 1) throw new Error('duplicated, or missing userId');
            return rows[0];
        } catch (error) {
            throw new Error('Error fetching user from the database');
        }
    },

    GetOwnerListByOwnerIdList: async (owner_id_list) => {
        try {
            const placeholders = owner_id_list.map(() => '?').join(',');
            const query = `SELECT * FROM Owners WHERE owner_id IN (${placeholders})`;

            const [rows] = await db.execute(query, owner_id_list);
            return rows;
        } catch (error) {
            throw new Error('Error fetching owner_list from the database');
        }
    },

    GetOwnerByOwnerGithubId: async (owner_github_id) => {
        try {
            const [rows] = await db.execute('SELECT * FROM Owners WHERE owner_github_id = ?', [owner_github_id]);
            if (rows.length !== 1) throw new Error('duplicated, or missing ownerId');
            return rows[0];
        } catch (error) {
            throw new Error('Error fetching owner from the database');
        }
    },

    GetRepoListByRepoIdList: async (repo_id_list) => {
        try {
            const placeholders = repo_id_list.map(() => '?').join(',');
            const query = `SELECT * FROM Repositories WHERE repo_id IN (${placeholders})`;

            const [rows] = await db.execute(query, repo_id_list);
            return rows;
        } catch (error) {
            throw new Error('Error fetching repo_list from the database');
        }
    }
};

module.exports = { model };
