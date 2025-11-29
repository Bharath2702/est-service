const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');


const pathToKey = path.join(__dirname, '..', '..', 'certs', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 * 
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 * 
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash, salt) {
  var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

/**
 * 
 * @param {*} password - The password string that the user inputs to the password field in the register form
 * 
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 * 
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */
function genPassword(password) {
  var salt = crypto.randomBytes(32).toString('hex');
  var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return {
    salt: salt,
    hash: genHash
  };
}


/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
function issueJWT(user) {
  const _id = user.userId;

  const expiresIn = '1d';

  const payload = {
    sub: _id,
    iat: Date.now()
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

  return {
    token: signedToken,
    expires: expiresIn
  }
}

function verifyJWT(token){
 try{
    const decoded = jsonwebtoken.verify(token,PRIV_KEY);
    user = decoded
    return {user: user}
  } catch(e){
    return false;
  }
}

function inValidateToken(token){
  const authHeader = token;
  // const destroy = jsonwebtoken.destroy(token, PRIV_KEY);
  const destroy = jsonwebtoken.sign(authHeader, PRIV_KEY, { expiresIn: 1, algorithm: 'RS256' });
  // const a = jsonwebtoken.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
    if (destroy) {
      return true;
    } else {
      return err;
    }
  // });
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.verifyJWT = verifyJWT;
module.exports.inValidateToken = inValidateToken;