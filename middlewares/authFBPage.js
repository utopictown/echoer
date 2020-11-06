var FB = require("fb");
module.exports = function authFBPage(req, res, next) {
  console.log("req.user ->", req.user);
  if (req.user) {
    FB.setAccessToken(req.user);
    FB.api("/me/accounts", "get", function (res) {
      if (!res || res.error) {
        console.log(!res ? "error occurred" : res.error);
        return;
      }
      req.FBPageToken = res.data[0].access_token;
      req.FBPageId = res.data[0].id;
      next();
    });
  } else {
    next();
  }
};
