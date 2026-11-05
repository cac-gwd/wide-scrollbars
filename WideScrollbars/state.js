(() => {
  // All embedded documents follow the site visible in the address bar.
  const ancestors = location.ancestorOrigins;
  const key = siteKey(ancestors.length ? ancestors[ancestors.length - 1] : location.href);
  if (!key) return;
  const keys = [key, siteModeKey(key), 'mode'];
  const changed = new Set();
  const values = {};
  function apply() {
    if (!document.documentElement) {
      const observer = new MutationObserver(() => {
        if (document.documentElement) {
          observer.disconnect();
          apply();
        }
      });
      observer.observe(document, {childList: true});
      return;
    }
    const disabled = !!values[key];
    document.documentElement.setAttribute('data-wide-scrollbars-mode', siteMode(values, key));
    document.documentElement.toggleAttribute('data-wide-scrollbars-on', !disabled);
    if (window === window.top) {
      chrome.runtime.sendMessage({type: 'set-badge', disabled: !!disabled}).catch(() => {});
    }
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !keys.some(name => name in changes)) return;
    for (const name of keys) {
      if (name in changes) {
        changed.add(name);
        values[name] = changes[name].newValue;
      }
    }
    apply();
  });
  chrome.storage.local.get(keys).then(initial => {
    for (const name of keys) {
      if (!changed.has(name)) values[name] = initial[name];
    }
    apply();
  });
})();
