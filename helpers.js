const generateRandomString = () => {
  let randomString = '';
  let characters = '012345679abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const getUserByEmail = (email, userDb) => {
  for (const key in userDb) {
    const user = userDb[key];
    if (email === user.email) {
      return key;
    }
  }
  return undefined;
};

const isLoggedin = (req, userDb) => {
  const userId = req.session.user_id;
  const user = userDb[userId];
  if (user) {
    return user;
  }
  return null;
};

const urlExists = (urlDatabase) => {
  for ( shortURL of urlDatabase){
    if (!shortURL) {
      return false;
    }
  }
  return true;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  isLoggedin,
  urlExists
};