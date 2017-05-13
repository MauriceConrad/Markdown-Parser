(function() {
  window.addEventListener("load", function(event) {
    var input = document.getElementsByClassName("input-text")[0];
    var renderView = document.getElementsByClassName("render-view")[0];
    var codeView = document.getElementsByClassName("code-view")[0];
    var btnChooseFile = document.getElementsByClassName("btn-choose-file")[0];
    var inputFileFaker = document.getElementsByClassName("file-input-fake")[0];
    var mainApp = document.getElementsByClassName("app")[0];
    var btnExport = document.getElementsByClassName("btn-export")[0];

    // Initialize the input field for rendering
    input.addEventListener("input", function(event) {
      renderMd(this.value + "\n", renderView, codeView);
    });

    // Initialize the file chooser for rendering
    btnChooseFile.addEventListener("click", function() {
      inputFileFaker.click();
    });
    inputFileFaker.addEventListener("change", function(event) {
      loadMdFile(event.target.files[0]);
    });

    // Initialize drag n' drop for rendering dragged file
    mainApp.addEventListener("dragover", function(event) {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    });
    mainApp.addEventListener("drop", function(event) {
      event.stopPropagation();
      event.preventDefault();
      var file = event.dataTransfer.files[0];
      loadMdFile(file);
    });

    // Initialize export function
    btnExport.addEventListener("click", function() {
      var result = Markdown.parse(input.value, {
        validDocument: true,
        pretty: true
      });
      var dataUrl = 'data:text/html;utf8,' + encodeURIComponent(result);
      window.open(dataUrl);
    });

    function loadMdFile(file) {
      if (file.type === "text/markdown") {
        var reader = new FileReader();
        reader.addEventListener("load", function(contents) {
          input.value = this.result;
          renderMd(input.value + "\n", renderView, codeView);
        });
        reader.readAsText(file);
      }
    }
    // Loading samp´le
    var sampleXhr = new XMLHttpRequest();
    sampleXhr.open("GET", "md_parser/demo/test.md");
    sampleXhr.addEventListener("readystatechange", function() {
      if (this.readyState == 4) {
        input.value = this.responseText;
        renderMd(input.value + "\n", renderView, codeView);
      }
    });
    sampleXhr.send();
  });

  function renderMd(markdown, output, codeView) {
    var str = Markdown.parse(markdown, {
      validDocument: false,
      pretty: true
    });
    output.innerHTML = str;
    var codeBlock = document.createElement("pre");
    var code = document.createElement("code");

    code.appendChild(document.createTextNode(str));
    codeBlock.appendChild(code);
    codeView.setContent(codeBlock);
    hljs.highlightBlock(code);

    var codeBlocks = output.getElementsByTagName("pre");
    for (var i = 0; i < codeBlocks.length; i++) {
      codeBlocks[i].classList.add("hljs-highligted");
      var codeElement = codeBlocks[i].getElementsByTagName("code")[0];
      codeElement.classList.add(codeElement.getAttribute("data-language") || "bash");
      hljs.highlightBlock(codeElement);
    }
  }

  HTMLElement.prototype.setContent = function(child) {
    while (this.childNodes.length > 0) this.removeChild(this.childNodes[0]);
    this.appendChild(child);
  }


  window.addEventListener("gesturestart", function() {
    event.preventDefault();
  });
  window.addEventListener("gesturechange", function() {
    event.preventDefault();
  });
  window.addEventListener("gestureend", function() {
    event.preventDefault();
  });
})();
