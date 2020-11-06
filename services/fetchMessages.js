var axios = require("axios");

module.exports = function fetchMessages(req) {
  // console.log("lhaa", req.FBPageToken);
  // if (!req.FBPageToken || !req.FBPageId) {
  //   console.log("no token");
  // } else {
  //   axios
  //     .get(`https://graph.facebook.com/${req.FBPageId}/conversations`, {
  //       params: {
  //         fields: "messages{message,attachments,from}",
  //         access_token: req.FBPageToken,
  //       },
  //     })
  //     .then((conversations) => {
  //       console.log(JSON.stringify(conversations.data));
  //     });
  //   // res.send("respond with a resource");
  // }
  // next();
  const minutes = 1;
  setInterval(() => {
    console.log("eey");
  }, minutes * 60000);
};
