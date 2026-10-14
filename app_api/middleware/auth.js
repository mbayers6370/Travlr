const passport = require('passport');

const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Authentication is required.' });
    req.user = user;
    return next();
  })(req, res, next);
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator permission is required.' });
  }
  return next();
};

module.exports = { requireAuth, requireAdmin };
