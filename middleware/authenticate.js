const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
        req.user = { access_token: token }; // Attach token to req.user
        next();
    } else {
        res.status(401).json({ status: 'error', message: 'Unauthorized: No token provided' });
    }
};

module.exports = authenticate;
