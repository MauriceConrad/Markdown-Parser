const pretty = require("pretty");

module.exports = {
  // Requiring rules from external file
  rules: require("./default-rules"),
  parse(mdString, options) {
    var self = this;
    // Setting default values for options (No 'fillDefaults' method used because of simplicity)
    options.rules = options.rules || self.rules;
    options.validDocument = options.validDocument || false;
    options.pretty = options.pretty || false;
    options.disallowedFeatures = options.disallowedFeatures || [];
    // Set to parse ready
    var html = "\n\n" + mdString + "\n";
    // Parse all rules
    options.rules.forEach(function(rule) {
      if (isAllowed(options.disallowedFeatures, rule.classes)) {
        // If replace parameters exists use them
        if ("query" in rule && "replace" in rule) {
          var regex = new RegExp(rule.query, "g");
          html = html.replace(regex, rule.replace);
        }
        // If a parsing method exists use it
        if ("parsing" in rule) {
          html = rule.parsing(html);
        }
      }
    });
    function isAllowed(disallow, classes = []) {
      for (var i = 0; i < disallow.length; i++) if (classes.indexOf(disallow[i]) > -1) return false;
      return true;
    }
    // Replace all line breaks to avoid bugs in beautifing process
    //html = html.replace(/\n/g, "");
    if (options.validDocument) {
      // Return valid html document
      html = '<!DOCTYPE html><html><head><title>Document</title></head><body>' + html + '</body></html>';
    }
    if (options.pretty) {
      // Beautify html result
      html = pretty(html);
    }
    return html;
  }
}

Array.prototype.indexOfKey = function(value, key, start = 0) {
  for (var i = start; i < this.length; i++) {
    if (this[i][key] === value) {
      return i;
    }
  }
  return -1;
}

String.prototype.indexesOf = function(regex, start) {
  var result = [];
  while (this.regexIndexOf(regex, (start || 0)) > -1) {
    start = this.regexIndexOf(regex, (start || 0)) + 1;
    result.push(start);
  }
  return result;
}
String.prototype.regexIndexOf = function(regex, startpos) {
  var indexOf = this.substring(startpos || 0).search(regex);
  return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
String.prototype.repeat = function(count) {
  var str = "";
  for (var i = 0; i < count; i++) str += this;
  return str;
}
String.prototype.matchAt = function(regex, start = 0) {
  var match = this.substring(start).match(regex);
  if (match != null) {
    // Set relative index relative to the extract of the string (substring)
    match.indexRel = match.index; // Mostly 0!
    // Set absolute index relative to the whole string
    match.index += start;
  }
  return match;
}
String.prototype.matchAll = function(regex, start = 0) {
  var result = {
    matches: [],
    input: this
  };
  while (this.matchAt(regex, start) != null) {
    var match = this.matchAt(regex, start);
    delete match.input;
    result.matches.push(match);
    start = match.index + match[0].length;
  }
  return result;
}
