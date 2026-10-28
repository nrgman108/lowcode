(() => {
  // Подсветка карточек за курсором
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // Терминал: в HTML уже лежит полный текст, здесь он «перепечатывается» по кругу
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const term = document.getElementById('term');
  const source = term.innerHTML.replace(/<span class="caret"><\/span>\s*$/, '');
  const tmp = document.createElement('div');
  tmp.innerHTML = source;
  const nodes = [...tmp.childNodes];
  const caret = '<span class="caret"></span>';
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  async function play() {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    await sleep(4000);
    while (true) {
      let html = '';
      term.innerHTML = caret;
      for (const node of nodes) {
        const text = node.textContent;
        const open = node.nodeType === 1 ? `<span class="${node.className}">` : '';
        const close = node.nodeType === 1 ? '</span>' : '';
        const typed = node.nodeType === 1 && node.className === 't-user';
        if (typed) {
          for (let i = 1; i <= text.length; i++) {
            term.innerHTML = html + open + esc(text.slice(0, i)) + close + caret;
            await sleep(32);
          }
        } else if (text.includes('\n')) {
          await sleep(text.trim() ? 0 : 380);
        }
        html += open + esc(text) + close;
        term.innerHTML = html + caret;
      }
      await sleep(5000);
    }
  }
  play();
})();
