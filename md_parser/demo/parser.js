const markdown = require('../');
const fs = require('fs');

fs.readFile(__dirname + "/test2.md", "utf8", function(err, contents) {
  if (err) return console.error(err);
  var startTime = new Date().getTime();
  var htmlContext = markdown.parse(contents, {
    //rules: [], // Parsing rules
    validDocument: true, // Wether the returned string is a valid HTML document with DOCTYPE, head, body etc.
    pretty: true
  });
  var endTime = new Date().getTime();
  console.log(htmlContext);
  console.log(endTime - startTime);
});
