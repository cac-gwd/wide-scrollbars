(() => {
  const root = document.documentElement;
  const sheets = location.hostname === 'docs.google.com' && location.pathname.startsWith('/spreadsheets/');
  const attribute = 'data-wide-scrollbars-near';
  const active = new Set();
  const timers = new Map();
  let pointer;
  let frame = 0;

  function cancel(bar) {
    clearTimeout(timers.get(bar));
    timers.delete(bar);
  }
  function collapse(bar) {
    cancel(bar);
    bar.removeAttribute(attribute);
    active.delete(bar);
  }
  function reset() {
    for (const bar of active) collapse(bar);
  }
  function nearEdge(rect, vertical, rtl, distance) {
    const edge = vertical ? (rtl ? rect.left : rect.right) : rect.bottom;
    const along = vertical ? pointer.y : pointer.x;
    return Math.abs((vertical ? pointer.x : pointer.y) - edge) <= distance
      && along >= (vertical ? rect.top : rect.left)
      && along <= (vertical ? rect.bottom : rect.right);
  }
  function isNear(bar) {
    let rect = bar.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    const style = getComputedStyle(bar);
    const rtl = style.direction === 'rtl';
    if (sheets) {
      return nearEdge(rect, bar.classList.contains('native-scrollbar-y'),
        bar.classList.contains('native-scrollbar-rtl'), active.has(bar) ? 56 : 38);
    }
    const viewport = bar === document.scrollingElement;
    if (viewport) rect = {left: 0, top: 0, right: innerWidth, bottom: innerHeight};
    const limit = active.has(bar) ? 60 : 40;
    const scrollable = value => /^(auto|scroll|overlay)$/.test(value);
    const vertical = viewport ? style.overflowY !== 'hidden' && style.overflowY !== 'clip'
      : scrollable(style.overflowY);
    const horizontal = viewport ? style.overflowX !== 'hidden' && style.overflowX !== 'clip'
      : scrollable(style.overflowX);
    return (vertical && bar.scrollHeight > bar.clientHeight && nearEdge(rect, true, rtl, limit))
      || (horizontal && bar.scrollWidth > bar.clientWidth && nearEdge(rect, false, rtl, limit));
  }
  function update() {
    frame = 0;
    if (!root.hasAttribute('data-wide-scrollbars-on') || root.dataset.wideScrollbarsMode === 'always') {
      reset();
      return;
    }
    // Freeze geometry while a mouse button is held, including native scrollbar drags.
    if (!pointer || pointer.buttons) return;
    const candidates = new Set(active);
    if (sheets) {
      for (const bar of document.querySelectorAll('.grid-container > .native-scrollbar')) candidates.add(bar);
    } else {
      // Walk only hovered elements and ancestors, not the entire document.
      candidates.add(document.scrollingElement);
      for (let element of document.elementsFromPoint(pointer.x, pointer.y)) {
        while (element && !candidates.has(element)) {
          candidates.add(element);
          element = element.parentElement;
        }
      }
    }
    for (const bar of candidates) {
      if (!bar) continue;
      if (!bar.isConnected) {
        collapse(bar);
      } else if (isNear(bar)) {
        cancel(bar);
        bar.setAttribute(attribute, '');
        active.add(bar);
      } else if (active.has(bar) && !timers.has(bar)) {
        timers.set(bar, setTimeout(() => collapse(bar), 350));
      }
    }
  }
  function track(event) {
    pointer = {x: event.clientX, y: event.clientY, buttons: event.buttons};
    if (event.buttons) for (const bar of active) cancel(bar);
    if (!frame) frame = requestAnimationFrame(update);
  }
  for (const type of ['mousemove', 'mousedown', 'mouseup']) {
    document.addEventListener(type, track, {capture: true, passive: true});
  }
  new MutationObserver(reset).observe(root, {attributes: true,
    attributeFilter: ['data-wide-scrollbars-on', 'data-wide-scrollbars-mode']});
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
})();
