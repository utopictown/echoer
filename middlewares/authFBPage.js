var FB = require("fb");
module.exports = function authFBPage(req, res, next) {
  if (req.user) {
    FB.setAccessToken(req.user);
    FB.api("/me/accounts", "get", function (res) {
      if (!res || res.error) {
        console.log(!res ? "error occurred" : res.error);
        return;
      }
      req.FBPageToken = res.data[0].access_token;
      req.FBPageId = res.data[0].id;
      console.log("logged in as ", res.data[0].name);
      next();
    });
  } else {
    next();
  }
};
