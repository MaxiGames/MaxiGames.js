var fs = require("fs");
// Function to get current filenames
// in directory
filenames = fs.readdirSync(__dirname);
console.log("\nCurrent directory filenames:");
filenames.forEach(function (file) {
  console.log(file);
});
