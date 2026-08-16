// year
document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// self-reported page load latency
addEventListener('load', () => {
  const loadMsEl = document.getElementById('loadMs');
  if (!loadMsEl) return;
  const nav = performance.getEntriesByType('navigation')[0];
  const ms = nav ? Math.round(nav.domContentLoadedEventEnd) : Math.round(performance.now());
  loadMsEl.textContent = ms;
});

// live status line — local time in Das's timezone (IST)
const localTimeEl = document.getElementById('localTime');
if (localTimeEl) {
  const updateClock = () => {
    localTimeEl.textContent = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date());
  };
  updateClock();
  setInterval(updateClock, 30000);
}

// nav scroll state
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8));

// scroll progress bar
const progress = document.getElementById('scrollProgress');
const updateProgress = () => {
  const h = document.documentElement;
  const scrollable = h.scrollHeight - h.clientHeight;
  progress.style.width = scrollable > 0 ? `${(h.scrollTop / scrollable) * 100}%` : '0%';
};
addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// mobile menu
const menuBtn = document.getElementById('menuBtn');
const navlinks = document.getElementById('navlinks');
menuBtn.addEventListener('click', () => navlinks.classList.toggle('open'));
navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navlinks.classList.remove('open')));

// reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));

// terminal hero typewriter sequence
const terminal = document.getElementById('terminal');
if (terminal) {
  const rows = Array.from(terminal.querySelectorAll('.term-row'));
  rows.forEach(row => {
    const cursor = row.querySelector('.term-cursor');
    if (cursor) cursor.style.opacity = '0';
  });

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  const typeSequence = async () => {
    await wait(reduceMotion ? 0 : 150);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cmd = row.querySelector('.cmd');
      const cursor = row.querySelector('.term-cursor');
      const text = cmd.dataset.text;
      const revealEl = terminal.querySelector(`.term-reveal[data-reveal="${row.dataset.line}"]`);
      const isLast = i === rows.length - 1;

      if (cursor) cursor.style.opacity = '1';
      if (reduceMotion) {
        cmd.textContent = text;
      } else {
        for (let c = 0; c <= text.length; c++) {
          cmd.textContent = text.slice(0, c);
          await wait(14 + Math.random() * 22);
        }
        await wait(120);
      }
      if (revealEl) revealEl.classList.add('shown');
      if (!isLast && cursor) cursor.style.opacity = '0';
      await wait(reduceMotion ? 0 : 180);
    }
  };
  typeSequence();
}

// animated stat counters
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    countIO.unobserve(el);
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.count').forEach(el => countIO.observe(el));

// cursor spotlight on project cards
if (!reduceMotion) {
  document.querySelectorAll('.proj').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// contact form -> Web3Forms
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
const sendBtn = document.getElementById('sendBtn');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('message').value.trim();
  if (!name || !email || !msg) { note.textContent = 'Please fill in all fields.'; note.style.color = '#b4482f'; return; }
  if (form.botcheck.checked) return;

  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending…';
  note.textContent = 'Sending your message…';
  note.style.color = '';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: form.access_key.value,
        subject: form.subject.value,
        name, email, message: msg,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Submission failed');
    form.reset();
    note.textContent = "Message sent — I'll get back to you soon.";
  } catch (err) {
    note.innerHTML = 'Something went wrong — please email me directly at <a href="mailto:sanjeevan6000@gmail.com">sanjeevan6000@gmail.com</a>.';
    note.style.color = '#b4482f';
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send message';
  }
});

// interactive terminal console
(() => {
  const consoleEl = document.getElementById('termConsole');
  if (!consoleEl || !terminal) return;

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const wait = (ms) => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));

  const knownCommands = ['help', 'resume', 'ls', 'about', 'experience', 'projects', 'skills', 'credentials', 'contact', 'whoami', 'sudo hire-me', 'benchmark', 'clear'];
  const commandHistory = [];
  let historyIndex = -1;

  // matches if the whole command OR any of its words starts with the typed prefix
  const matchCommands = (prefix) => {
    if (!prefix) return [];
    return knownCommands.filter(c => c.startsWith(prefix) || c.split(' ').some(w => w.startsWith(prefix)));
  };

  const helpText = "Commands: help · resume · ls · about · experience · projects · skills · credentials · contact · whoami · benchmark · sudo hire-me · clear";

  const runCommand = (raw) => {
    const cmd = raw.trim();
    const lower = cmd.toLowerCase();
    if (!cmd) return null;
    if (lower === 'help') return { text: helpText };
    if (lower === 'ls') return { text: 'about.md  experience.log  ai-work.py  skills.json  credentials.md  contact' };
    if (lower === 'whoami') return { text: 'Das Sanjeevan — Senior Software Engineer / Technical Lead' };
    if (lower === 'clear') return { clear: true };
    if (lower === 'about' || lower === 'cd about') { scrollToId('about'); return { text: 'Navigating to about.md…', ok: true }; }
    if (lower === 'experience' || lower === 'cd experience') { scrollToId('experience'); return { text: 'Opening experience.log…', ok: true }; }
    if (lower === 'projects' || lower === 'ai' || lower === 'cd projects') { scrollToId('projects'); return { text: 'Listing AI & Innovation work…', ok: true }; }
    if (lower === 'skills' || lower === 'cd skills') { scrollToId('skills'); return { text: 'Reading skills.json…', ok: true }; }
    if (lower === 'credentials' || lower === 'cd credentials') { scrollToId('credentials'); return { text: 'Opening credentials.md…', ok: true }; }
    if (lower === 'contact' || lower === 'cd contact') { scrollToId('contact'); return { text: 'Opening contact form…', ok: true }; }
    if (lower === 'resume' || lower === './resume') { document.getElementById('resumeBtn').click(); return { text: 'Downloading Das_Sanjeevan_Resume.pdf…', ok: true }; }
    return { text: `command not found: ${cmd} — try 'help', or just use the menu above.`, err: true };
  };

  const echoAndOutput = (value) => {
    if (value.trim()) {
      const done = document.createElement('div');
      done.className = 'term-row';
      const echoCmd = document.createElement('span');
      echoCmd.textContent = value;
      done.innerHTML = '<span class="prompt">$</span>';
      done.appendChild(echoCmd);
      consoleEl.appendChild(done);
    }
    const out = document.createElement('div');
    out.className = 'term-out';
    consoleEl.appendChild(out);
    consoleEl.scrollTop = consoleEl.scrollHeight;
    return out;
  };

  const sudoHireMe = async (out) => {
    out.textContent = 'Initiating secure handshake…';

    const overlay = document.getElementById('hireOverlay');
    if (!overlay) { scrollToId('contact'); return; }

    const line1 = document.getElementById('hireLine1');
    const line2 = document.getElementById('hireLine2');
    const barTrack = document.querySelector('.hire-bar-track');
    const barFill = document.getElementById('hireBarFill');
    const result = document.getElementById('hireResult');

    line1.classList.remove('shown');
    line2.classList.remove('shown');
    barTrack.classList.remove('shown');
    barFill.style.width = '0%';
    result.classList.remove('shown');

    overlay.classList.add('open');

    if (reduceMotion) {
      line1.classList.add('shown');
      line2.classList.add('shown');
      barTrack.classList.add('shown');
      barFill.style.width = '100%';
      result.classList.add('shown');
    } else {
      await wait(60);
      line1.classList.add('shown');
      await wait(500);
      line2.classList.add('shown');
      await wait(300);
      barTrack.classList.add('shown');
      await wait(30);
      barFill.style.width = '100%';
      await wait(900);
      result.classList.add('shown');
    }

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      overlay.classList.remove('open');
      scrollToId('contact');
    };
    overlay.addEventListener('click', dismiss, { once: true });
    const onEscape = (e) => { if (e.key === 'Escape') { dismiss(); document.removeEventListener('keydown', onEscape); } };
    document.addEventListener('keydown', onEscape);
    await wait(reduceMotion ? 300 : 2200);
    dismiss();
  };

  const benchmark = (out) => {
    const nav = performance.getEntriesByType('navigation')[0];
    const durations = performance.getEntriesByType('resource')
      .map(e => e.duration)
      .filter(d => d > 0);
    if (nav) durations.push(nav.duration);
    durations.sort((a, b) => a - b);
    if (!durations.length) {
      out.textContent = 'No timing data available yet — try again after the page settles.';
      out.classList.add('err');
      return;
    }
    const pct = (p) => durations[Math.min(Math.floor(durations.length * p), durations.length - 1)];
    const median = pct(0.5).toFixed(1);
    const p95 = pct(0.95).toFixed(1);
    const slowest = durations[durations.length - 1].toFixed(1);
    out.textContent = `Benchmarked ${durations.length} real requests from this page load → median: ${median}ms · p95: ${p95}ms · slowest: ${slowest}ms`;
    out.classList.add('ok');
  };

  const renderInputRow = () => {
    const row = document.createElement('div');
    row.className = 'term-input-row';
    row.innerHTML = '<span class="prompt">$</span><input type="text" class="term-input" autocomplete="off" spellcheck="false" placeholder="try: help, skills, hire-me">';
    consoleEl.appendChild(row);
    const input = row.querySelector('input');
    row.addEventListener('click', () => input.focus());

    const suggestEl = document.createElement('div');
    suggestEl.className = 'term-suggest';
    consoleEl.appendChild(suggestEl);

    input.addEventListener('input', () => {
      const partial = input.value.trim().toLowerCase();
      if (!partial) { suggestEl.innerHTML = ''; return; }
      const matches = matchCommands(partial).slice(0, 3);
      suggestEl.innerHTML = matches.length
        ? `→ ${matches.map(m => `<b>${m}</b>`).join(', ')}`
        : '';
    });

    input.addEventListener('keydown', async (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!commandHistory.length) return;
        historyIndex = Math.max(historyIndex - 1, 0);
        input.value = commandHistory[historyIndex];
        suggestEl.innerHTML = '';
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!commandHistory.length) return;
        historyIndex = Math.min(historyIndex + 1, commandHistory.length);
        input.value = historyIndex === commandHistory.length ? '' : commandHistory[historyIndex];
        suggestEl.innerHTML = '';
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const partial = input.value.trim().toLowerCase();
        if (!partial) return;
        const matches = matchCommands(partial);
        if (matches.length === 1) {
          input.value = matches[0];
          suggestEl.innerHTML = '';
        } else if (matches.length > 1) {
          const typed = input.value;
          row.remove();
          suggestEl.remove();
          const out = echoAndOutput(typed);
          out.textContent = matches.join('  ');
          renderInputRow();
        }
        return;
      }
      if (e.key !== 'Enter') return;

      const value = input.value;
      const trimmed = value.trim();
      const lower = trimmed.toLowerCase();
      row.remove();
      suggestEl.remove();

      if (trimmed) {
        commandHistory.push(trimmed);
        historyIndex = commandHistory.length;
      }

      if (lower === 'sudo hire-me' || lower === 'hire' || lower === 'hire-me' || lower === 'hire me') {
        const out = echoAndOutput(value);
        renderInputRow();
        await sudoHireMe(out);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        return;
      }
      if (lower === 'benchmark' || lower === './benchmark') {
        const out = echoAndOutput(value);
        renderInputRow();
        benchmark(out);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        return;
      }

      const result = runCommand(value);
      if (trimmed) {
        const done = document.createElement('div');
        done.className = 'term-row';
        const echoCmd = document.createElement('span');
        echoCmd.textContent = value;
        done.innerHTML = '<span class="prompt">$</span>';
        done.appendChild(echoCmd);
        consoleEl.appendChild(done);
      }
      if (result) {
        if (result.clear) {
          consoleEl.innerHTML = '';
        } else if (result.text) {
          const out = document.createElement('div');
          out.className = 'term-out' + (result.err ? ' err' : result.ok ? ' ok' : '');
          out.textContent = result.text;
          consoleEl.appendChild(out);
        }
      }
      renderInputRow();
      consoleEl.scrollTop = consoleEl.scrollHeight;
    });
    input.focus();
  };

  const checkReady = setInterval(() => {
    const reveals = terminal.querySelectorAll('.term-reveal');
    const allShown = Array.from(reveals).every(r => r.classList.contains('shown'));
    if (allShown) {
      clearInterval(checkReady);
      renderInputRow();
    }
  }, 300);

  terminal.addEventListener('click', () => {
    const input = consoleEl.querySelector('.term-input');
    if (input) input.focus();
  });
})();

// command palette
(() => {
  const overlay = document.getElementById('paletteOverlay');
  const paletteInput = document.getElementById('paletteInput');
  const list = document.getElementById('paletteList');
  const cmdkBtn = document.getElementById('cmdkBtn');
  if (!overlay || !paletteInput || !list) return;

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const commands = [
    { label: 'Go to About', key: 'about.md', action: () => scrollToId('about') },
    { label: 'Go to Experience', key: 'experience.log', action: () => scrollToId('experience') },
    { label: 'Go to AI Work', key: 'ai-work.py', action: () => scrollToId('projects') },
    { label: 'Go to Skills', key: 'skills.json', action: () => scrollToId('skills') },
    { label: 'Go to Credentials', key: 'credentials', action: () => scrollToId('credentials') },
    { label: 'Go to Contact', key: 'contact', action: () => scrollToId('contact') },
    { label: 'Download Resume (PDF)', key: '⤓ pdf', action: () => document.getElementById('resumeBtn').click() },
    { label: 'Email Das', key: 'mailto', action: () => { window.location.href = 'mailto:sanjeevan6000@gmail.com'; } },
    { label: 'Open LinkedIn', key: '↗ link', action: () => window.open('https://linkedin.com/in/d-sanjeevan', '_blank', 'noopener') },
  ];

  let filtered = commands;
  let activeIndex = 0;

  const render = () => {
    list.innerHTML = '';
    if (!filtered.length) {
      list.innerHTML = '<li class="palette-empty">No matching commands</li>';
      return;
    }
    filtered.forEach((c, i) => {
      const li = document.createElement('li');
      li.className = i === activeIndex ? 'active' : '';
      const label = document.createElement('span');
      label.textContent = c.label;
      const key = document.createElement('span');
      key.className = 'k';
      key.textContent = c.key;
      li.appendChild(label);
      li.appendChild(key);
      li.addEventListener('mouseenter', () => { activeIndex = i; render(); });
      li.addEventListener('click', () => { c.action(); close(); });
      list.appendChild(li);
    });
  };

  const open = () => {
    overlay.classList.add('open');
    paletteInput.value = '';
    filtered = commands;
    activeIndex = 0;
    render();
    setTimeout(() => paletteInput.focus(), 10);
  };
  const close = () => overlay.classList.remove('open');

  paletteInput.addEventListener('input', () => {
    const q = paletteInput.value.toLowerCase();
    filtered = commands.filter(c => c.label.toLowerCase().includes(q));
    activeIndex = 0;
    render();
  });

  paletteInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); const c = filtered[activeIndex]; if (c) { c.action(); close(); } }
    else if (e.key === 'Escape') { close(); }
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  if (cmdkBtn) cmdkBtn.addEventListener('click', open);

  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? close() : open();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();
