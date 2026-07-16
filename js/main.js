// year
document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
