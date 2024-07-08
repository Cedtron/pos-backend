const jwt = require('jsonwebtoken');
const JWT_SECRET = 'boombaala';

exports.authenticateToken = (req, res, next) => {
    const token = req.query.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        console.log('Access denied, no token provided');
        return res.status(401).send({ message: 'Access denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send({ message: 'Invalid token' });
        console.log('Bad token provided');
    }
};