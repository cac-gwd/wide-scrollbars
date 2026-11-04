(() => {
  // All embedded documents follow the site visible in the address bar.
  const ancestors = location.ancestorOrigins;
  const key = siteKey(ancestors.length ? ancestors[ancestors.length - 1] : location.href);
  if (!key) return;
  let changed = false;
  function apply(disabled) {
    if (!document.documentElement) {
      const observer = new MutationObserver(() => {
        if (document.documentElement) {
          observer.disconnect();
          apply(disabled);
        }
      });
      observer.observe(document, {childList: true});
      return;
    }
    document.documentElement.toggleAttribute('data-wide-scrollbars-on', !disabled);
    if (window === window.top) {
      chrome.runtime.sendMessage({type: 'set-badge', disabled: !!disabled}).catch(() => {});
    }
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && key in changes) {
      changed = true;
      apply(changes[key].newValue);
    }
  });
  chrome.storage.local.get(key).then(values => {
    if (!changed) apply(values[key]);
  });
})();
