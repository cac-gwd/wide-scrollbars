importScripts('site.js');

function setBadge(tabId, disabled) {
  return Promise.all([
    chrome.action.setBadgeText({tabId, text: disabled ? 'OFF' : ''}),
    chrome.action.setTitle({tabId, title: disabled
      ? 'このサイトはオフ（クリックでオン）'
      : 'このサイトはオン（クリックでオフ）'})
  ]);
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'set-badge' && sender.frameId === 0 && sender.tab) {
    setBadge(sender.tab.id, message.disabled).catch(() => {});
  }
});

async function toggleSite(tab) {
  const key = siteKey(tab.url);
  if (!key) return;
  const values = await chrome.storage.local.get(key);
  if (values[key]) await chrome.storage.local.remove(key);
  else await chrome.storage.local.set({[key]: true});
  await setBadge(tab.id, !values[key]);
}

// Preserve click order, including quick clicks in two tabs of the same site.
let pending = Promise.resolve();
chrome.action.onClicked.addListener(tab => {
  pending = pending.then(() => toggleSite(tab)).catch(console.error);
});
