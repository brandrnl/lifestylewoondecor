// Lifestyle Woondecor — menu, scroll-animatie en contactformulier
(function () {
  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");

  function setHeaderBottom() {
    if (!header) return;
    var r = header.getBoundingClientRect();
    root.style.setProperty("--header-bottom", Math.max(0, r.bottom) + "px");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setHeaderBottom();
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.querySelector(".label").textContent = open ? "Sluiten" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) toggle.click();
    });
  }
  window.addEventListener("resize", setHeaderBottom);
  window.addEventListener("scroll", setHeaderBottom, { passive: true });

  // Beelden en blokken rustig laten verschijnen
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Contactformulier: opent een e-mail aan de showroom met de ingevulde gegevens
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var lines = [
        "Naam: " + (d.get("naam") || ""),
        "Telefoon: " + (d.get("telefoon") || ""),
        "E-mail: " + (d.get("email") || ""),
        "Onderwerp: " + (d.get("onderwerp") || ""),
        "",
        d.get("bericht") || ""
      ];
      var subject = "Vraag via de website: " + (d.get("onderwerp") || "algemeen");
      window.location.href = "mailto:info@lifestylewoondecor.nl?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }
})();
