module.exports = {
  name: "ready",
  once: true,
  execute: function (client) {
    console.log("Ready! Logged in as " + client.user.tag);
  },
};
