import './styles.css';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Подсветка карточек за курсором
function initCardGlow() {
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// Кнопки «Копировать» у команд; если буфер обмена недоступен, выделяем текст
function initCopyButtons() {
  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const label = btn.textContent;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Скопировано';
        btn.classList.add('done');
      } catch {
        const code = btn.closest('.cmd').querySelector('code');
        getSelection().selectAllChildren(code);
        btn.textContent = 'Выделено';
      }
      setTimeout(() => {
        btn.textContent = label;
        btn.classList.remove('done');
      }, 1600);
    });
  });
}

// Полоса прогресса чтения
function initProgress() {
  const bar = document.getElementById('progress');
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

// Подсветка текущего раздела в навигации
function initNavSpy() {
  const links = new Map(
    [...document.querySelectorAll('.nav a')].map((a) => [a.getAttribute('href').slice(1), a]),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove('active'));
        const link = links.get(entry.target.id);
        if (!link) return;
        link.classList.add('active');
        // Прокручиваем только саму ленту ссылок, чтобы не дёргать страницу
        const nav = link.parentElement;
        nav.scrollTo({
          left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

// Терминал: в HTML уже лежит полный текст, здесь он «перепечатывается» по кругу
function initTerminal() {
  const term = document.getElementById('term');
  const source = term.innerHTML.replace(/<span class="caret"><\/span>\s*$/, '');
  const tmp = document.createElement('div');
  tmp.innerHTML = source;
  const nodes = [...tmp.childNodes];
  const caret = '<span class="caret"></span>';
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function play() {
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
}

initCardGlow();
initCopyButtons();
initProgress();
initNavSpy();
if (!reducedMotion) initTerminal();
