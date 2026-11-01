export const sample = `# Prostor pro vaše myšlenky

Markdown je jen text. Margin vám vedle něj ukáže, jak bude vypadat.

Otevřete svůj **lokální soubor**, přetáhněte ho sem, nebo začněte psát.

## Od první věty k hotovému textu

1. Napište text vlevo.
2. Sledujte náhled vpravo.
3. Uložte soubor, až budete připraveni.

> Dobré nástroje nechávají vyniknout to, co tvoříte.

### Malý příklad

Použijte **tučné písmo**, *kurzívu* nebo vložte kus kódu:

\`\`\`javascript
const message = "Méně rozptylování. Více psaní.";
console.log(message);
\`\`\`

| Režim | Pro co se hodí |
| :--- | :--- |
| Text | Soustředěné psaní |
| Vedle sebe | Úpravy s živým náhledem |
| Náhled | Pohodlné čtení |

---

Soubor zůstává u vás. Ukládáte ručně přes **Uložit** nebo **Ctrl+S**.
`;

export function initialSample(locale: 'cs' | 'en' | 'de'): string {
  if (locale === 'cs') return sample;
  if (locale === 'de') return `# Raum für Ihre Gedanken

Markdown ist einfacher Text. Margin zeigt daneben eine Vorschau.

Öffnen Sie eine **lokale Datei**, ziehen Sie sie hierher oder beginnen Sie zu schreiben.

## Vom ersten Satz zum fertigen Text

1. Schreiben Sie links.
2. Sehen Sie rechts die Vorschau.
3. Speichern Sie die Datei, wenn Sie fertig sind.

> Gute Werkzeuge lassen Ihre Arbeit im Mittelpunkt stehen.

### Ein kleines Beispiel

Verwenden Sie **Fettdruck**, *Kursivschrift* oder Code:

\`\`\`javascript
const message = "Weniger Ablenkung. Mehr schreiben.";
console.log(message);
\`\`\`

| Modus | Geeignet für |
| :--- | :--- |
| Text | Konzentriertes Schreiben |
| Nebeneinander | Bearbeiten mit Vorschau |
| Vorschau | Bequemes Lesen |

---

Ihre Datei bleibt bei Ihnen. Speichern Sie manuell über **Speichern** oder **Ctrl+S**.
`;
  return `# Space for your thoughts

Markdown is plain text. Margin shows you a preview beside it.

Open a **local file**, drop it here, or start writing.

## From first sentence to finished text

1. Write on the left.
2. Watch the preview on the right.
3. Save your file when you are ready.

> Good tools let your work take center stage.

### A small example

Use **bold**, *italics*, or add code:

\`\`\`javascript
const message = "Less distraction. More writing.";
console.log(message);
\`\`\`

| Mode | Best for |
| :--- | :--- |
| Text | Focused writing |
| Side by side | Editing with a live preview |
| Preview | Comfortable reading |

---

Your file stays with you. Save manually with **Save** or **Ctrl+S**.
`;
}

export function githubSample(locale: 'cs' | 'en' | 'de'): string {
  const text = {
    cs: {
      title: 'Prostor pro vaše myšlenky', intro: 'Prohlédněte si možnosti Markdownu a upravte tento dokument podle sebe.',
      formatting: 'Formátování', typography: 'Typografie', headings: ['Čtvrtá úroveň', 'Pátá úroveň', 'Šestá úroveň'],
      bold: 'tučný text', italic: 'kurzíva', both: 'tučná kurzíva', strike: 'přeškrtnutý text',
      links: 'Odkazy a seznamy', jump: 'Přejít na kód', reference: 'odkaz na kód', link: 'Automatický odkaz',
      first: 'Připravit osnovu', nested: 'Doplnit podrobnosti', ordered: 'Napsat první verzi', second: 'Zkontrolovat výsledek',
      done: 'Ověřit příklady', todo: 'Dopsat vlastní poznámky', table: 'Přehled', columns: ['Položka', 'Stav', 'Počet'],
      row: ['Návrh', 'Hotovo', '3'], quote: 'Jasný text začíná jednoduchou myšlenkou.', quoteMore: 'Druhý odstavec může myšlenku rozvinout.',
      note: 'Poznámka doplňuje souvislosti.', tip: 'Tip usnadní další krok.', important: 'Důležitou informaci ponechte viditelnou.',
      warning: 'Před změnou si ověřte vstupy.', caution: 'Pozor na nevratné změny.',
      codeIntro: 'Použijte například', hardFirst: 'První řádek', hardSecond: 'Druhý řádek po pevném zalomení.',
      escape: 'Doslovné hvězdičky', footnote: 'Další vysvětlení najdete v poznámce', footnoteText: 'Poznámka pod čarou může obsahovat další kontext.',
      media: 'Místní obrázky', image: 'Ukázkový obrázek', badge: 'Štítek ukázky', picture: 'Obrázek pro světlý a tmavý režim',
      html: 'Bezpečné HTML', centered: 'Text na střed', centeredText: 'Nadpis i tento odstavec jsou zarovnány na střed.',
      left: 'Levá část', right: 'Pravá část', htmlText: 'Markdown může být uvnitř buněk.',
      key: 'Klávesa', insert: 'vložený text', delete: 'odstraněný text', details: 'Zobrazit další informace', detailsText: 'Uvnitř lze použít **Markdown**.',
      highlight: 'zvýraznění', underline: 'podtržení', small: 'menší text', tableFooter: 'Jedna buňka přes dva sloupce.', comment: 'Tento komentář je viditelný jen ve zdrojovém textu.',
    },
    en: {
      title: 'Space for your thoughts', intro: 'Explore Markdown features and make this document your own.',
      formatting: 'Formatting', typography: 'Typography', headings: ['Fourth level', 'Fifth level', 'Sixth level'],
      bold: 'bold text', italic: 'italic text', both: 'bold italic text', strike: 'strikethrough',
      links: 'Links and lists', jump: 'Jump to code', reference: 'code reference', link: 'Automatic link',
      first: 'Prepare an outline', nested: 'Add details', ordered: 'Write a first draft', second: 'Review the result',
      done: 'Check the examples', todo: 'Add your own notes', table: 'Overview', columns: ['Item', 'Status', 'Count'],
      row: ['Draft', 'Done', '3'], quote: 'Clear writing starts with a simple idea.', quoteMore: 'A second paragraph can develop the idea.',
      note: 'A note adds context.', tip: 'A tip makes the next step easier.', important: 'Keep important information visible.',
      warning: 'Check your inputs before making changes.', caution: 'Take care with irreversible changes.',
      codeIntro: 'For example, use', hardFirst: 'First line', hardSecond: 'Second line after a hard break.',
      escape: 'Literal asterisks', footnote: 'See the footnote for more context', footnoteText: 'A footnote can provide more context.',
      media: 'Local images', image: 'Example image', badge: 'Example badge', picture: 'Image for light and dark themes',
      html: 'Safe HTML', centered: 'Centered text', centeredText: 'The heading and this paragraph are centered.',
      left: 'Left side', right: 'Right side', htmlText: 'Markdown can appear inside table cells.',
      key: 'Key', insert: 'inserted text', delete: 'deleted text', details: 'Show more information', detailsText: 'You can use **Markdown** inside.',
      highlight: 'highlighted text', underline: 'underlined text', small: 'smaller text', tableFooter: 'One cell across two columns.', comment: 'This comment is visible only in the source.',
    },
    de: {
      title: 'Raum für Ihre Gedanken', intro: 'Entdecken Sie Markdown und passen Sie dieses Dokument an.',
      formatting: 'Formatierung', typography: 'Typografie', headings: ['Vierte Ebene', 'Fünfte Ebene', 'Sechste Ebene'],
      bold: 'fetter Text', italic: 'kursiver Text', both: 'fett und kursiv', strike: 'durchgestrichener Text',
      links: 'Links und Listen', jump: 'Zum Code springen', reference: 'Codeverweis', link: 'Automatischer Link',
      first: 'Gliederung vorbereiten', nested: 'Details ergänzen', ordered: 'Ersten Entwurf schreiben', second: 'Ergebnis prüfen',
      done: 'Beispiele prüfen', todo: 'Eigene Notizen ergänzen', table: 'Übersicht', columns: ['Element', 'Status', 'Anzahl'],
      row: ['Entwurf', 'Fertig', '3'], quote: 'Klarer Text beginnt mit einem einfachen Gedanken.', quoteMore: 'Ein zweiter Absatz kann den Gedanken vertiefen.',
      note: 'Eine Notiz ergänzt den Zusammenhang.', tip: 'Ein Tipp erleichtert den nächsten Schritt.', important: 'Wichtige Informationen sichtbar halten.',
      warning: 'Eingaben vor Änderungen prüfen.', caution: 'Bei unumkehrbaren Änderungen aufpassen.',
      codeIntro: 'Verwenden Sie zum Beispiel', hardFirst: 'Erste Zeile', hardSecond: 'Zweite Zeile nach einem festen Umbruch.',
      escape: 'Wörtliche Sternchen', footnote: 'Weitere Hinweise stehen in der Fußnote', footnoteText: 'Eine Fußnote kann weitere Zusammenhänge erklären.',
      media: 'Lokale Bilder', image: 'Beispielbild', badge: 'Beispiel-Badge', picture: 'Bild für helle und dunkle Darstellung',
      html: 'Sicheres HTML', centered: 'Zentrierter Text', centeredText: 'Die Überschrift und dieser Absatz sind zentriert.',
      left: 'Linke Seite', right: 'Rechte Seite', htmlText: 'Markdown kann in Tabellenzellen stehen.',
      key: 'Taste', insert: 'eingefügter Text', delete: 'gelöschter Text', details: 'Weitere Informationen anzeigen', detailsText: 'Hier kann **Markdown** stehen.',
      highlight: 'hervorgehobener Text', underline: 'unterstrichener Text', small: 'kleinerer Text', tableFooter: 'Eine Zelle über zwei Spalten.', comment: 'Dieser Kommentar ist nur im Quelltext sichtbar.',
    },
  }[locale];

  return `# ${text.title}

${text.intro}

## ${text.formatting}

### ${text.typography}

**${text.bold}**, *${text.italic}*, ***${text.both}***, ~~${text.strike}~~.

Emoji: :sparkles: :rocket: :white_check_mark:

#### ${text.headings[0]}

##### ${text.headings[1]}

###### ${text.headings[2]}

## ${text.links}

[${text.jump}](#code) · [${text.reference}][code] · ${text.link}: https://example.com · <https://example.org>

1. ${text.first}
   - ${text.nested}
     1. ${text.ordered}
2. ${text.second}

- [x] ${text.done}
- [ ] ${text.todo}

## ${text.table}

| ${text.columns[0]} | ${text.columns[1]} | ${text.columns[2]} |
| :--- | :---: | ---: |
| ${text.row[0]} | ${text.row[1]} | ${text.row[2]} |

> ${text.quote}
>
> ${text.quoteMore}

> [!NOTE]
> ${text.note}

> [!TIP]
> ${text.tip}

> [!IMPORTANT]
> ${text.important}

> [!WARNING]
> ${text.warning}

> [!CAUTION]
> ${text.caution}

---

## Code

${text.codeIntro} \`const value = 1\`.

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('Margin'));
\`\`\`

\`\`\`json
{ "title": "Margin", "local": true }
\`\`\`

\`\`\`diff
- old line
+ new line
\`\`\`

${text.hardFirst}\\
${text.hardSecond}

${text.escape}: \\*text\\*.

${text.footnote}.[^1]

## ${text.media}

![${text.image}](margin-asset:showcase.svg)

![${text.badge}](margin-asset:badge.svg)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="margin-asset:showcase-dark.svg">
  <img src="margin-asset:showcase.svg" alt="${text.picture}">
</picture>

## ${text.html}

<h3 align="center">${text.centered}</h3>
<p align="center">${text.centeredText}</p>

<table>
<tr>
<td width="50%" valign="top">

**${text.left}**

${text.htmlText}

</td>
<td width="50%" valign="top">

**${text.right}**

${text.htmlText}

</td>
</tr>
<tr><td colspan="2">${text.tableFooter}</td></tr>
</table>

${text.key}: <kbd>Ctrl</kbd> + <kbd>S</kbd> · H<sub>2</sub>O · x<sup>2</sup> · <ins>${text.insert}</ins> · <del>${text.delete}</del>

<mark>${text.highlight}</mark> · <u>${text.underline}</u> · <small>${text.small}</small> · <abbr title="HyperText Markup Language">HTML</abbr>

<details>
<summary>${text.details}</summary>

${text.detailsText}

</details>

<!-- ${text.comment} -->

[code]: #code
[^1]: ${text.footnoteText}
`;
}
