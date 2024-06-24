const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key';

exports.authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).send({ message: 'Access denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send({ message: 'Invalid token' });
    }
};
