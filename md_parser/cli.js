#! /usr/bin/env node
const markdown = require('.');
const fs = require('fs');

var args = process.argv.splice(2);


if (args.length >= 1) {
  fs.exists(args[0], function(exists) {
    var md = args[0];
    if (exists) {
      md = fs.readFileSync(args[0], "utf8");
    }
    var htmlContext = markdown.parse(md, {
      validDocument: true,
      pretty: true
    });
    if (args.length >= 2) {
      fs.writeFile(args[1], htmlContext, function(err) {
        if (err) return console.error(err);
        console.log("Parsed to HTML:\n\n", args[1], "\n");
      })
    }
    else {
      console.log(htmlContext);
    }
  });
}
else {
  return console.error("\nError:\nAt least 1 argument is required!\n\n$ md_parser <source> <output>\n");
}
