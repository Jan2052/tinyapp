const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDb = {
  '8da584': {
    id: '8da584',
    email: 'hello@gmail.com',
    password: 'password',
  },
  '8da585': {
    id: '8da585',
    email: 'world@gmail.com',
    password: 'password123',
  }
}



// Registering New Users
// Update all endpoints that pass username value to templates to pass entire user object to template instead and change logic as follows:
// Look up user object in users objects using userid cookie value
// Pass user object to templates

//Registration Errors
//Finding a user in the users object from its email is something we'll need to do in other routes as well. We recommend creating an user lookup helper function to keep your code DRY. This function would take in an email as a parameter, and return either the entire user object or null if not found.

//How do I check which branch I'm on and my commits so far





// creates short url for website and redirects user to database
app.post("/urls", (req, res) => {
  const id = generateRandomString()
  urlDatabase[id] = req.body.longURL
  res.redirect("/urls")
  console.log(req.body); // Log the POST request body to the console
});

// EDIT
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls");
});
// DELETE
app.post("/urls/:id/delete", (req, res) => {
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



// Shows USERNAME when logged in
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user_id: user_id };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user_id: user_id };
  res.render("urls_new", templateVars);
});

// REGISTER page
app.get("/urls/register", (req, res) => {
  const user_id = req.cookies['user_id'];
  const email = req.cookies['email'];
  const password = req.cookies['password'];
  const templateVars = { urls: urlDatabase, user_id: user_id, email: email, password: password };
  res.render("urls_register", templateVars);
});

// LOGIN page
app.get('/urls/login', (req, res) => {
  const user_id = req.cookies['user_id'];
  const email = req.cookies['email'];
  const password = req.cookies['password'];
  const templateVars = { urls: urlDatabase, user_id: user_id, email: email, password: password };
  res.render("urls_login", templateVars);
});

// LOGIN
app.post("/urls/login", (req, res) => {
  const { email, password } = req.body;

  // If a user with that e-mail cannot be found, return a response with a 403 status code.
  if (!getUserByEmail(email)) {
    return res.status(403).send('Email not found')
  }

  for (const key in userDb) {
    const dbUser = userDb[key];
    if (password !== dbUser.password) {
      return res.status(403).send('Password is incorrect')
    }
    for (const key in userDb) {
      const dbUser = userDb[key];
      const user_id = dbUser.id;
      console.log(userDb)
      res.cookie('user_id', user_id);
      res.redirect('/urls');
    }
  }
});

// REGISTER
app.post("/urls/register", (req, res) => {
  const { email, password } = req.body;

  if (email === '' || password === '') {
    return res.status(400).send('Missing information', email)
  }
  for (const key in userDb) {
    const dbUser = userDb[key]
    if (email === dbUser.email) {
      return res.status(400).send('Email already exists')
    }
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

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { user: null }
  res.render("/urls", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('urls')
});



// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

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

// Returns object if email exists in database | else returns null
function getUserByEmail(email) {
  for (const key in userDb) {
    const dbUser = userDb[key];
    if (email === dbUser.email) {
      return Object.entries(userDb[key]);
    } else {
      return null;
    }
  }
}