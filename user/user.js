const db = require('../conn/db');
const bcrypt = require('bcrypt');
const generateRegNo = require('../conn/reg');
const fs = require('fs');
const path = require('path');

exports.createSignup = async (req, res) => {
  const { Name, Email, Password, passhint, Role, company_name } = req.body;
  const image = req.file; // Access the uploaded file

  // Set Status based on Role
  const Status = Role === 'admin' ? 'active' : 'inactive';
  const localDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Local date in YYYY-MM-DD HH:MM:SS format

  try {
    // Step 1: Check if the email exists
    const emailCheckSql = 'SELECT Email FROM users_tb WHERE Email = ?';
    db.query(emailCheckSql, [Email], async (err, result) => {
      if (err) {
        return res.status(500).send({ message: 'Database query error', error: err });
      }

      if (result.length > 0) {
        return res.status(400).send({ message: 'Email already exists' });
      } else {
        // Step 2: Determine how to retrieve the shop_code
        let shopCodeSql;
        let params;

        if (company_name) {
          // If company_name is provided, query by company_name
          shopCodeSql = 'SELECT shop_code FROM companydetails_tb WHERE shop_code = ?';
          params = [company_name];
        } else {
          // If company_name is null, get the first shop_code from companydetails_tb
          shopCodeSql = 'SELECT shop_code FROM companydetails_tb LIMIT 1';
          params = [];
        }

        db.query(shopCodeSql, params, async (err, companyResult) => {
          if (err) {
            return res.status(500).send({ message: 'Error retrieving company details', error: err });
          }

          if (companyResult.length === 0) {
            return res.status(400).send({ message: 'No company found' });
          }

          const shop_code = companyResult[0].shop_code; // Get the shop_code from the result

          try {
            const hashedPassword = await bcrypt.hash(Password, 10);
            const RegNo = await generateRegNo('R', 'users_tb'); // Generate unique RegNo for the user

            // Step 3: Save the image path to the database
            const imagePath = image ? image.path : null; // Get the file path 
            // Step 4: Insert the new user into users_tb
            const insertUserSql = `INSERT INTO users_tb (RegNo, Name, Email, image, Password, Status, Role, passhint, DOR, shop_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.query(insertUserSql, [RegNo, Name, Email, imagePath, hashedPassword, Status, Role, passhint, localDate, shop_code], (err, userResult) => {
              if (err) {
                return res.status(500).send({ message: 'Database insertion error for user', error: err });
              }

              // Step 5: After successful user insertion, generate a unique RegNo for the display entry
              generateRegNo('D', 'display_tb').then(displayRegNo => {
                // Step 6: Insert into display_tb using the RegNo from the user entry as the user
                const navData = {
                  item1: 1,
                  item2: 2,
                  item3: 3,
                  item4: 0,
                  item5: 5,
                  item6: 6,
                  item7: 7,
                  item8: 0
                };
                const insertDisplaySql = `INSERT INTO display_tb (RegNo, user, nav, screen, shop_code) VALUES (?, ?, ?, ?, ?)`;
                db.query(insertDisplaySql, [displayRegNo, RegNo, JSON.stringify(navData), '', shop_code], (displayErr, displayResult) => {
                  if (displayErr) {
                    return res.status(500).json({ message: 'Error inserting display entry', error: displayErr.message });
                  }

                  // Step 7: Send success response for both insertions
                  res.status(201).json({
                    message: 'User and display entry created successfully',
                    userId: userResult.insertId,
                    displayId: displayResult.insertId
                  });
                });
              }).catch(regNoError => {
                return res.status(500).json({ message: 'Error generating RegNo for display', error: regNoError });
              });
            });
          } catch (hashError) {
            return res.status(500).send({ message: 'Password hashing error', error: hashError });
          }
        });
      }
    });
  } catch (err) {
    return res.status(500).send({ message: 'Unexpected server error', error: err });
  }
};


// Read all users
exports.getAllSignups = (req, res) => {
    const { shop_code } = req.query;
    let sql = `SELECT * FROM users_tb`;
    const params = [];

    if (shop_code) {
        sql += ` WHERE shop_code = ?`;
        params.push(shop_code);
    }

    sql += ` ORDER BY id DESC`;

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
};

// Read a single user by ID
exports.getSignupById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM users_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(result[0]);
    });
};

// Update a user entry by ID
exports.updateSignup = async (req, res) => {
  const { id } = req.params;
  const { RegNo, Name, Email, Password, confirmPassword, Status, Role, passhint, DOR } = req.body;
  const image = req.file;

  if (Password && Password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const getUserSql = 'SELECT image FROM users_tb WHERE id = ?';
    const userResult = await db.query(getUserSql, [id]);

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldImagePath = userResult[0].image;
    let updates = [];
    let values = [];

    if (RegNo) updates.push('RegNo = ?'), values.push(RegNo);
    if (Name) updates.push('Name = ?'), values.push(Name);
    if (Email) updates.push('Email = ?'), values.push(Email);
    if (Password) {
      const hashedPassword = await bcrypt.hash(Password, 10);
      updates.push('Password = ?'), values.push(hashedPassword);
    }
    if (Status) updates.push('Status = ?'), values.push(Status);
    if (Role) updates.push('Role = ?'), values.push(Role);
    if (passhint) updates.push('passhint = ?'), values.push(passhint);
    if (DOR) updates.push('DOR = ?'), values.push(DOR);
    if (image) {
      if (oldImagePath) {
        const fullPath = path.join(__dirname, '..', oldImagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      const newImagePath = await saveFile(image);
      updates.push('image = ?'), values.push(newImagePath);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE users_tb SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);

    const result = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Delete a user by ID
exports.deleteSignup = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM users_tb WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ message: 'User deleted successfully' });
    });
};


exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;

  if (!Status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const sql = 'UPDATE users_tb SET Status = ? WHERE id = ?';
    const result = await db.query(sql, [Status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User status updated successfully' });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};