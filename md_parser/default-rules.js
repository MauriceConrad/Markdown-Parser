const pretty = require('pretty');

module.exports = (function() { // Retuns a array that is dynamically genrated
  // Generating title rules dynamically
  var parsingRules = [];
  var titleLevels = 6;
  // Repeat 'maximum title level' times
  for (var i = 0; i < titleLevels; i++) {
    var level = i + 1;
    // Pushs the dynamically generated rule to the array
    parsingRules.push({
      name: "h" + level, // Name is just a label
      classes: ["default", "title"],
      query: '(\\s|\\n)' + ("#").repeat(level) + '\\s(.*)', // Generate the query with dynamic #'s
      replace: '\n$1<h' + level + '>$2</h' + level + '>\n' // Set the h{level}
    });
  }
  // Pushs simple 'static' rules normally to the array
  parsingRules.push({
    name: "anchor",
    classes: ["default"],
    query: '[^?!$]\\[(.*)\\]\\(([^\"\(\)]*)\\)', // Queries a markdown link
    replace: '<a href="$2">$1</a>'
  }, {
    name: "lists",
    classes: ["default"],
    parsing: function(str) {
      // Syntax List Regex = (\*|[0-9]{1,}\.|[a-z]{1,}\.|[A-Z]{1,}\.|(I|V|X){1,}\.)
      var liRegex = /(\n|)( *)(\*|[0-9]{1,}\.|[a-z]{1,}\.|[A-Z]{1,}\.|(I|V|X){1,}\.) .*/;
      function getLineLevel(line) {
        var levelRegex = /( *)(\*|[0-9]{1,}\.|[a-z]{1,}\.|[A-Z]{1,}\.|(I|V|X){1,}\.) /;
        var levelMatch = line.match(levelRegex);
        return levelMatch ? levelMatch[1].length : -1;
      }
      function getLowerLine(listStr, listItem) {
        var endPos = listStr.indexOf("\n", listItem.index + 1);
        var lastPos = listStr.indexOf("\n", endPos + 1);
        return listStr.substring(endPos, lastPos > -1 ? lastPos : Infinity);
      }
      function getItemType(li) {
        var typeMatch = li.match(liRegex);
        if (!typeMatch) return null;
        var typeChecks = {
          "decimal": typeMatch[3].search(/[0-9]{1,}\./) > -1,
          "lower-alpha": typeMatch[3].search(/[a-z]\./) > -1,
          "upper-alpha": typeMatch[3].search(/[A-Z]\./) > -1,
          "upper-roman": typeMatch[3].search(/(i|v|x){1,}\./i) > -1
        }
        var type = "unsorted";
        Object.keys(typeChecks).forEach(function(key) {
          if (typeChecks[key]) type = key;
        });
        return type;
      }
      // Get all lists
      var listRegex = /\n( *)[^0-9a-z\*\ \.]?.*(\n( *)(\*|[0-9]{1,}\.|[a-z]{1,}\.|[A-Z]{1,}\.|(I|V|X){1,}\.) .*){1,}\n[^0-9a-z\*\ \.]/;
      //listRegex = /\n( *)[^0123456789\ \.]?.*(\n( *)[0-9]{1,}\. .*){1,}\n[^0123456789\ \.]/;
      var searchCursor = 0;
      while (str.matchAt(listRegex, searchCursor) != null) {
        // Parse the current list (looped)
        var match = str.matchAt(listRegex, searchCursor);
        // Getting the list extracted
        var listStartPos = match[0].search(/\n(\*|[0-9]{1,}\.|[a-z]{1,}\.|[A-Z]{1,}\.|(I|V|X){1,}\.)( *) /) + 1;
        var listEndPos = match[0].length - 2;
        var list = match[0].substring(listStartPos, listEndPos);
        // Return the parsed HTML string of the list
        var html = (function(str) {
          // Get all li items of the current list
          //liRegex = /(\n|)( *)[0-9]{1,}\. .*/;
          var lis = str.matchAll(liRegex);
          // Current item string (empty) (contains all items of the list)
          var itemStr = "";
          var mainType = getItemType(list);
          lis.matches.forEach(function(li) {
            // Get the level of the line lower (Returns -1 if related line is not a part of the list)
            var lowerLine = getLowerLine(str, li);
            var levelLower = getLineLevel(lowerLine);
            var lowerType = getItemType(lowerLine);
            // Set base item string (Replacing the ' * ' markdown syntax because it's not needed)
            itemStr += '<li>' + li[0].replace(/\n( *)(\*|[0-9]{1,}\.|[a-z]{1,}\.|[A-Z]{1,}\.|(I|V|X){1,}\.) /, "") + '</li>';
            // Get the difference between the current and the lower line level
            var lowerDiff = (levelLower > 0 ? levelLower : 0) - getLineLevel(li[0]);
            // If lower diff is positive, open a new sublist
            if (lowerDiff > 0) {
              itemStr += '\n<li style="list-style: none;"><ul style="list-style: ' + lowerType + ';">';
            }
            // If lower diff is negative, close all sublists (diff / 2 because 2 spaces are a 'tab')
            else if (lowerDiff < 0) {
              itemStr += '</ul></li>'.repeat(Math.abs(lowerDiff) / 2);
            }
          });
          return '<ul style="list-style: ' + mainType + ';">\n' + itemStr + '</ul>';
        })(match[0]);
        str = str.substring(0, match.index + listStartPos) + html + str.substring(match.index + listEndPos);
        searchCursor = match.index + listStartPos + html.length + 1;
      }
      return str;
    }
  }, {
    name: "table",
    classes: ["github"],
    parsing: function(str) {
      // Selects all table starts with a simple regex that selects the first and second row
      var tableRegex = /\n(\|.*\n){2,}/;
      var pos = 0;
      while (str.regexIndexOf(tableRegex, pos) > -1) {
        var start = str.regexIndexOf(tableRegex, pos);
        var end = str.regexIndexOf(/\n[^\|]/, start);
        var tableStr = str.substring(start, end);

        var rows = tableStr.split("\n").filter(row => row != "");
        function filterRow(rows) {
          return rows.split("|").filter(column => column.search(/[^ \n]/) > -1)
        }
        function getColumn(tagName, column, i) {
          return '<' + tagName + (aligns[i] != "none" ? (' style="text-align: ' + aligns[i] + '"') : '') + '>' + column + '</' + tagName + '>'
        }
        var aligns = filterRow(rows[1]).map(function(column) {
          var leftAlign = (" " + column).search(/[^\-]\:-{1,}/) > -1;
          var rightAlign = (column + " ").search(/-{1,}\:[^\-]/) > -1;
          return leftAlign && rightAlign ? "center" : (leftAlign ? "left" : (rightAlign ? "right" : "none"));
        });
        var header = '<tr>\n' + filterRow(rows[0]).map(function(column, index) {
          return getColumn("th", column, index);
        }).join("\n") + '\n</tr>';
        var body = rows.splice(2).map(function(row) {
          return '<tr>\n' + filterRow(row).map(function(column, index) {
            return getColumn("td", column, index);
          }).join("\n") + '</tr>';
        });
        var html = '<table>\n' + header + '\n' + body.join("\n") + '\n</table>';

        pos = end + (html.length - tableStr.length) + 1;
        str = str.substring(0, start) + html + str.substring(end)
      }
      return str;
    }
  }, {
    name: "blockquote",
    classes: ["default"],
    parsing: function(str) {
      var pos = 0;
      var blockQuoteStartRegex = /\n(>.*\n){1,}/;
      // Loop trough all blockqoutes
      while (str.regexIndexOf(blockQuoteStartRegex, pos) > -1) {
        // Set start position of current blockquote
        var start = str.regexIndexOf(blockQuoteStartRegex, pos);
        // Set end position of current blockquote
        var end = str.indexOf("\n\n", start);
        // Whole markup string of the current blockquote
        var quoteStr = str.substring(start, end);
        var html = '\n\n<blockquote>\n' + quoteStr.replace(/\n>(\s)?/g, "$1") + '\n</blockquote>\n';
        str = str.substring(0, start) + html + str.substring(end);
        // Set new position to search for another blockquote
        pos = end + (html.length - quoteStr.length) + 1;
      }
      return str;
    }
  }, {
    name: "pre-code",
    classes: ["github"],
    parsing: function(str) {
      var codeRegex = /`{1,}(([^`\n]*)\n)?([^`]*)`{1,}/;
      var pos = 0;
      while (str.matchAt(codeRegex, pos) != null) {
        var code = str.matchAt(codeRegex, pos);
        // Replace XML/HTML brackets
        var codeContext = code[3].replace(/</g, "&#x3c;").replace(/>/g, "&#x3e;");
        // Replace Markdown syntax
        codeContext = codeContext.replace(/(\*|\[|\]|~|\n)/g, "\\$1");
        if (code[1]) {
          // Code block
          var html = '<pre><code data-language="' + code[2] + '">' + codeContext + '</code></pre>';
        }
        else {
          // Inline code
          var html = '<code>' + codeContext + '</code>';
        }
        str = str.substring(0, code.index) + html + str.substring(code.index + code[0].length);
        pos = code.index + html.length + 1;
      }
      return str;
    }
  }, {
    name: "details",
    classes: ["3rd-party", "extern", "html5"],
    query: '\n=> ?(.*)\n((\ {2,}.*\n){1,})',
    replace: '\n\n<details><summary>$1</summary><p>$2</p></details>\n\n'
  }, {
    name: "frame",
    classes: ["3rd-party", "extern"],
    query: '\\$\\[(.*)]\\(([^\"\(\)]*)\\)(\\{([0-9]{1,})?x([0-9]{1,})?\\})?',
    replace: '<iframe src="$2">$1</iframe>'
  },/* {
    name: "image",
    classes: ["default"],
    query: '!\\[(.*)]\\(([^\\"\(\\)]*)\\)(\\{([0-9]{1,})?x([0-9]{1,})?\\})?', // Queries a markdown link that is used for images (GitHub Markdown)
    replace: '<img src="$2" alt="$1" width="$4" height="$5">'
  },*/ {
    name: "image",
    classes: ["default"],
    parsing: function(str) {
      var pos = 0;
      var imgRegex = new RegExp('!\\[(.*)]\\(([^\\"\(\\)]*)\\)(\\{([0-9]{1,})?x([0-9]{1,})?\\})?');
      while (str.matchAt(imgRegex, pos) != null) {
        var image = str.matchAt(imgRegex, pos);
        var html = '<img src="' + image[2] + '" alt="' + image[1] + '"' + (image[4] ? (' width="' + image[4] + '"') : '') + (image[5] ? (' height="' + image[5] + '"') : '') + '>';
        str = str.substring(0, image.index) + html + str.substring(image.index + image[0].length);
        pos = image.index + 1;
      }
      return str;
    }
  }, {
    name: "abbreviation",
    classes: ["3rd-party", "extern"],
    query: '\\?\\[(.*)]\\(([^\"\(\)]*)\\)',
    replace: '<abbr title="$2">$1</abbr>',
    additional: true
  }, {
    name: "paragraph",
    classes: ["default"],
    // Parsing method to avoid useless and spam paragraphs
    parsing: function(str) {
      // Joins the paragraphs from array (split)
      var html = str.split(/\n{2,}/).map(paragraph => {
        // Check wether a string is a paragraph. True if no block elements like h1, ul, table etc. are contained and the paragraph isn't empty (paragraph spam)
        function isParagraph(p) {
          // Array contaning the block elemnt tag names that are forbidden
          var blockTags = ["ul", "table", "blockquote", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "details"]; // Checks for existing block tags because markdown also supports inline html tags and they're therefore 'paragraph spam'
          // Creating the regular expression from the array
          var blockTagRegex = new RegExp('<(' + blockTags.join("|") + ')( [^<>]*|)>[^]*</(' + blockTags.join("|") + ')>');
          // Returns if it matches the regex and isn't empty.
          return p.match(blockTagRegex) ? false : p.search(/./) > -1;
        }
        return isParagraph(paragraph) ? ("<p>\n" + paragraph + "\n</p>") : paragraph;
      }).join("\n");
      return html;
    }
  }, {
    name: "bold",
    classes: ["default"],
    query: '([^\\\\])\\*{2}([^\\*]*)\\*{2}', // Queries bold text
    replace: '$1<strong>$2</strong>'
  }, {
    name: "italic",
    classes: ["default"],
    query: '([^\\\\])\\*{1}([^\\s][^\\*\n]*)\\*{1}', // Queries italic text
    replace: '$1<i>$2</i>'
  }, {
    name: "striked",
    classes: ["github"],
    query: '([^\\\\])~{2}([^\\s][^~]*)~{2}', // Queries italic text
    replace: '$1<s>$2</s>'
  }, {
    name: "line-break-delete",
    query: '\n',
    replace: ' '
  }, {
    name: "markdown-syntax-protect",
    query: '\\\\(\\*|\\[|\\]|~|\\n)',
    replace: '$1'
  }, {
    name: "markdown-syntax-protect",
    query: '\\\\ ',
    replace: '\n'
  });
  return parsingRules;
})();
