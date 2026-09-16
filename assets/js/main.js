/* =========================================================
   von Dungen — Interaktionen
   Kein Framework, keine fremden Skripte.
   ========================================================= */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hatIO = "IntersectionObserver" in window;
  function klemme(v, a, b) { return Math.min(b, Math.max(a, v)); }

  document.querySelectorAll("[data-jahr]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Kopfleiste ---------- */
  var kopf = document.getElementById("kopf");
  function kopfHoehe() { return kopf ? kopf.offsetHeight : 0; }
  function messeKopf() {
    if (kopf) html.style.setProperty("--kopf-h", kopf.offsetHeight + "px");
  }
  messeKopf();
  window.addEventListener("resize", messeKopf);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(messeKopf);

  /* ---------- Handy-Menü ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function schliesseNav() {
    if (!burger || !nav) return;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }
  if (burger && nav) {
    burger.addEventListener("click", function () {
      if (burger.getAttribute("aria-expanded") === "true") { schliesseNav(); return; }
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Menü schließen");
      if (kopf) nav.style.setProperty("--kopf-unten", Math.round(kopf.getBoundingClientRect().bottom) + "px");
      nav.classList.add("is-open");
      document.body.classList.add("nav-open");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) schliesseNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") schliesseNav(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1060) schliesseNav(); });
  }

  /* ---------- Hausschnitt baut sich beim Laden auf ----------
     Erst nach dem ersten Bild, damit die Animation nicht schon vorbei ist,
     bevor die Seite überhaupt zu sehen ist. */
  var schnitt = document.getElementById("schnitt-held");
  if (schnitt && !reduceMotion) {
    window.requestAnimationFrame(function () { schnitt.classList.add("baut-auf"); });
  }

  /* ---------- Schicht für Schicht ----------
     Nur am großen Bildschirm mit genug Höhe: Die Zeichnung bleibt stehen,
     der Scrollweg des Abschnitts wird in fünf gleiche Stücke geteilt.
     Überall sonst bleibt die Zeichnung komplett und die Liste offen. */
  var aufbau = document.querySelector("[data-aufbau]");
  var buehne = aufbau ? aufbau.querySelector(".aufbau__buehne") : null;
  var schritte = aufbau ? Array.prototype.slice.call(aufbau.querySelectorAll(".schritt")) : [];
  var ANZAHL = schritte.length;
  var aufbauMedien = window.matchMedia("(min-width: 1001px) and (min-height: 640px)");
  var aufbauAn = false;
  var letzter = -1;

  function setzeSchritt(n) {
    if (n === letzter) return;
    letzter = n;
    for (var i = 1; i <= ANZAHL; i++) {
      aufbau.classList.toggle("ab-" + i, i <= n);
      aufbau.classList.toggle("aktiv-" + i, i === n);
    }
    schritte.forEach(function (li, i) {
      li.classList.toggle("is-aktiv", i + 1 === n);
      li.classList.toggle("is-fertig", i + 1 < n);
    });
  }

  function pruefeAufbau() {
    if (!aufbau) return;
    var soll = !reduceMotion && aufbauMedien.matches;
    if (soll === aufbauAn) return;
    aufbauAn = soll;
    html.classList.toggle("aufbau-an", soll);
    letzter = -1;
    if (!soll) {
      for (var i = 1; i <= ANZAHL; i++) aufbau.classList.remove("ab-" + i, "aktiv-" + i);
      schritte.forEach(function (li) { li.classList.remove("is-aktiv", "is-fertig"); });
    }
  }
  pruefeAufbau();
  if (aufbauMedien.addEventListener) aufbauMedien.addEventListener("change", function () { pruefeAufbau(); bild(); });

  // Klick auf einen Schritt springt an seine Stelle im Scrollweg
  schritte.forEach(function (li, i) {
    li.addEventListener("click", function (e) {
      if (!aufbauAn || e.target.closest("a")) return;
      var weg = aufbau.offsetHeight - buehne.offsetHeight;
      var oben = aufbau.getBoundingClientRect().top + window.scrollY - kopfHoehe() - window.innerHeight * 0.15;
      window.scrollTo({ top: oben + weg * (i + 0.5) / ANZAHL, behavior: "smooth" });
    });
  });

  /* ---------- Ein gemeinsamer Scroll-Takt ---------- */
  var geplant = false;
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];

  function bild() {
    geplant = false;
    if (kopf) kopf.classList.toggle("is-stuck", window.scrollY > 8);

    if (aufbauAn && buehne) {
      var r = aufbau.getBoundingClientRect();
      var weg = aufbau.offsetHeight - buehne.offsetHeight;
      // Die Bühne klebt unter der Kopfleiste. Jede Schicht kommt etwas früher,
      // damit die letzte noch in Ruhe zu sehen ist, bevor die Bühne weiterzieht.
      var fortschritt = weg > 0 ? klemme((kopfHoehe() - r.top + window.innerHeight * 0.15) / weg, 0, 0.9999) : 1;
      setzeSchritt(Math.floor(fortschritt * ANZAHL) + 1);
    }
  }
  function planeBild() {
    if (geplant) return;
    geplant = true;
    window.requestAnimationFrame(bild);
  }
  window.addEventListener("scroll", planeBild, { passive: true });
  window.addEventListener("resize", planeBild);
  bild();

  /* ---------- Aktiver Menüpunkt ---------- */
  if (hatIO && navLinks.length) {
    var abschnitte = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    var spy = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a, i) { a.classList.toggle("is-aktiv", abschnitte[i] === e.target); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    abschnitte.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- Einblenden beim Scrollen ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && !reduceMotion && hatIO) {
    // Das Verstecken schaltet dieselbe Stelle ein, die es wieder aufhebt.
    html.classList.add("reveal-on");
    var rio = new IntersectionObserver(function (eintraege, obs) {
      eintraege.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var el = e.target;
        window.setTimeout(function () { el.classList.add("is-in"); }, Math.min(i, 5) * 70);
        obs.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { rio.observe(el); });
    window.setTimeout(function () {
      if (!document.querySelector(".reveal.is-in")) reveals.forEach(function (el) { el.classList.add("is-in"); });
    }, 1500);
  }

  /* ---------- Sanierungsrechner im Fenster ----------
     Das iframe bekommt seine Adresse erst beim Öffnen. Vorher wird nichts von
     DachDigital geladen. Kann der Browser kein <dialog>, öffnet der Link
     einfach einen neuen Tab. */
  var rechner = document.getElementById("rechner");
  var rechnerLinks = document.querySelectorAll("[data-rechner]");
  if (rechner && typeof rechner.showModal === "function") {
    var rahmen = rechner.querySelector("iframe");
    rechnerLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        if (!rahmen.getAttribute("src")) rahmen.setAttribute("src", link.href);
        rechner.showModal();
      });
    });
    rechner.querySelector("[data-rechner-zu]").addEventListener("click", function () { rechner.close(); });
    rechner.addEventListener("click", function (e) { if (e.target === rechner) rechner.close(); });
    // Der Rechner meldet selbst, wenn er geschlossen werden möchte
    window.addEventListener("message", function (e) {
      if (e.origin === "https://dachprofi24.online" && e.data === "hide-modal") rechner.close();
    });
  }

  /* ---------- Formulare ----------
     Ohne Server: Aus den Eingaben wird eine fertige E-Mail. Es gibt nichts,
     was ausfallen kann, und kein Postfach, das gepflegt werden muss. */
  var MAIL = "vondungen@t-online.de";

  document.querySelectorAll("form[data-art]").forEach(function (form) {
    var notiz = form.querySelector(".form__notiz");
    var art = form.getAttribute("data-art");
    function feld(name) {
      var el = form.elements[name];
      return el ? String(el.value || "").trim() : "";
    }
    function sage(text, typ) {
      if (!notiz) return;
      notiz.textContent = text;
      notiz.className = "form__notiz" + (typ ? " is-" + typ : "");
    }
    function pruefe() {
      if (feld("website") !== "") return false;
      var ok = true, erstes = null;
      Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (el) {
        var falsch = el.type === "checkbox" ? !el.checked : el.value.trim() === "";
        el.classList.toggle("is-invalid", falsch);
        if (falsch) { ok = false; if (!erstes) erstes = el; }
      });
      var mail = form.elements.mail;
      if (mail && mail.value.trim() !== "" && !mail.checkValidity()) {
        mail.classList.add("is-invalid");
        ok = false;
        if (!erstes) erstes = mail;
      }
      if (!ok) {
        sage("Bitte füllen Sie die mit * markierten Felder aus und bestätigen Sie den Datenschutz.", "error");
        if (erstes) erstes.focus();
      }
      return ok;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!pruefe()) return;
      var zeilen = ["Name: " + feld("name"), "Telefon: " + feld("tel")];
      if (feld("mail")) zeilen.push("E-Mail: " + feld("mail"));
      var betreff;
      if (art === "bewerbung") {
        var interesse = feld("interesse") || "Noch offen";
        zeilen.push("Interesse: " + interesse);
        zeilen.push("", feld("text") || "(keine Nachricht)");
        betreff = "Kurzbewerbung über die Website – " + interesse;
      } else {
        var thema = feld("thema") || "Mehreres / noch unklar";
        if (feld("ort")) zeilen.push("PLZ / Ort: " + feld("ort"));
        zeilen.push("Thema: " + thema, "", feld("text"));
        betreff = "Anfrage über die Website – " + thema;
      }
      window.location.href = "mailto:" + MAIL +
        "?subject=" + encodeURIComponent(betreff) +
        "&body=" + encodeURIComponent(zeilen.join("\n"));
      sage("Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht. Bitte dort noch auf „Senden“ klicken.", "ok");
    });
    form.addEventListener("input", function (e) { if (e.target.classList) e.target.classList.remove("is-invalid"); });
    form.addEventListener("change", function (e) { if (e.target.classList) e.target.classList.remove("is-invalid"); });
  });
})();
