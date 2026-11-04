function siteKey(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return 'disabled:' + new URL(url).hostname.replace(/^www\./, '');
}
