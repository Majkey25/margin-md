import { getLocalMarkdownUrl } from './files';

chrome.runtime.onMessage.addListener((message: unknown, sender) => {
  if (message !== 'open-local-markdown' || sender.id !== chrome.runtime.id
    || sender.frameId !== 0 || sender.tab?.id === undefined || !sender.url) return;
  try { getLocalMarkdownUrl(sender.url); } catch { return; }
  const target = new URL(chrome.runtime.getURL('index.html'));
  target.searchParams.set('file', sender.url);
  void chrome.tabs.update(sender.tab.id, { url: target.href });
});
