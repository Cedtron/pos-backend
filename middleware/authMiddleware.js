/**
 * middleware/authMiddleware.js
 *
 * Changes from original:
 * 1. JWT_SECRET read from process.env.JWT_SECRET (not hardcoded)
 * 2. Token payload now includes shop_code (set during login in auth.js)
 * 3. req.user is attached with { id, email, shop_code, role }
 * 4. shopGuard middleware: validates that the shop_code in the request
 *    (body / params / query) matches the one in the token — prevents
 *    cookie-tampered shop_code attacks.
 */

const jwt = require('jsonwebtoken');

const getSecret = () => process.env.JWT_SECRET || 'gula_nang_change_me_in_env';

// ─── authenticateToken ────────────────────────────────────────────────────────
// Verifies the JWT from Authorization header or ?token= query param.
// Attaches decoded payload to req.user.
exports.authenticateToken = (req, res, next) => {
  const token =
    req.headers['authorization']?.split(' ')[1] ||
    req.query.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied: no token provided' });
  }

  try {
    const decoded = jwt.verify(token, getSecret());
    req.user = decoded; // { id, email, shop_code, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    return res.status(400).json({ message: 'Invalid token' });
  }
};

// ─── shopGuard ────────────────────────────────────────────────────────────────
// Use AFTER authenticateToken on any route that touches shop-scoped data.
// Compares req.user.shop_code (from the verified JWT) against the shop_code
// sent in the request (body / params / query) — they MUST match.
//
// Admins/owners can also be given a bypass via role check if needed later.
//
// Usage:
//   router.get('/products', auth, shopGuard, controller.getAllProducts);
exports.shopGuard = (req, res, next) => {
  const requestedShop =
    req.body?.shop_code ||
    req.params?.shop_code ||
    req.query?.shop_code;

  // If no shop_code is in the request at all, let it through —
  // the controller is responsible for using req.user.shop_code instead.
  if (!requestedShop) {
    return next();
  }

  if (requestedShop !== req.user.shop_code) {
    return res.status(403).json({
      message: 'Forbidden: shop_code mismatch',
    });
  }

  next();
};

// ─── requireRole ──────────────────────────────────────────────────────────────
// Optional role-based guard. Pass allowed roles as array.
// Usage:
//   router.delete('/deluser/:id', auth, requireRole(['admin']), controller.deleteSignup);
exports.requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]`,
    });
  }
  next();
};
