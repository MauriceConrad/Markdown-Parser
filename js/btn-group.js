(function() {
  window.addEventListener("click", function(event) {
    var validBtn = parentMatches(event.target, ".btn-group > button"); // If the target matches with the query selector
    if (validBtn.success) {
      var button = validBtn.parents[validBtn.parents.length - 1];
      var group = button.parentNode;
      var activeViewClass = group.getAttribute("data-active-view-class") || "";
      var btns = group.getElementsByTagName("button");
      // Set all buttons and views to disabled
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove("active");
        var selector = btns[i].getAttribute("data-target") || "";
        var view = document.querySelector(selector);
        if (view) view.classList.remove(activeViewClass);
      }
      // Set active button and view
      button.classList.add("active");
      var activeSelector = button.getAttribute("data-target") || "";
      var activeView = document.querySelector(activeSelector);
      if (activeView) activeView.classList.add(activeViewClass);
    }
  });
  function parentMatches(currParent, selector) {
    var parents = [];
    while (currParent.tagName != undefined) {
      parents.push(currParent);
      if (currParent.matches(selector)) {
        return {
          success: true,
          parents: parents
        }
      }
      currParent = currParent.parentNode;
    }
    return {
      success: false,
      parents: parents
    }
  }

})();
