const filter = require('filter-values');

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

console.log(filteredResult);