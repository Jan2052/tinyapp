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
    username: '8da584',
    email: 'hello@gmail.com',
    password: 'password',
  },
  '8da585': {
    username: '8da585',
    email: 'world@gmail.com',
    password: 'password123',
  }
}

// Login button not on main url page
// Couldn't display username // user_id cookie not working (user not defined in)
// 


app.get('/login', (req, res) => {
  res.render('login')
})
// LOGIN
app.post("/login", (req, res) => {
  const {username, email, password } = req.body
  
  for (const key in userDb) {
    if(Object.hasOwnProperty.call(userDb, key)) {
      const dbUser = userDb[key];
        if (dbUser.username === req.body) {
          return res.status(403).send('Email is already taken')
        }
    }
  }

  console.log(userDb)
  res.cookie('username',username)
  res.redirect('/urls')
});

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
  const username = req.cookies['username'];
  // if(!username) return res.render('urls_index', { urls: urlDatabase, user: null});

  // const currentUser = userDb[userId];
  // if (!currentUser) return res.send('User not found');
  // console.log(userId)

  // const userObject = currentUser[userId]
  // console.log(userObject)
  
  const templateVars = { urls: urlDatabase , username: username};
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies['username'];
  const templateVars = { urls: urlDatabase , username: username};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//AUTH ENDPOINTS
app.get("/urls", (req, res) => {
  const templateVars = {user: null}
  res.render("/urls", templateVars);
});

// LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('urls')
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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