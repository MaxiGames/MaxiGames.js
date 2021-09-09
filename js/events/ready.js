"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
  name: "ready",
  once: true,
  execute: function (client) {
    console.log("Ready! Logged in as " + client.user.tag);
    client.application.commands.set([]);
  },
};
//# sourceMappingURL=ready.js.map
