const db = require('../models/db').db;

exports.getTILs = async (req, res) => {
  try {
    const [tils] = await db.execute('SELECT * FROM TILs WHERE repo_id = ?', [req.params.repo_id]);
    res.json({ status: 'success', tils });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.editTIL = async (req, res) => {
  try {
    const { content } = req.body;
    await db.execute('UPDATE TILs SET content = ? WHERE id = ?', [content, req.params.til_id]);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
