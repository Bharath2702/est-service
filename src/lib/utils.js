// src/lib/utils.js
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');

/**
 * Password helpers
 */
function validPassword(password, hash, salt) {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

function genPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash: genHash };
}

/**
 * JWT helpers - using HMAC (HS256) and a shared secret from env (JWT_SECRET)
 * Make sure process.env.JWT_SECRET is set in PM2 / .env
 */
function issueJWT(user) {
  // support both user.id and user.userId depending on your model
  const _id = (user && (user.userId || user.id)) || null;
  const expiresIn = '1d';

  const payload = {
    sub: _id,
    iat: Math.floor(Date.now() / 1000)
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not set in environment');
  }

  const signedToken = jsonwebtoken.sign(payload, secret, { expiresIn, algorithm: 'HS256' });

  return {
    token: signedToken,
    expires: expiresIn
  };
}

function verifyJWT(token) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;
    const decoded = jsonwebtoken.verify(token, secret, { algorithms: ['HS256'] });
    return { user: decoded };
  } catch (e) {
    return false;
  }
}

/**
 * inValidateToken
 * There's no reliable way to "destroy" an HMAC-signed token from client side.
 * If you need logout -> implement token blacklist or rely on short expiry + rotate secrets.
 * Here we'll simply return true (placeholder) — adjust if you implement blacklist.
 */
function inValidateToken(/* token */) {
  return true;
}

module.exports = {
  validPassword,
  genPassword,
  issueJWT,
  verifyJWT,
  inValidateToken
};