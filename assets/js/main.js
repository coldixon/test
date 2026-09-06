/* MixxMedia — small progressive-enhancement helpers */
(function () {
  "use strict";

  // --- Mobile nav toggle ---
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (link) {
      link.addEventListener("click", function () { nav.classList.remove("is-open"); });
    });
  }

  // --- Header shadow on scroll ---
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // --- Scroll reveal ---
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // --- Contact form (static, no backend) ---
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form__status");
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var service = (data.get("service") || "").toString();
      var message = (data.get("message") || "").toString().trim();

      // Build a mailto so the message goes somewhere even without a backend.
      var subject = encodeURIComponent("Project inquiry" + (service ? " — " + service : ""));
      var body = encodeURIComponent(
        "Name: " + name + "\nEmail: " + email + "\nService: " + service + "\n\n" + message
      );
      var to = form.getAttribute("data-mailto") || "hello@mixxmedia.co";

      if (status) {
        status.textContent = "Opening your email app…";
        status.classList.add("ok");
      }
      window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
    });
  }

  // --- Footer year ---
  var yearEl = document.querySelector("#year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
})();
