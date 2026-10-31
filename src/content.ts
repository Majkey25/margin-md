if (/\.(md|markdown)$/i.test(location.pathname)) {
  void chrome.runtime.sendMessage('open-local-markdown');
}
