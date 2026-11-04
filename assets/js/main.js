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

// Reviews-carrousel: laadt assets/data/reviews.json en toont de reviews als die er zijn
(function () {
  var box = document.querySelector(".review-carousel");
  if (!box || !window.fetch) return;
  var track = box.querySelector(".review-track");
  fetch("assets/data/reviews.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (data) {
    var list = (data && data.reviews) || [];
    if (!list.length) return;
    list.forEach(function (rv) {
      var el = document.createElement("article");
      el.className = "review";
      var n = Math.max(1, Math.min(5, rv.sterren || 5));
      el.innerHTML = '<div class="stars" aria-label="' + n + ' van 5 sterren">' + "★★★★★".slice(0, n) + "</div><p></p><footer><strong></strong> <span></span></footer>";
      el.querySelector("p").textContent = rv.tekst || "";
      el.querySelector("strong").textContent = rv.naam || "";
      el.querySelector("footer span").textContent = rv.datum ? "· " + rv.datum : "";
      track.appendChild(el);
    });
    box.hidden = false;
    var step = function () { return track.querySelector(".review").offsetWidth + 24; };
    box.querySelector(".prev").addEventListener("click", function () { track.scrollBy({ left: -step() }); });
    box.querySelector(".next").addEventListener("click", function () { track.scrollBy({ left: step() }); });
    var timer = setInterval(function () {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) track.scrollTo({ left: 0 }); else track.scrollBy({ left: step() });
    }, 6000);
    box.addEventListener("mouseenter", function () { clearInterval(timer); });
  }).catch(function () {});
})();
