const db = require('../conn/db');

// Create a new category
exports.createCategory = (req, res) => {
  const { name } = req.body;

  // Check if the category already exists
  const checkQuery = 'SELECT * FROM Exp_category_tb WHERE name = ?';
  db.query(checkQuery, [name], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Insert the new category
    const insertQuery = 'INSERT INTO Exp_category_tb (name) VALUES (?)';
    db.query(insertQuery, [name], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      res.status(201).json({ message: 'Category created successfully', id: results.insertId, name });
    });
  });
};

// Get all categories
exports.getAllCategories = (req, res) => {
  const query = 'SELECT * FROM Exp_category_tb';
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
  const query = 'SELECT * FROM Exp_category_tb WHERE id = ?';
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
  const checkQuery = 'SELECT * FROM Exp_category_tb WHERE name = ? AND id != ?';
  db.query(checkQuery, [name, id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Category name already in use' });
    }

    // Update the category
    const updateQuery = 'UPDATE Exp_category_tb SET name = ? WHERE id = ?';
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
  const query = 'DELETE FROM Exp_category_tb WHERE id = ?';
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
