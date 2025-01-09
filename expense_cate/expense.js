const db = require('../conn/db');
const generateRegNo = require('../conn/reg');
// Create a new category
exports.createCategory = async (req, res) => {
  const { name , shop_code} = req.body;

  // Check if the category already exists
  const checkQuery = 'SELECT * FROM expendcategory_tb WHERE name = ? AND shop_code = ?';
  db.query(checkQuery, [name, shop_code], async (err, results) => {
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

// Get all categories
exports.getAllCategories = (req, res) => {
  const query = 'SELECT * FROM expendcategory_tb ORDER BY id DESC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.status(200).json(results);
  });
};

// Get a single category by ID
exports.getCategoryById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM expendcategory_tb WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(results[0]);
  });
};

// Update a category by ID
exports.updateCategoryById = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Check if the new name already exists
  const checkQuery = 'SELECT * FROM expendcategory_tb WHERE name = ? AND id != ?';
  db.query(checkQuery, [name, id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Category name already in use' });
    }

    // Update the category
    const updateQuery = 'UPDATE expendcategory_tb SET name = ? WHERE id = ?';
    db.query(updateQuery, [name, id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json({ message: 'Category updated successfully', id, name });
    });
  });
};

// Delete a category by ID
exports.deleteCategoryById = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM expendcategory_tb WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(204).json({ message: 'Category deleted successfully' });
  });
};
