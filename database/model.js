
import { db } from './db.js';

export const model = {
    GetUserByUserId: async (user_id) => {
        try {
            const [rows] = await db.execute('SELECT * FROM Users WHERE user_id = ?', [user_id]);
            if(rows.length != 1) throw new Error('duplicated, or missing userId');
            return rows[0];
        } catch(error){
            throw new Error('Error fetching user from the database');
        }
    }
}