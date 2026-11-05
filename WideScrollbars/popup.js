(async () => {
  const enabled = document.querySelector('#enabled');
  const status = document.querySelector('#status');
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const key = siteKey(tab?.url);
    const values = await chrome.storage.local.get(key ? [key, siteModeKey(key), 'mode'] : ['mode']);
    document.querySelector('#site').textContent = key
      ? new URL(tab.url).hostname : 'このページでは利用できません';
    enabled.checked = key ? !values[key] : false;
    enabled.disabled = !key;
    document.querySelector('fieldset').disabled = !key;
    let savedMode = key ? siteMode(values, key) : 'hover';
    document.querySelector('input[value="' + savedMode + '"]').checked = true;
    enabled.addEventListener('change', async () => {
      enabled.disabled = true;
      try {
        if (enabled.checked) await chrome.storage.local.remove(key);
        else await chrome.storage.local.set({[key]: true});
        await chrome.action.setBadgeText({tabId: tab.id, text: enabled.checked ? '' : 'OFF'});
        status.textContent = '保存しました';
      } catch {
        enabled.checked = !enabled.checked;
        status.textContent = '保存できませんでした。もう一度お試しください。';
      } finally {
        enabled.disabled = false;
      }
    });
    for (const radio of document.querySelectorAll('[name="mode"]')) {
      radio.addEventListener('change', async () => {
        document.querySelector('fieldset').disabled = true;
        try {
          await chrome.storage.local.set({[siteModeKey(key)]: radio.value});
          savedMode = radio.value;
          status.textContent = 'このサイトの設定を保存しました';
        } catch {
          document.querySelector('input[value="' + savedMode + '"]').checked = true;
          status.textContent = '保存できませんでした。もう一度お試しください。';
        } finally {
          document.querySelector('fieldset').disabled = false;
        }
      });
    }
  } catch {
    status.textContent = '設定を読み込めませんでした。開き直してください。';
  }
})();
