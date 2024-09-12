const db = require('../conn/db');
// Generate a unique shop code based on input values
const generateShopCode = (name, country, address, city) => {
    if (!name || !country || !address || !city) {
        throw new Error('Missing required fields for generating shop code');
    }

    const normalizedName = name.replace(/\s+/g, '').toUpperCase();
    const normalizedCountry = country.replace(/\s+/g, '').toUpperCase();
    const normalizedAddress = address.replace(/\s+/g, '').toUpperCase();
    const normalizedCity = city.replace(/\s+/g, '').toUpperCase();

    const baseCode = `${normalizedName.substring(0, 3)}${normalizedCountry.substring(0, 2)}${normalizedAddress.substring(0, 2)}${normalizedCity.substring(0, 2)}`;
    const randomNumber = Math.floor(100 + Math.random() * 900); // Generates a random 3-digit number

    const code = `${baseCode.slice(0, 9)}${randomNumber}`; // Use the first 5 characters of the base code and append the random number

    return code.toUpperCase();
};

exports.createCompany = async (req, res) => {
    const { name, email, logo, address, city, state, country, contact_number, currency } = req.body;
    console.log("Received data:", req.body);

    try {
        if (!name || !address || !city || !country) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const generatedShopCode = generateShopCode(name, country, address, city);
        const RegNo = "S001"; // Adjust as needed

        const checkShopCodeAndNameSql = `SELECT COUNT(*) AS count FROM companydetails_tb WHERE shop_code = ? AND name = ?`;

        db.query(checkShopCodeAndNameSql, [generatedShopCode, name], (err, result) => {
            if (err) {
                console.error("Database error while checking shop code and name:", err);
                return res.status(500).json({ 
                    message: 'Internal server error while checking shop code and name', 
                    error: err.message 
                });
            }

            if (result[0].count > 0) {
                console.log("Combination of shop code and name already exists:", generatedShopCode, name);
                return res.status(400).json({ message: 'Shop code and name combination already exists' });
            }

            const insertSql = `INSERT INTO companydetails_tb (RegNo, shop_code, name, email, logo, address, city, state, country, contact_number, currency) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

            db.query(insertSql, [RegNo, generatedShopCode, name, email, logo, address, city, state, country, contact_number, currency], (err, result) => {
                if (err) {
                    console.error("Database error while inserting company details:", err);
                    return res.status(500).json({ 
                        message: 'Internal server error while inserting company details', 
                        error: err.message 
                    });
                }

                console.log("Company created successfully with ID:", result.insertId);
                res.status(201).json({ id: result.insertId, RegNo: RegNo, shopCode: generatedShopCode }); // Include the shop code in the response
            });
        });
    } catch (err) {
        console.error("Error generating shop code:", err);
        return res.status(500).json({ 
            message: 'Error generating shop code', 
            error: err.message 
        });
    }
};


exports.getAllCompanies = (req, res) => {
    const sql = `SELECT * FROM companydetails_tb`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(200).json(results);
    });
};

exports.getCompanyByShopCode = (req, res) => {
    const { shop_code } = req.params; // Extract shop_code from request parameters

    const sql = `SELECT * FROM companydetails_tb WHERE shop_code = ?`; // Use shop_code in the query

    db.query(sql, [shop_code], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Company entry not found' });
        }
        res.status(200).json(result[0]); // Return the first matching company
    });
};

// Function to update a company by shop_code
exports.updateCompany = (req, res) => {
    const { shop_code } = req.params; // Extract shop_code from request parameters
    const { name, email, logo, address, city, state, country, contact_number, currency } = req.body;

    const sql = `UPDATE companydetails_tb SET name = ?, email = ?, logo = ?, address = ?, city = ?, state = ?, country = ?, contact_number = ?, currency = ? WHERE shop_code = ?`; // Use shop_code in the query

    db.query(sql, [name, email, logo, address, city, state, country, contact_number, currency, shop_code], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Company entry not found' });
        }
        res.status(200).json({ message: 'Company entry updated successfully' });
    });
};

// Function to delete a company by shop_code
exports.deleteCompany = (req, res) => {
    const { shop_code } = req.params; // Extract shop_code from request parameters

    const sql = `DELETE FROM companydetails_tb WHERE shop_code = ?`; // Use shop_code in the query

    db.query(sql, [shop_code], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Company entry not found' });
        }
        res.status(200).json({ message: 'Company entry deleted successfully' });
    });
};



// In your controller file (e.g., shop.js)

exports.checkIfCompanyExists = (req, res) => {
    const sql = `SELECT COUNT(*) AS count FROM companydetails_tb`;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        const count = result[0].count;
        res.status(200).json({ exists: count > 0 });
    });
};
