const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const randomString = require("randomstring");
const filterValues = require('filter-values');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));
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
    password: "$2a$10$RhMwQa3CE8.3mW.DapIfSeCLzKSmuv4LOQdU0iaegZjhazgYyw9hq"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$mm6p4fvvYXgaU4F3aAwqROgI7l49j6z6Tnh0FVenn6fjRgr5./AzG"
  },
  "user3RanomID": {
    id: "user3RanomID",
    email: "borishaw@gmail.com",
    password: "$2a$10$/qRNh5JZTnDBC90/572aYeMwp7yomFr1mH.KHOyN1GGRUmpua2fem"
  }
};

function generateRandomString () {
  "use strict";
  return randomString.generate(6);
}


app.get("/", (req, res) => {
  req.session.user_id ? res.redirect("/urls") : res.redirect("/login");
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {urls: urlDatabase};
    let user_id = req.session.user_id;
    templateVars['user'] = users[user_id];
    templateVars['urls'] = filterValues(urlDatabase, function (value, key, obj) {
      return value.userID === user_id;
    });
    res.status(200).render("urls_index", templateVars);
  } else {
    res.status(401).send("<h1>Unauthorized</h1><p>Please <a href='/login'>login</a></p>");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id){
    let user_id = req.session.user_id;
    let user = users[user_id];
    res.status(200).render("urls_new" ,{user: user});
  } else {
    res.status(401).send("<h1>Unauthorized</h1><p>Please <a href='/login'>login</a></p>");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id){
    res.redirect("/");
  } else {
    res.status(200).render("register");
  }
});

app.get("/urls/:id", (req, res) => {

  let requestedID = req.params.id;

  //If requested ID doesn't exist
  if (!(requestedID in urlDatabase)){
    res.status(404).send("<h1>Requested short url does not exist</h1>")
  }

  if (req.session.user_id){

    //if logged in user does not match the user that owns this url
    if (urlDatabase[requestedID].userID !== req.session.user_id){
      res.status(403).send("<h1>This is not a short url you created</h1>");
    } else {

      let templateVars = {
        shortURL: req.params.id,
        fullURL: urlDatabase[req.params.id].url
      };

      let user_id = req.session.user_id;
      let user = users[user_id];
      templateVars.user = user;
      res.render("urls_show", templateVars);
    }

  } else {
    //if user is not logged in
    res.status(401).send("<h1>Unauthorized</h1><p>Please <a href='/login'>login</a></p>");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase){
    let fullURL = urlDatabase[req.params.shortURL].url;
    res.redirect(fullURL);
  }
  else {
    res.status(404).send("<h1>The short url requested is not in our database.</h1>");
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id){
    res.redirect("/");
  } else {
    res.status(200).render("login");
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  if (!req.session.user_id){
    res.status(401).send("<h1>Unauthorized</h1><p>Please <a href='/login'>login</a></p>");
  } else {
    let shortUrl = generateRandomString();
    let longUrl = req.body.longUrl
    urlDatabase[shortUrl] = {
      id: shortUrl,
      url: longUrl,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortUrl}`);
  }
});

app.post("/urls/:id", (req, res) => {

  let requestedID = req.params.id;

  if (!(requestedID in urlDatabase)){
    res.status(404).send("<h1>Requested short url does not exist</h1>")
  }

  if (!req.session.user_id){
    res.status(401).send("<h1>Unauthorized</h1><p>Please <a href='/login'>login</a></p>");
  } else {
    if (urlDatabase[requestedID].userID !== req.session.user_id){
      res.status(403).send("<h1>This is not a short url you created</h1>");
    } else {
      let shortURL = req.params.id;
      let fullURL = req.body.fullURL;
      urlDatabase[shortURL].url = fullURL;
      res.redirect(`/urls/${requestedID}`);
    }
  }
});

app.post("/urls/:id/delete", (req, res) => {
  "use strict";
  if (!req.session.user_id){
    res.redirect("/");
  } else {
    let id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls");
  }
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
      if (bcrypt.compareSync(password, users[key].password)){
        user_id = key;
        user = users[user_id];
        verified = true;
        break;
      }
    }
  }

  if (verified){
    req.session.user_id = user_id;
    res.redirect("/");
  } else {
    res.status(401).send("<h1>Failed to authenticate</h1>");
  }

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.post("/register", (req, res) => {

  //Check if email and password fields are empty
  if (!req.body.email || !req.body.password){
    res.status(400).send("Please enter an email and a password");
  }

  let okToProceed = true;

  //Check if email entered already exists
  for (let key in users){
    if (users[key].email === req.body.email){
      okToProceed = false;
      break;
    }
  }

  if (okToProceed){
    let user_id = generateRandomString();
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    console.log(users);
    req.session.user_id = user_id;
    res.redirect("/");
  } else {
    res.status(400).send("Email address already exists");
  }

});

app.listen(PORT, () => {
  console.log(`Tiny App is listening on port ${PORT}!`);
});