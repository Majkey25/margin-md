import mermaid from 'mermaid';

// This page has an opaque sandbox origin and cannot load network resources or access extension APIs.
window.addEventListener('message', async (event: MessageEvent<unknown>) => {
  if (event.source !== parent || !event.ports[0]) return;
  const port = event.ports[0];
  const data = event.data;
  if (!data || typeof data !== 'object' || !('source' in data) || typeof data.source !== 'string'
    || data.source.length > 12_000 || !('dark' in data) || typeof data.dark !== 'boolean') { port.close(); return; }
  const container = document.createElement('div');
  document.body.append(container);
  try {
    mermaid.initialize({
      startOnLoad: false, securityLevel: 'strict', htmlLabels: false,
      theme: data.dark ? 'dark' : 'neutral', fontFamily: 'Arial, sans-serif',
      maxTextSize: 12_000, maxEdges: 200, suppressErrorRendering: true,
      secure: ['secure', 'securityLevel', 'startOnLoad', 'maxTextSize', 'maxEdges', 'suppressErrorRendering',
        'htmlLabels', 'themeCSS', 'fontFamily', 'theme', 'themeVariables', 'layout'],
    });
    const { svg } = await mermaid.render(`diagram-${crypto.randomUUID()}`, data.source, container);
    port.postMessage(svg.length <= 2 * 1024 * 1024 ? svg : null);
  } catch { port.postMessage(null); }
  finally { container.remove(); port.close(); }
});
