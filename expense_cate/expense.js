const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
// Create a new category
exports.createCategory = async (req, res) => {
  const { name , shop_code} = req.body;

  // Check if the category already exists
  const checkQuery = 'SELECT * FROM expendcategory_tb WHERE name = ?';
  db.query(checkQuery, [name], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    try {
      // Generate a new RegNo for the category entry
      const RegNo = await generateRegNo('C','expendcategory_tb');

      // Insert the new category
      const insertQuery = 'INSERT INTO expendcategory_tb (RegNo, name, shop_code) VALUES (?, ?, ?)';
      db.query(insertQuery, [RegNo, name, shop_code], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(201).json({ message: 'Category created successfully', id: results.insertId, name, RegNo });
      });
    } catch (err) {
      console.error("Error generating RegNo:", err);
      return res.status(500).json({ message: 'Error generating RegNo' });
    }
  });
};

exports.getAllCategories = (req, res) => {
  const { shop_code } = req.query; // Filter by shop_code if provided

  let query = 'SELECT * FROM expendcategory_tb';
  const params = [];

  if (shop_code) {
    query += ' WHERE shop_code = ?';
    params.push(shop_code);
  }

  query += ' ORDER BY id DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.status(200).json(results);
  });
};

exports.getCategoryById = (req, res) => {
  const { id } = req.params;
  const { shop_code } = req.query; // Filter by shop_code if provided

  let query = 'SELECT * FROM expendcategory_tb WHERE id = ?';
  const params = [id];

  if (shop_code) {
    query += ' AND shop_code = ?';
    params.push(shop_code);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching category:", err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(results[0]);
  });
};

exports.updateCategoryById = (req, res) => {
  const { id } = req.params;
  const { name, shop_code } = req.body;

  if (!name || !shop_code) {
    return res.status(400).json({ message: 'Name and shop_code are required' });
  }

  // Check if the new name already exists for this shop_code
  const checkQuery = `
    SELECT * FROM expendcategory_tb 
    WHERE name = ? AND id != ? AND shop_code = ?
  `;
  db.query(checkQuery, [name, id, shop_code], (err, results) => {
    if (err) {
      console.error("Error checking category name:", err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Category name already in use' });
    }

    // Update the category
    const updateQuery = `
      UPDATE expendcategory_tb 
      SET name = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND shop_code = ?
    `;
    db.query(updateQuery, [name, id, shop_code], (err, results) => {
      if (err) {
        console.error("Error updating category:", err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json({ message: 'Category updated successfully', id, name });
    });
  });
};

exports.deleteCategoryById = (req, res) => {
  const { id } = req.params;
  const { shop_code } = req.query; // Ensure shop_code is passed in the query

  if (!shop_code) {
    return res.status(400).json({ message: 'shop_code is required' });
  }

  const query = 'DELETE FROM expendcategory_tb WHERE id = ? AND shop_code = ?';
  db.query(query, [id, shop_code], (err, results) => {
    if (err) {
      console.error("Error deleting category:", err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(204).json({ message: 'Category deleted successfully' });
  });
};