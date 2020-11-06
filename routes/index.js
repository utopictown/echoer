var express = require("express");
var router = express.Router();
var FB = require("fb");
var axios = require("axios");
const fetchMessages = require("../services/fetchMessages");

/* GET home page. */
router.get("/", function (req, res, next) {
  // if (req.user) {
  //   FB.setAccessToken(req.user);
  //   FB.api("/me/accounts", "get", function (res) {
  //     if (!res || res.error) {
  //       console.log(!res ? "error occurred" : res.error);
  //       return;
  //     }
  //     axios
  //       .post("https://graph.facebook.com/108053857726276/photos", {
  //         message: "nyoters",
  //         url: "https://wallpapercave.com/wp/wp2573765.jpg",
  //         access_token: res.data[0].access_token,
  //       })
  //       .then((res) => {
  //         console.log(res);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         return;
  //       });
  //   });
  // }
  console.log("indexx", req.FBPageToken);
  if (req.FBPageToken != null) fetchMessages(req);
  res.render("index", { title: "Express" });
});

module.exports = router;
