(() => {
  const attribute = 'data-wide-scrollbars-near';
  const active = new Set();
  const timers = new Map();
  let pointer = null;
  let frame = 0;

  function cancelCollapse(bar) {
    clearTimeout(timers.get(bar));
    timers.delete(bar);
  }

  function collapse(bar) {
    cancelCollapse(bar);
    bar.removeAttribute(attribute);
    active.delete(bar);
  }

  function reset() {
    for (const bar of active) collapse(bar);
  }

  function update() {
    frame = 0;
    if (!document.documentElement.hasAttribute('data-wide-scrollbars-on')) {
      reset();
      return;
    }
    // Do not change geometry during a scrollbar drag or cell selection.
    if (!pointer || pointer.buttons) return;
    for (const bar of active) {
      if (!bar.isConnected) collapse(bar);
    }
    for (const bar of document.querySelectorAll('.grid-container > .native-scrollbar')) {
      const rect = bar.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const vertical = bar.classList.contains('native-scrollbar-y');
      const rtl = bar.classList.contains('native-scrollbar-rtl');
      const edge = vertical ? (rtl ? rect.left : rect.right) : rect.bottom;
      const distance = Math.abs((vertical ? pointer.x : pointer.y) - edge);
      const along = vertical ? pointer.y : pointer.x;
      const start = vertical ? rect.top : rect.left;
      const end = vertical ? rect.bottom : rect.right;
      // Use the fixed outer edge, so widening cannot move the activation boundary.
      const near = distance <= (active.has(bar) ? 56 : 38)
        && along >= start && along <= end;
      if (near) {
        cancelCollapse(bar);
        bar.setAttribute(attribute, '');
        active.add(bar);
      } else if (active.has(bar) && !timers.has(bar)) {
        timers.set(bar, setTimeout(() => collapse(bar), 350));
      }
    }
  }

  function track(event) {
    pointer = {x: event.clientX, y: event.clientY, buttons: event.buttons};
    if (event.buttons) {
      for (const bar of active) cancelCollapse(bar);
    }
    if (!frame) frame = requestAnimationFrame(update);
  }
  document.addEventListener('mousemove', track, {capture: true, passive: true});
  document.addEventListener('mousedown', track, {capture: true, passive: true});
  document.addEventListener('mouseup', track, {capture: true, passive: true});
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
  });
})();
