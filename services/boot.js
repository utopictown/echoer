var axios = require("axios");
var Message = require("../models/message");
var Setting = require("../models/setting");
var rp = require("request-promise");

async function fetchMessage(req) {
  try {
    console.log("fetching message..");
    const response = await axios.get(
      `https://graph.facebook.com/${req.FBPageId}/conversations`,
      {
        params: {
          fields:
            "messages{id,from,message,created_time,attachments{image_data,video_data,file_url}}",
          access_token: req.FBPageToken,
        },
      }
    );
    let arr = [];
    for (const convo of response.data.data) {
      for (const msg of convo.messages.data) {
        const existMessage = await Message.findOne({
          message_id: msg.id,
        });
        if (!existMessage) {
          arr.push({
            message_id: msg.id,
            from: msg.from,
            message: msg.message,
            created_time: msg.created_time,
            attachments: msg.attachments,
          });
        }
      }
    }
    if (arr.length) await Message.insertMany(arr.reverse());
    console.log("message successfully fetched!");
  } catch (error) {
    console.error(error);
  }
}

async function addQueue() {
  try {
    console.log("collecting message..");
    const submissionFlag = process.env.SUBMISSION_FLAG;
    const messages = await Message.find({ is_sent: 0 });
    let toSendList = [];
    let batchIdx = 0;
    for (let i = 0; i < messages.length; i++) {
      const element = messages[i];
      if (element.message == submissionFlag) {
        let j = 1;
        while (
          messages[i + j] &&
          messages[i + j].message != submissionFlag &&
          messages[i + j].is_sent == 0
        ) {
          if (!toSendList[batchIdx]) toSendList[batchIdx] = [];
          toSendList[batchIdx].push(messages[i + j]);
          j++;
        }
        batchIdx++;
      }
    }
    console.log("message collected!");
    return toSendList;
  } catch (error) {
    console.error(error);
  }
}

async function postToPage(req, toSendList) {
  try {
    console.log("attempting to post messages to Page..");
    let query = [];
    for (const toSend of toSendList) {
      let messages = "";
      let imageIds = [];

      for (const convo of toSend) {
        query.push({
          updateOne: {
            filter: { _id: convo._id },
            update: { is_sent: 1 },
          },
        });
        messages = messages + convo.message + " ";

        if (convo.attachments) {
          imageIds = await Promise.all(
            convo.attachments.data.map((attachment) => {
              if (attachment.image_data) {
                return axios
                  .post(`https://graph.facebook.com/${req.FBPageId}/photos`, {
                    url: attachment.image_data.url,
                    published: false,
                    access_token: req.FBPageToken,
                  })
                  .then((res) => {
                    return res.data.id;
                  })
                  .catch((err) => reject(err));
              }
            })
          );
        }
      }

      formData = {
        message: messages
          .replace(/(^\s*)|(\s*$)/gi, "")
          .replace(/[ ]{2,}/gi, " ")
          .replace(/\n +/, "\n"),
        access_token: req.FBPageToken,
      };

      if (imageIds.length) {
        imageIds.forEach((imageId, key) => {
          formData[`attached_media[${key}]`] = JSON.stringify({
            media_fbid: imageId,
          });
        });
      }

      var options = {
        method: "POST",
        uri: `https://graph.facebook.com/${req.FBPageId}/feed`,
        formData: formData,
      };

      await rp(options);
    }

    // update sent message status
    await Message.bulkWrite(query);
    console.log("post sent successfully!");
  } catch (error) {
    console.error(error.response ? error.response.data : error);
  }
}

module.exports = async function boot(req) {
  try {
    const minutes = process.env.INTERVAL;
    if (!req.FBPageToken || !req.FBPageId) {
      res.redirect("/auth/login/facebook");
    } else {
      await fetchMessage(req);
      const queueData = await addQueue();
      await postToPage(req, queueData);
      const bootInterval = setInterval(async () => {
        const active = await Setting.findOne({ key: "booted", value: 1 });
        if (active) {
          await fetchMessage(req);
          const queueData = await addQueue();
          await postToPage(req, queueData);
        } else {
          console.log("operation has been shut down");
          clearInterval(bootInterval);
        }
      }, minutes * 60000);
    }
  } catch (error) {
    console.log(error);
  }
};
