const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const randomString = require("randomstring");
const cookieParser = require('cookie-parser');
const filterValues = require('filter-values');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    id: "b2xVn2",
    url: "http://www.lighthouselabs.ca",
    userID: "user2RanomID"
  },
  "9sm5xK": {
    id: "9sm5xK",
    url: "http://www.google.com",
    userID: "user3RanomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RanomID": {
    id: "user3RanomID",
    email: "borishaw@gmail.com",
    password: "password"
  }
};

function generateRandomString () {
  "use strict";
  return randomString.generate(6);
}


app.get("/", (req, res) => {

  let templateVars = {urls: urlDatabase};
  if (req.cookies['user_id']){

    let user_id = req.cookies['user_id'];
    templateVars['user'] = users[user_id];
    templateVars['urls'] = filterValues(urlDatabase, function (value, key, obj) {
      "use strict";
      return value.userID === user_id;
    })
  }

  res.render("urls_index", templateVars);

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id']){
    let user_id = req.cookies['user_id'];
    let user = users[user_id];
    res.render("urls_new" ,{user: user});
  } else {
    res.redirect("/");
  }
});

app.get("/register", (req, res) => {
  "use strict";
  res.render("register");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id].url
  };
  if (req.cookies['user_id']){
    let user_id = req.cookies['user_id'];
    let user = users[user_id];
    templateVars.user = user;
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let fullURL = urlDatabase[req.params.shortURL].url;
  res.redirect(fullURL);
});

app.get("/login", (req, res) => {
  "use strict";
  res.render("login");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortUrl = generateRandomString();
  let longUrl = req.body.longUrl
  urlDatabase[shortUrl] = {
    id: shortUrl,
    url: longUrl,
    userID: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id", (req, res) => {
  "use strict";
  let shortURL = req.params.id;
  let fullURL = req.body.fullURL;
  urlDatabase[shortURL].url = fullURL;
  res.redirect("/");
});

app.post("/urls/:id/delete", (req, res) => {
  "use strict";
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/");
});

app.post("/login", (req, res) => {
  "use strict";
  let email = req.body.email;
  let password = req.body.password;
  let verified = false;
  let user_id = '';
  let user = {};

  for (let key in users){
    if (users[key].email === email){
      if (users[key].password === password){
        user_id = key;
        user = users[user_id];
        verified = true;
        break;
      }
    }
  }

  return verified ? res.cookie("user_id", user_id).redirect("/") : res.status(403).send("Failed to authenticate");

  // if (verified){
  //   res.cookie("user_id", user_id).redirect("/");
  //   //res.redirect("/");
  // } else {
  //   res.status(403).send("Failed to authenticate");
  // }

});

app.post("/logout", (req, res) => {
  "use strict";
  res.clearCookie("user_id").redirect("/");
});

app.post("/register", (req, res) => {
  "use strict";
  let user_id = generateRandomString();
  let user = {
    id: user_id,
    email: req.body.email,
    password: req.body.password
  }

  console.log(users);

  //Check if email and password fields are empty
  if (!req.body.email || !req.body.password){
    res.status(400).send("Please enter an email and a password");
  };

  //Check if email entered already exists
  for (let key in users){
    if (users[key].email === req.body.email){
      res.status(400).send("Email address already exists");
      break;
    }
  }

  users[user_id] = user;
  res.cookie("user_id", user_id).redirect("/");
});

app.listen(PORT, () => {
  console.log(`Tiny App is listening on port ${PORT}!`);
});