const db = require('./db');

// Function to generate a new RegNo
const generateRegNo = (prefix, tableName) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT MAX(CAST(SUBSTRING(RegNo, LENGTH(?) + 1) AS UNSIGNED)) AS maxRegNo FROM ${tableName} WHERE RegNo LIKE ?`;
        const likePattern = `${prefix}%`;
        db.query(sql, [prefix, likePattern], (err, result) => {
            if (err) {
                return reject(err);
            }
            const maxRegNo = result[0].maxRegNo || 0;
            const newRegNo = `${prefix}${String(maxRegNo + 1).padStart(3, '0')}`;
            resolve(newRegNo);
        });
    });
};

module.exports = generateRegNo;
