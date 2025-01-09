const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
// Create a new log entry
exports.createLog = async (req, res) => {
  const { username, action, shop_code } = req.body;

  const RegNo = await generateRegNo('L'); // Generate the next RegNo with 'L' prefix
  const localDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Local date in YYYY-MM-DD HH:MM:SS format

  try {
    const insertSql = `INSERT INTO logs_tb (RegNo, username, action, log_date, shop_code) VALUES (?, ?, ?, ?, ?)`;
    db.query(
      insertSql,
      [RegNo, username, action, localDate, shop_code],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .send({ message: 'Database insertion error', error: err });
        }
        res.status(201).send({ id: result.insertId });
      }
    );
  } catch (err) {
    return res
      .status(500)
      .send({ message: 'Unexpected server error', error: err });
  }
};

// Read all log entries
exports.getAllLogs = (req, res) => {
  const { shop_code } = req.query;
  let sql = `SELECT * FROM logs_tb`;
  const params = [];

  if (shop_code) {
    sql += ` WHERE shop_code = ?`;
    params.push(shop_code);
  }

  sql += ` ORDER BY log_id DESC`;

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(results);
  });
};

// Read a single log entry by ID
exports.getLogById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM logs_tb WHERE log_id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length === 0) {
      return res.status(404).send({ message: 'Log entry not found' });
    }
    res.status(200).send(result[0]);
  });
};

// Update a log entry by ID
exports.updateLog = (req, res) => {
  const { id } = req.params;
  const { RegNo, username, action, log_date, shop_code } = req.body;

  const sql = `UPDATE logs_tb SET RegNo = ?, username = ?, action = ?, log_date = ?, shop_code = ? WHERE log_id = ?`;
  db.query(
    sql,
    [RegNo, username, action, log_date, shop_code, id],
    (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (result.affectedRows === 0) {
        return res.status(404).send({ message: 'Log entry not found' });
      }
      res.status(200).send({ message: 'Log entry updated successfully' });
    }
  );
};

// Delete a log entry by ID
exports.deleteLog = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM logs_tb WHERE log_id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Log entry not found' });
    }
    res.status(200).send({ message: 'Log entry deleted successfully' });
  });
};
