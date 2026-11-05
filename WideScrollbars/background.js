importScripts('site.js');

function setBadge(tabId, disabled) {
  return Promise.all([
    chrome.action.setBadgeText({tabId, text: disabled ? 'OFF' : ''}),
    chrome.action.setTitle({tabId, title: disabled
      ? 'このサイトはオフ（クリックで設定）'
      : 'このサイトはオン（クリックで設定）'})
  ]);
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'set-badge' && sender.frameId === 0 && sender.tab) {
    setBadge(sender.tab.id, message.disabled).catch(() => {});
  }
});
