// Decorative copies never receive focus or replace the real dialog's state.
function createModalShred(root, dialog) {
  let complete = null;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finish = () => complete?.();
  motion.addEventListener?.('change', event => { if (event.matches) finish(); });
  window.addEventListener('resize', finish);

  return {
    get running() { return complete !== null; },
    finish,
    play(onFinish) {
      if (complete) return;
      const bounds = dialog.getBoundingClientRect();
      if (motion.matches || !dialog.animate || !bounds.width || !bounds.height) {
        onFinish();
        return;
      }
      const layer = document.createElement('div');
      layer.className = 'sp-shred-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.inert = true;
      const animations = [];
      let done = false, timeout;
      complete = () => {
        if (done) return;
        done = true;
        complete = null;
        clearTimeout(timeout);
        animations.forEach(animation => animation.cancel());
        layer.remove();
        dialog.classList.remove('sp-shredding');
        dialog.removeAttribute('aria-busy');
        onFinish();
      };
      const settle = complete;
      try {
        const origin = root.getBoundingClientRect();
        const count = Math.max(7, Math.min(12, Math.round(bounds.width / 45)));
        const width = bounds.width / count;
        const scrollTop = dialog.querySelector('.sp-modal-body').scrollTop;
        for (let i = 0; i < count; i++) {
          const strip = document.createElement('div');
          strip.className = 'sp-shred-strip';
          Object.assign(strip.style, {
            left: (bounds.left - origin.left + i * width) + 'px',
            top: (bounds.top - origin.top) + 'px',
            width: (width + .5) + 'px', height: bounds.height + 'px'
          });
          const copy = document.createElement('div');
          copy.className = 'sp-modal sp-shred-snapshot';
          copy.setAttribute('open', '');
          for (const child of dialog.children) copy.appendChild(child.cloneNode(true));
          copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
          copy.querySelectorAll('[autofocus]').forEach(el => el.removeAttribute('autofocus'));
          Object.assign(copy.style, {
            left: (-i * width) + 'px', width: bounds.width + 'px', height: bounds.height + 'px'
          });
          strip.appendChild(copy);
          layer.appendChild(strip);
        }
        root.appendChild(layer);
        layer.querySelectorAll('.sp-modal-body').forEach(body => { body.scrollTop = scrollTop; });
        dialog.classList.add('sp-shredding');
        dialog.setAttribute('aria-busy', 'true');
        [...layer.children].forEach((strip, i) => {
          const side = i - (count - 1) / 2;
          const fall = 70 + (i * 37 % 65);
          animations.push(strip.animate([
            { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${side * 1.5}px,${fall * .18}px) rotate(${side * .25}deg)`, opacity: 1, offset: .32 },
            { transform: `translate(${side * 5}px,${fall}px) rotate(${side * 1.4}deg)`, opacity: 0 }
          ], { duration: 460, delay: (i * 19 % 75), easing: 'cubic-bezier(.4,0,.8,.4)', fill: 'both' }));
        });
        Promise.allSettled(animations.map(animation => animation.finished)).then(settle).catch(settle);
        // A suspended/cancelled animation must never trap the user in the popup.
        timeout = setTimeout(settle, 800);
      } catch {
        settle();
      }
    }
  };
}
