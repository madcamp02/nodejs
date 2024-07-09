const db = require('../models/db').db;

exports.addLabel = async (req, res) => {
  try {
    const { name, color } = req.body;
    const [result] = await db.execute('INSERT INTO Labels (name, color) VALUES (?, ?)', [name, color]);
    res.json({ status: 'success', label_id: result.insertId });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.editLabel = async (req, res) => {
  try {
    const { name, color } = req.body;
    await db.execute('UPDATE Labels SET name = ?, color = ? WHERE id = ?', [name, color, req.params.label_id]);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
