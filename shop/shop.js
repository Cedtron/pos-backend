const db = require('../conn/db');

// Generate a unique shop code based on input values
const generateShopCode = (name, country, address, city) => {
    if (!name || !country || !address || !city) {
        throw new Error('Missing required fields for generating shop code');
    }
    const normalizedName    = name.replace(/\s+/g, '').toUpperCase();
    const normalizedCountry = country.replace(/\s+/g, '').toUpperCase();
    const normalizedAddress = address.replace(/\s+/g, '').toUpperCase();
    const normalizedCity    = city.replace(/\s+/g, '').toUpperCase();
    const baseCode = `${normalizedName.substring(0, 3)}${normalizedCountry.substring(0, 2)}${normalizedAddress.substring(0, 2)}${normalizedCity.substring(0, 2)}`;
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `${baseCode.slice(0, 9)}${randomNumber}`.toUpperCase();
};

// Auto-generate a unique RegNo
const generateRegNo = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `S${timestamp}`;
};

exports.createCompany = async (req, res) => {
    // Accept logo as base64 string (sent from frontend FileReader)
    // Accept color as hex string e.g. "#6a5af9"
    const {
        name, email, logo, address, city, state,
        country, contact_number, currency,
        color, tagline, businessType
    } = req.body;

    console.log("Received createCompany for:", name);

    try {
        if (!name || !address || !city || !country) {
            return res.status(400).json({ message: 'Missing required fields: name, address, city, country' });
        }

        const generatedShopCode = generateShopCode(name, country, address, city);
        const RegNo = generateRegNo();

        // Check if this shop name + code combo already exists
        const checkSql = `SELECT COUNT(*) AS count FROM companydetails_tb WHERE shop_code = ? AND name = ?`;
        db.query(checkSql, [generatedShopCode, name], (err, result) => {
            if (err) {
                console.error("DB error checking shop code:", err);
                return res.status(500).json({ message: 'Internal server error', error: err.message });
            }
            if (result[0].count > 0) {
                return res.status(400).json({ message: 'A shop with this name already exists' });
            }

            // Insert with color, tagline, businessType columns
            // NOTE: Run the ALTER TABLE migration below if these columns don't exist yet.
            const insertSql = `
                INSERT INTO companydetails_tb
                    (RegNo, shop_code, name, email, logo, address, city, state, country,
                     contact_number, currency, color, tagline, business_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const logoValue = logo || null;         // base64 string or null
            const colorValue = color || '#6a5af9';  // default violet
            const taglineValue = tagline || null;
            const businessTypeValue = businessType || null;

            db.query(insertSql, [
                RegNo, generatedShopCode, name, email, logoValue,
                address, city, state, country, contact_number,
                currency, colorValue, taglineValue, businessTypeValue
            ], (err, result) => {
                if (err) {
                    console.error("DB error inserting company:", err);
                    return res.status(500).json({ message: 'Internal server error', error: err.message });
                }
                console.log("Shop created:", generatedShopCode, "RegNo:", RegNo);
                res.status(201).json({
                    id: result.insertId,
                    RegNo,
                    shopCode: generatedShopCode,
                    color: colorValue
                });
            });
        });
    } catch (err) {
        console.error("Error in createCompany:", err);
        return res.status(500).json({ message: 'Error generating shop code', error: err.message });
    }
};

exports.getAllCompanies = (req, res) => {
    const sql = `SELECT * FROM companydetails_tb`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
};

exports.getCompanyByShopCode = (req, res) => {
    const { shop_code } = req.params;
    const sql = `SELECT * FROM companydetails_tb WHERE shop_code = ?`;
    db.query(sql, [shop_code], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: 'Company not found' });
        res.status(200).json(result[0]);
    });
};

exports.updateCompany = (req, res) => {
    const { shop_code } = req.params;
    const {
        name, email, logo, address, city, state,
        country, contact_number, currency,
        color, tagline, businessType
    } = req.body;

    const sql = `
        UPDATE companydetails_tb
        SET name=?, email=?, logo=?, address=?, city=?, state=?,
            country=?, contact_number=?, currency=?,
            color=?, tagline=?, business_type=?
        WHERE shop_code=?
    `;
    db.query(sql, [
        name, email, logo, address, city, state,
        country, contact_number, currency,
        color || '#6a5af9', tagline || null, businessType || null,
        shop_code
    ], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Company not found' });
        res.status(200).json({ message: 'Company updated successfully' });
    });
};

exports.deleteCompany = (req, res) => {
    const { shop_code } = req.params;
    const sql = `DELETE FROM companydetails_tb WHERE shop_code = ?`;
    db.query(sql, [shop_code], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Company not found' });
        res.status(200).json({ message: 'Company deleted successfully' });
    });
};

exports.checkIfCompanyExists = (req, res) => {
    const sql = `SELECT COUNT(*) AS count FROM companydetails_tb`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Internal server error' });
        res.status(200).json({ exists: result[0].count > 0 });
    });
};
