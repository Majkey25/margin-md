async function openEditor(): Promise<void> {
  const url = chrome.runtime.getURL('index.html');
  const currentWindow = await chrome.windows.getCurrent();
  const contexts = (await chrome.runtime.getContexts({ contextTypes: ['TAB'], incognito: currentWindow.incognito }))
    .filter((context) => context.tabId >= 0 && context.windowId >= 0 && context.documentUrl?.split(/[?#]/, 1)[0] === url);
  const editor = contexts.find((context) => context.windowId === currentWindow.id) ?? contexts[0];
  if (editor) {
    await chrome.tabs.update(editor.tabId, { active: true });
    await chrome.windows.update(editor.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url });
  }
}

void openEditor().then(
  () => window.close(),
  (error: unknown) => {
    console.error('Could not open Margin', error);
    document.querySelector('a')?.focus();
  },
);
