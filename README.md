# von Dungen GmbH & Co. KG · Entwurf „Dachschnitt“

Kostenloser Entwurf für eine neue Website der **von Dungen GmbH & Co. KG**,
Dach- und Spenglerarbeiten, Boxheimerhofstr. 32, 68642 Bürstadt.

Vorschau: https://bilal-altu.github.io/von-dungen/ (für Suchmaschinen gesperrt)

Dies ist ein **Entwurf zur Ansicht**. Texte, Farben und Aufbau lassen sich jederzeit ändern.

---

## Die Idee

Ein Dachdecker verkauft etwas, das man von der Straße aus kaum sieht: was unter den
Ziegeln liegt. Deshalb trägt eine **eigene Zeichnung** die Seite, keine Fotos aus dem
Katalog.

- **Oben** steht ein Haus im Querschnitt, auf dem alle acht Leistungen vorkommen: Steildach,
  Dämmung, Dachfenster, Flachdach, Gründach, Dachterrasse, Rinnen und Kamin, dazu eine Leiter
  für Reparatur und Wartung. Beim Laden baut es sich Schicht für Schicht auf.
- **„Dachaufbau“** zeigt die Traufe eines geneigten Dachs im Detail. Ein Schicht-Schalter
  führt von der Dämmung bis zur Rinne, jeweils mit kurzer Erklärung. Kommt der Abschnitt ins
  Bild, legt sich einmal Schicht für Schicht auf; danach tippt man selbst weiter.
- **Die Leistungen** zeigen jeweils einen Ausschnitt aus derselben Hauszeichnung. Rot ist die
  Stelle, um die es geht.

Farben und Logo kommen aus dem bestehenden Logo „Das Team für’s Dach“: **Blau** für Schrift,
Linien und Knöpfe, **Rot** nur als Akzent. Das Logo ist originalgetreu als scharfe
Vektorgrafik nachgezeichnet, ohne den grauen Kasten.

## Aufbau

| Seite | Inhalt |
|---|---|
| `index.html` | Start, Dachaufbau, Leistungen, Preisschätzung, Betrieb, Karriere-Hinweis, Kontakt |
| `karriere.html` | Arbeiten bei von Dungen, Kurzbewerbung |
| `impressum.html` | Impressum (offene Punkte gelb markiert) |
| `datenschutz.html` | Datenschutzerklärung |

```
assets/
  css/style.css       das gesamte Design
  js/main.js          Menü, Aufbau der Zeichnung, Schicht-Schalter, Rechner, Formulare
  fonts/              Barlow und Barlow Semi Condensed, lokal (SIL Open Font License 1.1)
  img/                Logo (SVG), Foto Kirchendach (AVIF/WebP/JPEG), Vorschaubild
.htaccess             Serverregeln für ALL-INKL (https, Komprimierung, Cache)
```

Kein Baukasten, keine Datenbank, kein Build. Die Seite setzt **keine Cookies**, lädt beim
Aufruf nichts von fremden Servern und braucht deshalb **kein Cookie-Banner**.

## Die Zeichnungen

Beide Zeichnungen sind reines SVG und werden per Skript erzeugt, nicht von Hand gezeichnet:

```
node "C:\Users\bilal\Desktop\von Dungen\werkzeug\zeichnung\einsetzen.js" "C:\Users\bilal\Desktop\Claude Prompts\von-dungen"
```

Das Skript setzt sie zwischen die Marker `<!-- SCHNITT:START -->` und `<!-- TRAUFE:START -->`
in `index.html` und `karriere.html`. Alles zwischen den Markern wird dabei überschrieben.

## Sanierungsrechner

Der bestehende **DachProfi24-Sanierungsrechner** bleibt erhalten, mit derselben Firmen-ID wie
bisher. Anfragen landen also weiter dort, wo sie heute ankommen. Er öffnet sich in einem
Fenster auf der Seite und wird **erst beim Klick** geladen. Ohne JavaScript öffnet der Knopf
den Rechner in einem neuen Tab.

## Formulare

Anfrage und Kurzbewerbung haben keinen Server im Hintergrund. Sie bauen aus den Eingaben eine
fertige E-Mail an `vondungen@t-online.de`, die der Besucher nur noch abschicken muss. Die
Adresse steht in `assets/js/main.js` (Zeile `var MAIL`).

---

## Bevor die Seite online geht

Diese Punkte sind offen. Sie stehen zusätzlich als `TODO Bilal:` im Quelltext.

| Was | Wo | Warum |
|---|---|---|
| **Komplementär-GmbH** (Name, Sitz, Registergericht, HRB) | `impressum.html` | Bei einer GmbH & Co. KG Pflicht, fehlt im bisherigen Impressum |
| **Registergericht** zu HRA 62046 | `impressum.html` | Fehlt im bisherigen Impressum |
| **Zuständige Kammer** bestätigen | `impressum.html` | Bisher steht nur „Darmstadt“ |
| **Verantwortlich nach § 18 MStV** | `impressum.html` | Name fehlt im bisherigen Impressum |
| **Foto Kirchendach**: Objekt und Urheber | `index.html`, `impressum.html` | Stammt vom Facebook-Titelbild |
| **Mehr eigene Fotos** | `index.html` | Bisher gibt es nur das eine Foto |
| **Offene Stellen, Ausbildung, was der Betrieb bietet** | `karriere.html` | Bewusst nichts erfunden |
| **Bürozeiten** | `index.html` (Kontakt) | Liegen nicht vor |
| **Auftragsverarbeitung mit DachDigital** | `datenschutz.html` | Für den Sanierungsrechner |
| **Umzug der Domain** vondungen-dach.de | siehe unten | Leitet heute auf DachProfi24 weiter |

## Umzug auf vondungen-dach.de

1. Dateien per FTP auf den Webspace laden, **inklusive `.htaccess`**.
2. Im KAS das SSL-Zertifikat für `vondungen-dach.de` und `www.vondungen-dach.de` aktivieren.
3. Domain-Weiterleitung auf DachProfi24 beenden, Domain auf den neuen Webspace zeigen lassen.
4. In allen vier Seiten `og:url` und `og:image` auf `https://vondungen-dach.de/` umstellen
   und `<meta name="robots">` auf `index, follow` setzen.
5. `datenschutz.html`: Abschnitt „Server-Logdateien“ auf den neuen Hoster anpassen,
   Auftragsverarbeitungsvertrag abschließen.
6. Sitemap in der Google Search Console einreichen.

Nach jeder Änderung an `style.css` oder `main.js` das `?v=` in allen vier HTML-Seiten
hochzählen, sonst sehen wiederkehrende Besucher neues HTML mit altem Stylesheet.
