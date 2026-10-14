const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';

const tokenForUser = (user) => jwt.sign(
  { sub: user._id.toString(), email: user.email, role: user.role },
  jwtSecret,
  { expiresIn: jwtExpiresIn }
);

const authResponse = (res, status, user) => res.status(status).json({
  token: tokenForUser(user),
  user: { id: user._id, name: user.name, email: user.email, role: user.role }
});

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 12) {
    return res.status(400).json({ message: 'Name, email, and a password of at least 12 characters are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'An account with that email already exists.' });

    // Public registration always creates an unprivileged account; request roles are ignored.
    const user = new User({ name: name.trim(), email: normalizedEmail, role: 'user' });
    await user.setPassword(password);
    await user.save();
    return authResponse(res, 201, user);
  } catch (err) {
    return res.status(400).json({ message: 'Unable to register account.' });
  }
};

const login = (req, res, next) => {
  if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message || 'Invalid email or password.' });
    return authResponse(res, 200, user);
  })(req, res, next);
};

module.exports = { register, login };
