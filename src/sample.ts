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
