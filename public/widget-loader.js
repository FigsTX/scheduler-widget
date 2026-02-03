(function () {
  "use strict";

  var WIDGET_ORIGIN = window.location.origin;

  // Find the script tag to read data attributes
  var scripts = document.querySelectorAll(
    'script[data-provider][data-element]'
  );

  scripts.forEach(function (script) {
    var providerId = script.getAttribute("data-provider");
    var elementId = script.getAttribute("data-element");
    if (!providerId || !elementId) return;

    var target = document.getElementById(elementId);
    if (!target) {
      console.warn(
        "[BookingWidget] Target element #" + elementId + " not found."
      );
      return;
    }

    // Create wrapper
    var wrapper = document.createElement("div");
    wrapper.style.cssText =
      "position:relative;width:100%;max-width:420px;margin:0 auto;";
    wrapper.setAttribute("data-booking-widget", providerId);

    // Create iframe
    var iframe = document.createElement("iframe");
    iframe.src = WIDGET_ORIGIN + "/embed/" + providerId;
    iframe.style.cssText =
      "width:100%;border:none;border-radius:12px;transition:all 0.3s ease;";
    iframe.setAttribute("title", "Appointment Booking Widget");
    iframe.setAttribute("allow", "clipboard-write");

    // Inline state: auto-resize height based on content
    var INLINE_HEIGHT = "520px";
    var EXPANDED_HEIGHT = "100vh";

    iframe.style.height = INLINE_HEIGHT;

    // Overlay backdrop (hidden by default)
    var backdrop = document.createElement("div");
    backdrop.style.cssText =
      "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;transition:opacity 0.3s ease;opacity:0;";

    backdrop.addEventListener("click", function () {
      collapseAndReset();
    });

    // Close button (visible only when expanded)
    var closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", "Close booking widget");
    closeBtn.style.cssText =
      "display:none;position:fixed;top:max(5vh,12px);right:max(calc((100vw - 480px)/2 - 48px), 12px);z-index:10000;" +
      "width:36px;height:36px;border-radius:50%;border:none;background:#fff;color:#333;" +
      "font-size:22px;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);" +
      "display:none;align-items:center;justify-content:center;transition:opacity 0.2s ease;";
    closeBtn.addEventListener("click", function () {
      collapseAndReset();
    });

    wrapper.appendChild(iframe);
    target.appendChild(wrapper);
    document.body.appendChild(backdrop);
    document.body.appendChild(closeBtn);

    var isExpanded = false;

    function expand() {
      if (isExpanded) return;
      isExpanded = true;

      // Show backdrop
      backdrop.style.display = "block";
      requestAnimationFrame(function () {
        backdrop.style.opacity = "1";
      });

      // Show close button
      closeBtn.style.display = "flex";

      // Move iframe to fixed fullscreen
      iframe.style.position = "fixed";
      iframe.style.top = "50%";
      iframe.style.left = "50%";
      iframe.style.transform = "translate(-50%, -50%)";
      iframe.style.width = "min(100vw, 480px)";
      iframe.style.height = "min(100vh, 90vh)";
      iframe.style.maxHeight = "100vh";
      iframe.style.zIndex = "9999";
      iframe.style.boxShadow = "0 25px 50px -12px rgba(0,0,0,0.25)";
      iframe.style.borderRadius = "12px";
    }

    function collapse() {
      if (!isExpanded) return;
      isExpanded = false;

      // Hide close button
      closeBtn.style.display = "none";

      // Hide backdrop
      backdrop.style.opacity = "0";
      setTimeout(function () {
        backdrop.style.display = "none";
      }, 300);

      // Revert iframe to inline
      iframe.style.position = "relative";
      iframe.style.top = "";
      iframe.style.left = "";
      iframe.style.transform = "";
      iframe.style.width = "100%";
      iframe.style.height = INLINE_HEIGHT;
      iframe.style.maxHeight = "";
      iframe.style.zIndex = "";
      iframe.style.boxShadow = "";
    }

    // Collapse AND tell the iframe to reset its state back to calendar
    function collapseAndReset() {
      iframe.contentWindow.postMessage({ type: "WIDGET_RESET" }, "*");
      collapse();
    }

    // Listen for postMessage from the iframe
    window.addEventListener("message", function (event) {
      // Only accept messages from our iframe
      if (event.source !== iframe.contentWindow) return;

      var data = event.data;
      if (!data || typeof data.type !== "string") return;

      switch (data.type) {
        case "WIDGET_EXPAND":
          expand();
          break;
        case "WIDGET_COLLAPSE":
          collapse();
          break;
      }
    });
  });
})();
