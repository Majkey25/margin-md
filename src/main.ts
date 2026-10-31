import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, drawSelection, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdownLanguage, markdownKeymap } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { decodeMarkdown, encodeMarkdown, FileConflictError, getLocalMarkdownUrl, MAX_FILE_BYTES,
  createSaveTarget, prepareSaveTarget, readMarkdown, validateMarkdownName, writeMarkdown, type LoadedFile } from './files';
import { renderMarkdown } from './render';
import { sample } from './sample';
import { shell } from './shell';
import { setupPreferences } from './preferences';
import './styles.css';
import './preview.css';

function element<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing UI element: ${id}`);
  return node as T;
}

element('app').innerHTML = shell;
const workspace = element('workspace');
const preview = element('preview');
const fileInput = element<HTMLInputElement>('file-input');
const discardDialog = element<HTMLDialogElement>('discard-dialog');
const modeButtons = document.querySelectorAll<HTMLButtonElement>('button[data-mode]');
const preferencesDialog = setupPreferences(
  () => say('Nastavení je změněné. Prohlížeč jej nedovolil zapamatovat.'),
  () => editor.requestMeasure(),
);
const wordCounter = new Intl.Segmenter('cs', { granularity: 'word' });
const format = { newline: '\n', bom: false } as const;
let current: LoadedFile = { name: 'Vítejte.md', source: sample, format, bytes: encodeMarkdown(sample, format) };
let locationLabel = 'Ukázkový dokument';
let busy = false;
let previewTimer: ReturnType<typeof setTimeout>;
let previewStale = true;
let mode = matchMedia('(max-width: 700px)').matches ? 'preview' : 'split';

const highlighting = HighlightStyle.define([
  { tag: tags.heading, fontWeight: '700', color: 'var(--syntax-heading, #256478)' },
  { tag: tags.processingInstruction, color: 'var(--syntax-mark, #697682)' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.link, color: 'var(--syntax-link, #24678e)', textDecoration: 'underline' },
  { tag: tags.monospace, color: 'var(--syntax-code, #99512e)' },
]);

function editorState(source: string): EditorState {
  return EditorState.create({
    doc: source,
    extensions: [lineNumbers(), highlightActiveLineGutter(), history(), drawSelection(), highlightActiveLine(),
      keymap.of([...markdownKeymap, ...defaultKeymap, ...historyKeymap]), markdownLanguage, syntaxHighlighting(highlighting),
      EditorView.lineWrapping, EditorView.contentAttributes.of({ 'aria-label': 'Zdrojový Markdown', spellcheck: 'false', tabindex: '0' }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          previewStale = true;
          clearTimeout(previewTimer);
          previewTimer = setTimeout(updatePreview, 120);
        }
        if (update.docChanged || update.selectionSet) updateStatus();
      })],
  });
}

const editor = new EditorView({ state: editorState(current.source), parent: element('editor') });
let savedDocument = editor.state.doc;

function dirty(): boolean {
  return !editor.state.doc.eq(savedDocument);
}

function say(message: string, error = false): void {
  const status = element('status-message');
  status.textContent = message;
  status.title = message;
  status.dataset.error = String(error);
}

function updateStatus(): void {
  const changed = dirty();
  element('doc-name').textContent = current.name;
  element('doc-location').textContent = locationLabel;
  element('dirty-state').textContent = changed ? 'Neuložené změny' : 'Beze změn';
  element('dirty-state').dataset.dirty = String(changed);
  document.title = `${changed ? '● ' : ''}${current.name} | Margin`;
  element<HTMLButtonElement>('save-file').disabled = busy || (!changed && !!current.handle);
  for (const id of ['new-file', 'open-file', 'save-as']) element<HTMLButtonElement>(id).disabled = busy;
  const position = editor.state.selection.main.head;
  const line = editor.state.doc.lineAt(position);
  element('cursor-position').textContent = `Ř ${line.number}, sl ${position - line.from + 1}`;
  element('line-count').textContent = `${editor.state.doc.lines} ř.`;
}

function updatePreview(): void {
  if (!previewStale) return;
  const source = editor.state.doc.toString();
  let words = 0;
  for (const segment of wordCounter.segment(source)) if (segment.isWordLike) words++;
  element('word-count').textContent = `${words.toLocaleString('cs')} slov`;
  if (mode === 'source') return;
  try {
    preview.replaceChildren(renderMarkdown(source));
  } catch {
    say('Náhled nelze vytvořit. Text zůstává v editoru.', true);
    return;
  }
  previewStale = false;
}

function setMode(value: string): void {
  mode = value;
  workspace.dataset.mode = value;
  for (const button of modeButtons) button.setAttribute('aria-pressed', String(button.dataset.mode === value));
  element('source-pane').hidden = value === 'preview';
  element('preview-pane').hidden = value === 'source';
  updatePreview();
  editor.requestMeasure();
}

function confirmAction(title: string, description: string, action: string): Promise<boolean> {
  element('discard-title').textContent = title;
  element('discard-description').textContent = description;
  element('discard-confirm').textContent = action;
  return new Promise((resolve) => {
    discardDialog.returnValue = '';
    discardDialog.addEventListener('close', () => resolve(discardDialog.returnValue === 'discard'), { once: true });
    discardDialog.showModal();
    element('discard-cancel').focus();
  });
}

async function confirmDiscard(): Promise<boolean> {
  return !dirty() || await confirmAction('Zahodit neuložené změny?',
    'Změny v aktuálním dokumentu budou ztraceny.', 'Zahodit');
}

async function run(action: () => Promise<void>): Promise<void> {
  if (busy) return;
  busy = true;
  updateStatus();
  try {
    await action();
  } catch (error) {
    const message = error instanceof FileConflictError
      ? 'Soubor se změnil v jiné aplikaci. Použijte Uložit jako a zachovejte obě verze.'
      : error instanceof DOMException ? 'Operace se nezdařila. Ověřte oprávnění k souboru. Text zůstává v editoru.'
      : error instanceof Error ? error.message : 'Operace se nezdařila. Text zůstává v editoru.';
    say(message, true);
  } finally {
    busy = false;
    updateStatus();
  }
}

async function replaceDocument(file: LoadedFile, label: string): Promise<void> {
  if (!await confirmDiscard()) return;
  current = file;
  locationLabel = label;
  editor.setState(editorState(file.source));
  savedDocument = editor.state.doc;
  preview.scrollTop = 0;
  element('preview-pane').scrollTop = 0;
  previewStale = true;
  updatePreview();
  updateStatus();
  say('Soubor načten. Změny ukládáte ručně.');
}

const pickerTypes: FilePickerAcceptType[] = [{ description: 'Markdown', accept: { 'text/markdown': ['.md', '.markdown'] } }];

async function pickOrCancel<T>(choice: Promise<T>): Promise<T | undefined> {
  try { return await choice; } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    throw error;
  }
}

async function openFile(): Promise<void> {
  if (!('showOpenFilePicker' in window)) { fileInput.click(); return; }
  await run(async () => {
    const handles = await pickOrCancel(window.showOpenFilePicker({ multiple: false, types: pickerTypes }));
    if (!handles) return;
    const [handle] = handles;
    await replaceDocument(await readMarkdown(await handle.getFile(), handle), 'Lokální soubor');
  });
}

function selectSaveDestination(): Promise<{ directory: FileSystemDirectoryHandle; name: string } | undefined> {
  const dialog = element<HTMLDialogElement>('save-dialog');
  const form = element<HTMLFormElement>('save-form');
  const nameInput = element<HTMLInputElement>('save-name');
  const submit = element<HTMLButtonElement>('save-select');
  const errorText = element('save-error');
  nameInput.value = current.name;
  submit.disabled = false;
  errorText.hidden = true;
  let selected: { directory: FileSystemDirectoryHandle; name: string } | undefined;
  let settled = false;
  const onSubmit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    if (submit.disabled) return;
    try {
      validateMarkdownName(nameInput.value);
      submit.disabled = true;
      errorText.hidden = true;
      const directory = await pickOrCancel(window.showDirectoryPicker({ mode: 'readwrite' }));
      if (!directory || settled) return;
      selected = { directory, name: nameInput.value };
      dialog.close();
    } catch (error) {
      if (!settled) {
        errorText.textContent = error instanceof DOMException
          ? 'Složku nelze otevřít. Ověřte oprávnění nebo vyberte jinou.'
          : error instanceof Error ? error.message : 'Složku nelze otevřít.';
        errorText.hidden = false;
      }
    } finally {
      if (!settled) submit.disabled = false;
    }
  };
  return new Promise((resolve) => {
    form.addEventListener('submit', onSubmit);
    dialog.addEventListener('close', () => {
      settled = true;
      form.removeEventListener('submit', onSubmit);
      resolve(selected);
    }, { once: true });
    dialog.showModal();
    nameInput.focus();
    nameInput.select();
  });
}

async function saveFile(saveAs = false): Promise<void> {
  await run(async () => {
    const snapshot = editor.state.doc;
    const source = snapshot.toString();
    if (encodeMarkdown(source, current.format).length > MAX_FILE_BYTES) {
      throw new Error('Text překračuje limit 5 MiB. Před uložením jej zkraťte.');
    }
    let handle = current.handle;
    let baseline = current.bytes;
    if (saveAs || !handle) {
      const destination = await selectSaveDestination();
      if (!destination) return;
      const target = await prepareSaveTarget(destination.directory, destination.name);
      if (target.existed) {
        if (!await confirmAction('Nahradit existující soubor?',
          `${destination.directory.name}/${destination.name} bude nahrazen aktuálním textem.`, 'Nahradit soubor')) return;
        handle = target.handle;
        baseline = target.baseline;
      } else {
        ({ handle, baseline } = await createSaveTarget(destination.directory, destination.name));
      }
    }
    const bytes = await writeMarkdown(handle, source, current.format, baseline);
    current = { ...current, name: handle.name, source, bytes, handle };
    savedDocument = snapshot;
    locationLabel = 'Lokální soubor';
    say(dirty() ? 'Soubor uložen. Novější změny ještě nejsou uložené.' : 'Soubor uložen.');
  });
}

element('open-file').addEventListener('click', () => void openFile());
element('save-file').addEventListener('click', () => void saveFile());
element('save-as').addEventListener('click', () => void saveFile(true));
element('new-file').addEventListener('click', () => void run(async () => {
  await replaceDocument({ name: 'Bez názvu.md', source: '', format, bytes: new Uint8Array() }, 'Nový dokument');
}));
element('discard-cancel').addEventListener('click', () => discardDialog.close('cancel'));
element('discard-confirm').addEventListener('click', () => discardDialog.close('discard'));
element('save-cancel').addEventListener('click', () => element<HTMLDialogElement>('save-dialog').close());
for (const button of modeButtons) button.addEventListener('click', () => setMode(button.dataset.mode!));
matchMedia('(max-width: 700px)').addEventListener('change', (event) => {
  if (event.matches && mode === 'split') setMode('preview');
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file) void run(async () => replaceDocument(await readMarkdown(file), 'Importovaný soubor | Uložit jako pro zápis'));
  fileInput.value = '';
});

let dragDepth = 0;
document.addEventListener('dragenter', (event) => {
  if (!event.dataTransfer?.types.includes('Files')) return;
  event.preventDefault();
  dragDepth++;
  element('drop-overlay').hidden = false;
});
document.addEventListener('dragover', (event) => {
  if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
});
document.addEventListener('dragleave', () => {
  if (--dragDepth <= 0) { dragDepth = 0; element('drop-overlay').hidden = true; }
});
document.addEventListener('drop', (event) => {
  event.preventDefault();
  dragDepth = 0;
  element('drop-overlay').hidden = true;
  if (busy) return;
  const files = event.dataTransfer?.files;
  if (!files?.length) return;
  if (files.length !== 1) { say('Přetáhněte jeden Markdown soubor.', true); return; }
  const file = files[0];
  // Capture the handle during the drop event, before awaiting anything.
  const handlePromise = event.dataTransfer?.items[0]?.getAsFileSystemHandle?.();
  void run(async () => {
    let handle: FileSystemFileHandle | undefined;
    try {
      const dropped = await handlePromise;
      if (dropped?.kind === 'file') handle = dropped as FileSystemFileHandle;
    } catch { /* A plain file remains readable through the drop event. */ }
    await replaceDocument(await readMarkdown(file, handle), 'Lokální soubor');
  });
});

element('fullscreen').addEventListener('click', () => {
  const action = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  void action.catch(() => say('Celou obrazovku nelze zapnout. Zkuste klávesu F11.', true));
});
document.addEventListener('fullscreenchange', () => {
  element('fullscreen').setAttribute('aria-pressed', String(!!document.fullscreenElement));
});
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    if (!discardDialog.open && !preferencesDialog.open && !element<HTMLDialogElement>('save-dialog').open) void saveFile(event.shiftKey);
  }
});
window.addEventListener('beforeunload', (event) => {
  if (busy || dirty()) { event.preventDefault(); event.returnValue = ''; }
});

preview.addEventListener('click', (event) => {
  const anchor = (event.target as HTMLElement).closest('a');
  if (!anchor) return;
  event.preventDefault();
  const href = anchor.getAttribute('href') || '';
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
    window.open(href, '_blank', 'noopener,noreferrer');
  } else {
    say('Odkazy na místní soubory otevřete tlačítkem Otevřít.');
  }
});

setMode(mode);
updateStatus();
say('Otevřete soubor nebo začněte psát.');
const requestedFile = new URL(location.href).searchParams.get('file');
if (requestedFile) void run(async () => {
  const url = getLocalMarkdownUrl(requestedFile);
  const response = await fetch(url);
  if (!response.ok) throw new Error('Soubor nelze načíst. Ověřte přístup k adresám URL souborů v nastavení rozšíření.');
  const declaredSize = Number(response.headers.get('content-length'));
  if (declaredSize > MAX_FILE_BYTES) throw new Error('Soubor překračuje limit 5 MiB.');
  if (!response.body) throw new Error('Soubor nemá čitelný obsah.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_FILE_BYTES) {
      await reader.cancel();
      throw new Error('Soubor překračuje limit 5 MiB.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const name = decodeURIComponent(url.pathname.split('/').pop()!);
  await replaceDocument({ name, ...decodeMarkdown(bytes), bytes }, 'Otevřeno z adresy souboru | Uložit jako pro zápis');
});
