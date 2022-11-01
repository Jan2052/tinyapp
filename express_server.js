const cookieSession = require('cookie-session');
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const {
  generateRandomString,
  getUserByEmail,
  isLoggedin,
  urlExists
} = require('./helpers');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "UPTXRn",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "8da585",
  },
};

const userDb = {
  aJ48lW: {
    id: 'aJ48lW',
    email: 'hello@gmail.com',
    password: '$2a$10$CO/nibFz9ge2SZgJ3KS2RelhQnkUdOBTymrF600HWhS1gQEyXIYku',
  },
  UPTXRn: {
    id: 'UPTXRn',
    email: '123@gmail.com',
    password: '$2a$10$CO/nibFz9ge2SZgJ3KS2RelhQnkUdOBTymrF600HWhS1gQEyXIYku'
  },
  xbq7LE: {
    id: 'xbq7LE',
    email: 'test@gmail.com',
    password: '$2a$10$wFdGK95fKRNfyNHXiL2PGeLjp/e2qOKENhtRLFpV2IrSlQ9uVHwwK'
  },
};

// Main page
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (!isLoggedin(req, userDb)) {
    return res.redirect('/login');
  }
  res.redirect('/urls')
});

// URL page
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = userDb[userId];
  if (!isLoggedin(req, userDb)) {
    return res.send('Please log in or register');
  }

  const userURL = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      userURL[shortURL] = urlDatabase[shortURL];
    }
  }

  const templateVars = { urls: userURL, user };
  return res.render("urls_index", templateVars);
});

//redirects to tiny url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    return res.redirect(longURL);
  }

  res.send('404 Page not found');
});


// Create new URL page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = userDb[userId];
  if (!isLoggedin(req, userDb)) {
    res.redirect('/login')
  }
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_new", templateVars);
});

// Create new URL
app.post("/urls", (req, res) => {
  if (!isLoggedin(req, userDb)) {
    return res.status(403).send('Please log in');
  }
  const userID = req.session.user_id;
  const id = generateRandomString();
  const longURL = req.body.longURL;
  const url = { userID, longURL };
  urlDatabase[id] = url;
  res.redirect(`/urls/${id}`);
});

// REGISTER page
app.get("/register", (req, res) => {
  const { email, password } = req.body;
  const userId = req.session.user_id;
  const user = userDb[userId];

  if (isLoggedin(req, userDb)) {
    return res.redirect('/urls')
  }

  const templateVars = { urls: urlDatabase, user, email: email, password: password };
  res.render("register", templateVars);
});

// REGISTER
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || password) {
    return res.status(400).send('All fields are required to be filled in for registration. Please enter an email and password.');
  }

  if (getUserByEmail(email, userDb)) {
    return res.status(400).send('Email already exists');
  }

  const userId = generateRandomString();
  const newUser = {

    id: userId,
    email,
    password: bcrypt.hashSync(password, 10)

  };
  userDb[userId] = newUser;

  req.session.user_id = userId;
  res.redirect('/urls');
});

// LOGIN page
app.get('/login', (req, res) => {
  if (isLoggedin(req, userDb)) {
    res.redirect('/urls');
  }
  res.render("login", { user: null });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, userDb);
  if (!user || !bcrypt.compareSync(password, userDb[user].password)) {
    return res.status(403).send('Invalid login');
  }

  req.session.user_id = user;
  res.redirect('/urls');
});

// LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// EDIT page
app.get("/urls/:id", (req, res) => {
  const id = req.params.id

  if (!urlExists(id, urlDatabase)) {
    res.status(403).send('URL does not exist');
  }

  const userId = req.session.user_id;
  const userID = urlDatabase[id].userID
  const user = userDb[userId];

  if (!isLoggedin(req, userDb)) {
    res.status(403).send('Please log in to edit url');
  }

  if (userId !== userID) {
    res.status(403).send('Only the owner may have edit access to this url');
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };
  res.render("urls_show", templateVars);
});

// EDIT
app.post("/urls/:id/edit", (req, res) => {
  if (!isLoggedin(req, userDb)) {
    res.status(403).send('Please log in to edit url');
  }
 const user = isLoggedin(req, userDb)
  if (user !== Object.keys(urlDatabase)) {
    res.status(403).send('Only the owner may have edit access to this url');
  }
  const id = req.params.id;

  const longURL = req.body.longURL;
  const userID = user.id;
  const url = { userID, longURL };
  urlDatabase[id] = url;

  res.redirect('/urls');
});

// DELETE
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = userDb[userId];

  if (!isLoggedin(req, userDb)) {
    res.status(403).send('Please log in to delete this url');
  }
  if (!user) {
    res.status(403).send('Please log in to delete this url');
  }
  if (userId !== urlDatabase[req.params.id].userID) {
    res.status(403).send('Only the owner may delete this url');
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});