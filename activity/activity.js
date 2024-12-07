const db = require('../conn/db');
const generateRegNo = require('../conn/reg'); 
const { v4: uuidv4 } = require('uuid'); // For generating UUIDs

// Create a new log entry
exports.createLog = async (req, res) => {
    const { username, action, shop_code } = req.body;

    const RegNo = await generateRegNo('L'); // Generate the next RegNo with 'L' prefix
    const localDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Local date in YYYY-MM-DD HH:MM:SS format
    const uuid = uuidv4(); // Generate a unique UUID

    try {
        const insertSql = `
            INSERT INTO logs_tb (uuid, RegNo, username, action, log_date, shop_code, sync_status)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `;
        db.run(insertSql, [uuid, RegNo, username, action, localDate, shop_code], function (err) {
            if (err) {
                return res.status(500).send({ message: 'Database insertion error', error: err });
            }
            res.status(201).send({ id: this.lastID });
        });
    } catch (err) {
        res.status(500).send({ message: 'Unexpected server error', error: err });
    }
};

// Read all log entries filtered by shop_code
exports.getAllLogs = (req, res) => {
    const { shop_code } = req.query; // Pass shop_code as a query parameter

    let sql = `SELECT * FROM logs_tb`;
    const params = [];
    
    if (shop_code) {
        sql += ` WHERE shop_code = ?`;
        params.push(shop_code);
    }

    sql += ` ORDER BY log_id DESC`;

    db.all(sql, params, (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Database query error', error: err });
        }
        res.status(200).send(results);
    });
};

// Read a single log entry by ID and shop_code
exports.getLogById = (req, res) => {
    const { id } = req.params;
    const { shop_code } = req.query;

    const sql = `
        SELECT * FROM logs_tb 
        WHERE log_id = ? ${shop_code ? 'AND shop_code = ?' : ''}
    `;
    const params = shop_code ? [id, shop_code] : [id];

    db.get(sql, params, (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Database query error', error: err });
        }
        if (!result) {
            return res.status(404).send({ message: 'Log entry not found' });
        }
        res.status(200).send(result);
    });
};

// Update a log entry by ID and shop_code
exports.updateLog = (req, res) => {
    const { id } = req.params;
    const { shop_code } = req.query;
    const { RegNo, username, action, log_date } = req.body;

    const sql = `
        UPDATE logs_tb 
        SET RegNo = ?, username = ?, action = ?, log_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE log_id = ? ${shop_code ? 'AND shop_code = ?' : ''}
    `;
    const params = shop_code ? [RegNo, username, action, log_date, id, shop_code] : [RegNo, username, action, log_date, id];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).send({ message: 'Database update error', error: err });
        }
        if (this.changes === 0) {
            return res.status(404).send({ message: 'Log entry not found' });
        }
        res.status(200).send({ message: 'Log entry updated successfully' });
    });
};

// Delete a log entry by ID and shop_code
exports.deleteLog = (req, res) => {
    const { id } = req.params;
    const { shop_code } = req.query;

    const sql = `
        DELETE FROM logs_tb 
        WHERE log_id = ? ${shop_code ? 'AND shop_code = ?' : ''}
    `;
    const params = shop_code ? [id, shop_code] : [id];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).send({ message: 'Database deletion error', error: err });
        }
        if (this.changes === 0) {
            return res.status(404).send({ message: 'Log entry not found' });
        }
        res.status(200).send({ message: 'Log entry deleted successfully' });
    });
};
