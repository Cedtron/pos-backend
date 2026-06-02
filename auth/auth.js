const db            = require('../conn/db');
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');
const generateRegNo = require('../conn/reg');

const getSecret = () => process.env.JWT_SECRET || 'gula_nang_change_me_in_env';

// ─── Login ────────────────────────────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    db.query(`SELECT * FROM users_tb WHERE Email = ?`, [email], async (err, result) => {
      if (err) return res.status(500).send({ message: 'Internal Server Error', error: err });
      if (result.length === 0) return res.status(401).send({ message: 'Invalid email' });

      const user = result[0];

      const isMatch = await bcrypt.compare(password, user.Password);
      if (!isMatch) return res.status(401).send({ message: 'Invalid password' });

      // ── Token now includes shop_code and role ──────────────────────────────
      const token = jwt.sign(
        {
          id:        user.id,
          email:     user.Email,
          shop_code: user.shop_code,
          role:      user.Role,
        },
        getSecret(),
        { expiresIn: '8h' }
      );

      // ── Log the login ──────────────────────────────────────────────────────
      try {
        const logRegNo = await generateRegNo('L', 'logs_tb');
        const now      = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query(
          `INSERT INTO logs_tb (RegNo, username, action, log_date, shop_code) VALUES (?, ?, ?, ?, ?)`,
          [logRegNo, user.Name, 'User login', now, user.shop_code]
        );
      } catch { /* non-fatal */ }

      // ── Fetch currency ─────────────────────────────────────────────────────
      db.query(
        `SELECT currency FROM companydetails_tb WHERE shop_code = ?`,
        [user.shop_code],
        (err, currencyResult) => {
          if (err) return res.status(500).send({ message: 'Internal Server Error', error: err });
          const currency = currencyResult.length > 0 ? currencyResult[0].currency : null;

          // ── Fetch display settings ─────────────────────────────────────────
          db.query(
            `SELECT screen, nav FROM display_tb WHERE user = ?`,
            [user.RegNo],
            (err, displayResult) => {
              if (err) return res.status(500).send({ message: 'Internal Server Error', error: err });

              const displayData = displayResult.map(row => ({
                screen: row.screen,
                nav:    row.nav,
              }));

              res.status(200).send({
                message: 'Login successful',
                token,
                user: {
                  id:       user.id,
                  regNo:    user.RegNo,
                  name:     user.Name,
                  email:    user.Email,
                  status:   user.Status,
                  shop:     user.shop_code,
                  role:     user.Role,
                  currency,
                  display:  displayData,
                },
              });
            }
          );
        }
      );
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send({ message: 'Internal Server Error', error: err });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logoutUser = (req, res) => {
  res.clearCookie('token');
  res.status(200).send({ message: 'Logout successful' });
};

// ─── Protected (token verify check) ──────────────────────────────────────────
exports.protectedRoute = (req, res) => {
  res.status(200).send({ message: 'Token has been verified', user: req.user });
};
