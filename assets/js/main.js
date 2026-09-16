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

  /* ---------- Dachaufbau: Schicht-Schalter ----------
     Bewusst kein klebender Scroll-Abschnitt (den hat schon der Statiker).
     Kommt der Abschnitt ins Bild, legt sich einmal Schicht für Schicht auf,
     alle 2,8 Sekunden eine. Tippt jemand selbst, hört das Abspielen auf.
     Bei „Bewegung reduzieren“ bleibt die Zeichnung komplett stehen. */
  var aufbau = document.querySelector("[data-aufbau]");
  var schritte = aufbau ? Array.prototype.slice.call(aufbau.querySelectorAll(".schritt")) : [];
  var ANZAHL = schritte.length;

  if (aufbau && ANZAHL) {
    var steuerung = aufbau.querySelector(".aufbau__steuerung");
    var stand = aufbau.querySelector(".aufbau__stand");
    var zurueck = aufbau.querySelector('[data-schicht="zurueck"]');
    var weiter = aufbau.querySelector('[data-schicht="weiter"]');
    var aktuell = 0;
    var takt = null;
    var selbst = reduceMotion;      // true = läuft nicht (mehr) von selbst
    var imBild = false;

    html.classList.add("aufbau-js");
    if (steuerung) steuerung.hidden = false;

    var setzeSchritt = function (n) {
      aktuell = klemme(n, 1, ANZAHL);
      for (var i = 1; i <= ANZAHL; i++) {
        aufbau.classList.toggle("ab-" + i, i <= aktuell);
        aufbau.classList.toggle("aktiv-" + i, i === aktuell);
      }
      schritte.forEach(function (li, i) {
        li.classList.toggle("is-aktiv", i + 1 === aktuell);
        li.classList.toggle("is-fertig", i + 1 < aktuell);
        li.querySelector(".schritt__knopf").setAttribute("aria-expanded", String(i + 1 === aktuell));
      });
      if (stand) stand.textContent = "Schicht " + aktuell + " von " + ANZAHL;
      if (zurueck) zurueck.disabled = aktuell === 1;
      if (weiter) weiter.disabled = aktuell === ANZAHL;
    };

    var planen = function () {
      window.clearTimeout(takt);
      if (selbst || !imBild || aktuell >= ANZAHL || document.hidden) return;
      takt = window.setTimeout(function () { setzeSchritt(aktuell + 1); planen(); }, 2800);
    };
    var uebernehmen = function () { selbst = true; window.clearTimeout(takt); };

    schritte.forEach(function (li, i) {
      li.querySelector(".schritt__knopf").addEventListener("click", function () { uebernehmen(); setzeSchritt(i + 1); });
    });
    if (zurueck) zurueck.addEventListener("click", function () { uebernehmen(); setzeSchritt(aktuell - 1); });
    if (weiter) weiter.addEventListener("click", function () { uebernehmen(); setzeSchritt(aktuell + 1); });
    aufbau.addEventListener("keydown", function (e) {
      if (!e.target.closest(".schritt__knopf, [data-schicht]")) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); uebernehmen(); setzeSchritt(aktuell + 1); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); uebernehmen(); setzeSchritt(aktuell - 1); }
    });
    document.addEventListener("visibilitychange", planen);

    // Ohne Abspielen gleich alles zeigen, sonst mit der ersten Schicht beginnen
    setzeSchritt(selbst ? ANZAHL : 1);

    if (!selbst && hatIO) {
      new IntersectionObserver(function (eintraege) {
        imBild = eintraege[0].isIntersecting;
        planen();
      }, { threshold: 0.45 }).observe(aufbau.querySelector(".aufbau__zeichnung"));
    } else if (!selbst) {
      setzeSchritt(ANZAHL);
    }
  }

  /* ---------- Kopfleiste: Linie beim Scrollen ---------- */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  function kopfLinie() { if (kopf) kopf.classList.toggle("is-stuck", window.scrollY > 8); }
  window.addEventListener("scroll", kopfLinie, { passive: true });
  kopfLinie();

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
