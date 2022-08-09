require("dotenv").config();

const axios = require("axios");

// const voter = process.env.USER_PUBLIC_KEY;
const voter = process.env.PUBLIC_KEY;
const candidate = 3;
const value = 3;

(async () => {
  try {
    axios.post("http://localhost:3000/vote", {
      voter,
      candidate,
      value
    });
  } catch (e) {
    console.log(e);
  }
})();
