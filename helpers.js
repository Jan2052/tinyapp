function generateRandomString() {
  let randomString = '';
  let characters = '012345679abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

function getUserByEmail(email, userDb) {
  for (const key in userDb) {
    const user = userDb[key];
    if (email === user.email) {
      return key;
    }
  }
  return undefined;
};

const isLoggedin = (req) => {
  if (req.session.user_id) {
    return true;
  }
  return false;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  isLoggedin
};