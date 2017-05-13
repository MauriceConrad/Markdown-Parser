# Use in Node.js

The parser is based on a node module. But to work within a web application, there is browserified version named 'bundle.js' within the 'js' folder.
The node module is contained in 'md_parser'.

```bash
npm install md_parser
```

# Use as command line tool (CLI)

```bash
npm install md_parser -g
```

## CLI Usage

```bash
md_parser <source> <outputFile>
```
1. The **1st** argument **(source)** is required. If it is a file, the file will be read.
2. The **2nd** argument is optional. If it's given, it will be handled as an output file. If it's not given, the result will be printed in console.


# Reference

## Markdown Parsing Process
The parser parses the following elements in this way:
* Bold text `**Bold**`
* Italic text `*Italic*`
* Striked text `~~Striked~~`
* Lists (a sub list needs two spaces) `* List item`
  * Unsorted lists (circular) `* Item`
  * Sorted lists (numeric) `1. Item`
  * Alphabetic Lists lower and upper (lower/upper-alpha) `a. Item` / `A. Item`
  * Roman Lists (upper-roman) `I. Item`
* Tables (Table Syntax of Github Markdown)
* Code Blocks (inline `<code></code>` and blocked `<pre><code></code></pre>`)

### List parsing

Please make sure that the lists will all be parsed as ```<ul>``` containing the specific list style as CSS rule.
**Why?**
Because of support for untypically lists like alphabetic and roman.

## Require
```javascript
const markdown = require('md_parser');
```

```javascript
// Returns the following
{
  parse: [Function],
  rules: [Array]
}
```

## API

The ```md_parser```instance returns the method ```parse``` and the array ```rules```. This array contains the default parsing rules and can be customized. You can see more below.

### Parse

```javascript
const markdown = require('md_parser');

var markdownStr = "# Title 1\n## Title 2\n\nParagraph"; // The string containing the markdown context

markdown.parse(markdownStr, {
  //rules: [], // Custom parsing rules. Don't use by default
  validDocument: true, // Wether the returned string is a valid HTML document with DOCTYPE, head, body etc.
  pretty: true // Wether the result is pretty printed
});
```

### Parsing Rules

The parsing rules are an array with some regular expressions and functions.

The default rules are located in the file ```default-rules.js```. These rules are sometimes just regular expressions and sometimes more complex functions.<br>
The ```md_parser``` instance contains such an array with the default rules. If you call the ```parse``` method and you don't pass a custom array with rules as option, the rules array of the ```md_parser``` instance will be used.

#### Parsing Rules Reference

A rules array contains objects as rules. Every object represents one markdown element.
<br>Have a look at the general structure of a rules array.

```javascript
// Rules array
[
  {...}, // Some other rules
  {
    name: "name-of-element", // The name of the element.
    query: '(.*)', // A regular expression string
    replace: '<myReplacement>$1</myReplacement>', // The replacement for the regex
    parse: function(str) {
      // Special parsing function that returns the parsed string
      return str;
    }
  },
  {...} // Some other rules
]
```

##### Example

You don't understand it?
<br>For example, let's have a look at the parsing rule for a ```strong``` tag:

```javascript
{
  name: "bold",
  query: '\\*{2}([^\\*]*)\\*{2}', // Queries bold text
  replace: '<strong>$1</strong>'
}
```

As you can see, a special `parse` function isn't required in this case. In some other cases there is no regular expression but just a special `parse` function within the rule object.
