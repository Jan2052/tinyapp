const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "8da585",
  },
};

const userDb = {
  'aJ48lW': {
    id: 'aJ48lW',
    email: 'hello@gmail.com',
    password: '123',
  },
  '8da585': {
    id: '8da585',
    email: 'world@gmail.com',
    password: '123',
  }
}

// Generate SHORT URL for website and redirects user to database
app.post("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  const user = userDb[userID]
  const id = generateRandomString()
  const longURL = req.body.longURL
  const url = { userID, longURL }
  urlDatabase[id] = url

  res.redirect("/urls")
  console.log(req.body);
});

// EDIT
app.post("/urls/:id/edit", (req, res) => {
  const longURL = req.body.longURL
  const userID = req.cookies['user_id'];
  const url = { userID, longURL }
  urlDatabase[id] = url

  const user = userDb[userID]
  if (!user) {
    return res.redirect("/login");
  }

  urlDatabase[id].longUrl = longURL
  res.redirect("/urls");
});

// DELETE
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = userDb[userId];
  if (!user) {
    res.status(403).send('Please log in to delete this url')
  }
  if (userId !== urlDatabase[req.params.id].userID){
    res.status(403).send('Only the owner may delete this url')
  }
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
});

//redirects to url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  if (longURL) {
    res.redirect(longURL);
    return;
  }
  res.send('404 Page not found');
});

// URL page andhows USERNAME when logged in
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = userDb[userId];

  //urlsForUser(id) function
  const userURL = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      userURL[shortURL] = urlDatabase[shortURL];
    }
  }

  const templateVars = { urls: userURL , user };

  return res.render("urls_index", templateVars);
});

// Create new URL page
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = userDb[userId]
  if (!user) {
    return res.redirect("/login");
  }


  const templateVars = { urls: urlDatabase, user };
  res.render("urls_new", templateVars);
});

// REGISTER page
app.get("/register", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = userDb[user_id]
  const email = req.cookies['email'];
  const password = req.cookies['password'];
  const templateVars = { urls: urlDatabase, user, email: email, password: password };
  res.render("register", templateVars);
});

// LOGIN page
app.get('/login', (req, res) => {
  res.render("login", { user: null });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email)

  if (!user || password !== user.password) {
    return res.status(403).send('Invalid login')
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');

});

// REGISTER
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (email === '' || password === '') {
    return res.status(400).send('Missing information', email)
  }

  if (getUserByEmail(email)) {
    return res.status(400).send('Email already exists')
  }

  const userId = generateRandomString()
  const newUser = {
    [userId]: {
      id: userId,
      email,
      password,
    }
  }
  userDb[userId] = newUser
  console.log(userDb)

  res.cookie('user_id', userId)
  res.redirect('/urls')
});

// EDIT page
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = userDb[userId];
  if (!user) {
    res.status(403).send('Please log in to edit url')
  }

    if (userId !== urlDatabase[req.params.id].userID){
      res.status(403).send('Only the owner may have edit access to this url')
    }
  


  const longURL = req.body.longURL
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };
  res.render("urls_show", templateVars);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let randomString = '';
  let characters = '012345679abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

// Returns USER object if email exists in database | else returns null
function getUserByEmail(email) {
  for (const key in userDb) {
    const user = userDb[key];
    if (email === user.email) {
      return user;
    }
  }
  return null;
}

// const isLoggedin = (req) => {
//   return req.cookie['user_id'] === true
// };

// function urlsForUsers(id) {
// //returns URLs where userID equals id of logged in user and update code to:
// // only display urls if the user is logged in
// // only show urls that belong to the user when logged in
// const userId = req.cookies['user_id'];
// const user = userDb[userId];
// if (!user) {
//   res.status(403).send('Please log in to edit url')
// }

//   if (userId !== urlDatabase[req.params.id].userID){
//     res.status(403).send('Only the owner may have edit access to this url')
//   }
// }