function siteKey(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return 'disabled:' + new URL(url).hostname.replace(/^www\./, '');
}

function siteModeKey(key) {
  return key.replace(/^disabled:/, 'mode:');
}

function siteMode(values, key) {
  // Keep the previous global preference as the default for sites not yet configured.
  const mode = values[siteModeKey(key)] ?? values.mode;
  return mode === 'always' ? 'always' : 'hover';
}
