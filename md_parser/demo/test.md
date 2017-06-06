# Markdown

## Paragraph

This is a paragraph!

## Bold

**This is bold text**

## Italic

*This is italic text*

## Striked

~~This is striked text~~

## Blockquote

> A nice blockquote



## Link

[Google](http://www.google.de)

## Code

```javascript
var x = 100;
Nope
```

`Inline Code`

## List

* Item 1
* Item 2
* Item 3
  * Item 3.1
  * Item 3.2
    * Item 3.2.1
    * Item 3.2.2
    * Item 3.2.3
  * Item 3.3
    * Item 3.3.1
    * Item 3.3.2
  * Item 3.4
    1. Ordered Item
    1. Ordered Item
      a. Alphabetic Item
      a. Alphabetic Item
      a. Alphabetic Item
      a. Alphabetic Item
    1. Ordered Item
      I. Roman Item
      I. Roman Item
      I. Roman Item
      I. Roman Item


## Table

| Header One     | Header Two     |
| :------------- | -------------: |
| Item One       | Item Two       |
| Item Three     | Item Four      |

## Image

The possibility to set the images size is an additional feauture.
Add `{WIDTHxHEIGHT}` at the end of the image reference.

![Image Title](http://maurice-conrad.eu/acting/images/big-schach-4.jpg){500x}

## Abbreviation

This is not a part of the official Markdown syntax but an implementation of ```<abbr></abbr>``` using the link syntax with the `?` prefix. The parsing rule has the classes `3rd-party` and `extern`.

The ?[Developer (Hover me!)](Maurice Conrad) of this parser loves JavaScript, HTML5 and Markdown ;-)

## iFrame

This is not a part of the official Markdown syntax but an implementation of ```<iframe></iframe>``` using the link syntax with the `$` prefix. The parsing rule has the classes `3rd-party` and `extern`.

$[Frame Title](http://maurice-conrad.eu)

## Details

This is not a part of the official Markdown syntax but an implementation of ```<details></details>```. The parsing rule has the classes `3rd-party`, `extern` & `html5`.

=> Summary
   Details!
   More details!
