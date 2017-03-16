const filter = require('filter-values');
const bcrypt = require('bcrypt');

let urlDatabase = {
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

let filteredResult = filter(urlDatabase, function (value, key, obj) {
  return value.userID === "user3RanomID";
});

const password = "password"; // you will probably this from req.params
const hashed_password = bcrypt.hashSync(password, 10);
console.log(hashed_password);
console.log(bcrypt.compareSync("purple-monkey-dinosaur", hashed_password));