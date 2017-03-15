const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const randomString = require("randomstring");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString () {
  "use strict";
  return randomString.generate(6);
}


app.get("/", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new" ,{username: req.cookies["username"]});
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  "use strict";
  let shortURL = req.params.id;
  let fullURL = req.body.fullURL;
  urlDatabase[shortURL] = fullURL;
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
  let userName = req.body.username;
  res.cookie("username", userName);
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  "use strict";
  res.clearCookie("username");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});