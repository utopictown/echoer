var express = require("express");
var router = express.Router();
var axios = require("axios");

/* GET users listing. */
router.get("/", function (req, res, next) {
  if (!req.FBPageToken || !req.FBPageId) {
    res.redirect("/auth/login/facebook");
  } else {
    axios
      .get(`https://graph.facebook.com/${req.FBPageId}/conversations`, {
        params: {
          fields: "messages{message,attachments,from}",
          access_token: req.FBPageToken,
        },
      })
      .then((conversations) => {
        console.log(conversations.data);
        res.render("messages", { data: conversations.data });
      });
    // res.send("respond with a resource");
  }
});

module.exports = router;
