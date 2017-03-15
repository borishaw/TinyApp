const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  print: function () {
    "use strict";
    console.log(this.b2xVn2);
  }
};

urlDatabase['dhw4if'] = "http://www.facebook.com";

function counter() {
  this.age = 0;

  setInterval(() => {
    this.age += 1;
    console.log(this.age);
  }, 1000);
}

console.log(urlDatabase.print());