"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var process_1 = require("process");
var commands = [];
// NOTE: The directory "commands" should contain subdirectories to organise js commands.
var commandFiles = fs
  .readdirSync("./dist/src/commands")
  .map(function (file) {
    return path.join("./dist/src/commands", file);
  })
  .filter(function (file) {
    return fs.lstatSync(file).isDirectory();
  })
  .map(function (dir) {
    return [
      dir,
      fs.readdirSync(dir).filter(function (file) {
        return file.endsWith(".js");
      }),
    ];
  });
for (
  var _i = 0, commandFiles_1 = commandFiles;
  _i < commandFiles_1.length;
  _i++
) {
  var filecol = commandFiles_1[_i];
  for (var _a = 0, _b = filecol[1]; _a < _b.length; _a++) {
    var name_1 = _b[_a];
    var command = require("../" + path.join(filecol[0], name_1)); // funny path-fu
    try {
      command["default"].data.toJSON();
    } catch (_c) {
      (0, process_1.exit)(1);
    }
  }
}
(0, process_1.exit)(0);
