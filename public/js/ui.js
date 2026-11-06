// PASTE AS: public/js/ui.js  (replaces the old file)  S15: Roadmap panel filled (end result, steps, three stages) and roadmap wording updated. S2 + dark mode + S3: new navigation, light and dark theme button, Roadmap button with side panel. Pipeline strip and backend activity drawer are gone.
// Shared chrome: navigation, notification bell and the Roadmap button. (Earlier: Day 11 admin link, Day 10 My record link, Day 9 bell.)
(function () {
  // ---------- Light and dark theme ----------
  // No saved choice = follow the device (the CSS handles that with no flash). A saved choice sets html[data-theme].
  const THEME_KEY = 'pc_theme';
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const savedTheme = () => { try { const v = localStorage.getItem(THEME_KEY); return v === 'dark' || v === 'light' ? v : null; } catch (e) { return null; } };
  const currentTheme = () => root.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light');
  const SVG_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const SVG_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const initialTheme = savedTheme();
  if (initialTheme) root.setAttribute('data-theme', initialTheme);

  function refreshTheme() {
    const dark = currentTheme() === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
      const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
      b.setAttribute('aria-label', label); b.title = label;
      const ic = b.querySelector('.ti'); if (ic) ic.innerHTML = dark ? SVG_SUN : SVG_MOON;
      const tx = b.querySelector('.tt'); if (tx) tx.textContent = dark ? 'Light mode' : 'Dark mode';
    });
  }
  function wireTheme() {
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* the choice just will not be remembered */ }
      refreshTheme();
    }));
    if (mq && mq.addEventListener) mq.addEventListener('change', refreshTheme);
    refreshTheme();
  }

  // S15: roadmap content, used only by the Roadmap side panel and roadmap.html (no pipeline uses it any more).
  //   proto = what works in this build today.  final = what is still to come.  result = what the user gets.
  const STEPS = [
    { name: 'Triage', proto: 'A short survey in English, Hindi or Kannada maps symptoms to a specialist using simple rules.',
      final: 'Survey answers are saved and shown to the doctor before the call.', result: 'The patient reaches the right doctor first time.' },
    { name: 'Sign in', proto: 'Passwords are stored as bcrypt hashes. The server issues a signed login token (JWT), checks the role on every request, limits wrong passwords and writes a security audit log.',
      final: 'Email verification and password reset by email.', result: 'Only the right person sees the right medical data.' },
    { name: 'Doctors and booking', proto: 'Doctors switch online or offline and every patient sees it instantly. Patients can book a doctor’s time slot, or join a waiting queue when the doctor is busy and get a “your turn” alert. An admin can disable a doctor.',
      final: 'Recurring weekly hours for doctors and rescheduling.', result: 'Patients see who can answer now, or book a time.' },
    { name: 'Request and alerts', proto: 'A request appears on the doctor’s screen the moment it is sent and expires after 2 minutes. In-app notifications and a bell cover reminders, cancellations and queue turns.',
      final: 'Email and SMS notifications and appointment reminders.', result: 'No missed requests, fewer no-shows.' },
    { name: 'Video and chat', proto: 'Live video goes directly between the two browsers. Chat is encrypted in the browser, so the database holds only unreadable ciphertext. A key check code lets both sides compare keys, and an encrypted key backup can restore them.',
      final: 'Token-secured video rooms and a managed relay server for strict networks.', result: 'Private consultations that even the server operator cannot read.' },
    { name: 'Live captions', proto: 'Speech becomes text in the speaker’s browser and appears on the other person’s screen as they speak. Everything said is kept in a captions panel. Patients are matched to doctors who speak their language.',
      final: 'A managed speech service with a medical word list, and captions saved to the patient record with consent.', result: 'A Kannada-speaking patient is matched with a Kannada-speaking doctor and can follow along with live captions.' },
    { name: 'Payment', proto: 'After the call ends, the patient pays. The server reads the fee from the database and verifies the payment. The gateway itself is simulated.',
      final: 'Razorpay with a backup webhook, UPI QR, and payment reconciliation.', result: 'Real payments that still confirm if the patient closes the tab.' },
    { name: 'Documents', proto: 'Two separate PDFs are created on the server after payment: the prescription (signed, with a QR code) and the invoice. Anyone can check a prescription on the verify page, and the server detects tampering. Our prototype signature is used.',
      final: 'The doctor’s licensed digital signature, cloud storage, and tamper-proof records.', result: 'A prescription a pharmacy can verify, and an invoice for accounts.' },
    { name: 'Medical record', proto: 'Patients keep their allergies, conditions and reports, and see a timeline grouped by doctor. A doctor in a consultation can read it but not change it. Every doctor view is logged and the patient is told.',
      final: 'Consent-based sharing, record export and retention rules.', result: 'One place for a patient’s history, shared only with the doctors they consult.' },
    { name: 'Admin panel', proto: 'Admins see counts, appointments, payments and the audit log. They can add, disable and re-enable doctors and set a new doctor password. They cannot read chats, records or PDFs.',
      final: 'Approval steps for new doctors and exportable reports.', result: 'The service can be run and checked without exposing patient data.' }
  ];
  // The 30 / 70 / 100 stages, one row per area. Used for the full table on roadmap.html.
  const AREAS = [
    ['Hosting', 'Runs on one laptop (localhost)', 'Online, with a link you can share', 'Separate frontend, backend and database hosting'],
    ['Database', 'Supabase Postgres, reached only through our server', 'Row-level security rules in the database too', 'Consent records, retention rules and backups'],
    ['Payments', 'Simulated gateway, real server checks', 'Razorpay in test mode and a UPI QR', 'Razorpay webhook backup and reconciliation'],
    ['Documents', 'Server PDFs with a prototype signature, QR check page and tamper check', 'Invoice and prescription kept per patient and easy to re-download', 'Licensed signature and tamper-proof storage'],
    ['Video', 'Direct browser-to-browser', 'A relay server for strict networks', 'Token-secured rooms (only the two participants)'],
    ['Chat encryption', 'Encrypted in the browser, key check code, encrypted key backup', 'Per-appointment keys', 'Long-term keys and device management'],
    ['Languages and captions', 'Live captions with a history panel. Patients are matched to doctors by spoken language', 'Interface in 3 languages, doctor language profiles managed by an admin', 'Managed speech service with a medical word list, captions saved to the record with consent'],
    ['Scheduling', 'Doctor slots, booking, and a waiting queue with a “your turn” alert', 'Recurring weekly hours and rescheduling', 'Calendar sync and no-show handling'],
    ['Medical record', 'Allergies, conditions, reports and a timeline by doctor. Doctors read-only, every view logged', 'Report previews and clearer sharing controls', 'Consent-based sharing, export and retention rules'],
    ['Admin and alerts', 'Admin panel (counts, doctors, payments, audit log) and in-app notifications', 'Approval steps for new doctors', 'Email and SMS reminders, exportable reports'],
    ['Quality', 'Manual rehearsal and a check script for each build day', 'Manual rehearsal on two laptops', 'Automated tests and CI, compliance checklist']
  ];
  // Short version of the three stages for the side panel.
  const STAGES = [
    { pct: '30%', now: true, title: 'This build, working today', items: ['Runs on localhost with a Supabase database', 'Slots, waiting queue, video, encrypted chat and key backup', 'Simulated payment, signed prescription and invoice, QR check', 'Medical record, notifications and admin panel'] },
    { pct: '70%', title: 'Complete demo build', items: ['Online with a shareable link', 'Razorpay test mode and a UPI QR', 'Interface in 3 languages, doctor language profiles', 'Relay server for video on strict networks'] },
    { pct: '100%', title: 'Production build', items: ['Token-secured video rooms and licensed signatures', 'Razorpay webhook backup and reconciliation', 'Email and SMS reminders', 'Automated tests and a compliance checklist'] }
  ];
  window.PC_AREAS = AREAS;
  window.PC_STAGES = STAGES;
  window.PC_STEPS = STEPS;

  const LOGO = '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#8AEB4C"/><path d="M3 17h7l3-7 5 13 3-6h8" stroke="#001811" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---------- Notification bell (Day 9) ----------
  const BELL_HTML = `<div class="bell-wrap">
      <button class="bell-btn" id="bell-btn" aria-label="Notifications" aria-expanded="false" aria-haspopup="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        <span class="bell-badge" id="bell-badge" hidden>0</span>
      </button>
      <div class="bell-panel" id="bell-panel" hidden role="dialog" aria-label="Notifications">
        <div class="bell-head"><b>Notifications</b><button class="btn btn-ghost btn-sm" id="bell-readall">Mark all read</button></div>
        <div class="bell-list" id="bell-list"></div>
      </div>
    </div>`;
  const BELL_CSS = `
    .bell-wrap{position:relative}
    .bell-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--ink-soft);cursor:pointer}
    .bell-btn:hover{background:var(--teal-wash);color:var(--teal-dark)}
    .bell-badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--coral);color:#fff;font-size:.7rem;font-weight:700;line-height:18px;text-align:center}
    .bell-panel{position:absolute;right:0;top:46px;width:min(360px,92vw);max-height:70vh;display:flex;flex-direction:column;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 34px rgba(18,38,58,.18);z-index:60;overflow:hidden}
    .bell-panel[hidden],.bell-badge[hidden]{display:none}
    .bell-head{display:flex;align-items:center;justify-content:space-between;padding:.6rem .8rem;border-bottom:1px solid var(--line)}
    .bell-list{overflow-y:auto}
    .bell-empty{padding:1.4rem 1rem;text-align:center;color:var(--muted);font-size:.9rem}
    .bell-item{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:var(--card);padding:.65rem .8rem .65rem 1.4rem;cursor:pointer;position:relative;font:inherit;color:var(--ink)}
    .bell-item:hover{background:var(--paper)}
    .bell-item.unread{background:var(--teal-wash)}
    .bell-item.unread::before{content:'';position:absolute;left:.6rem;top:1rem;width:8px;height:8px;border-radius:50%;background:var(--teal)}
    .bell-item .t{font-weight:700;font-size:.9rem}
    .bell-item .b{font-size:.84rem;color:var(--ink-soft);margin-top:.1rem}
    .bell-item .w{font-size:.74rem;color:var(--muted);margin-top:.2rem}
    .bell-toast{position:fixed;right:16px;bottom:70px;max-width:340px;z-index:80;background:var(--ink);color:#fff;border-radius:12px;padding:.7rem .9rem;box-shadow:0 10px 30px rgba(0,0,0,.28);cursor:pointer;font-size:.88rem}
    .bell-toast b{display:block;margin-bottom:.1rem}`;

  function bell() {
    const btn = document.getElementById('bell-btn');
    if (!btn || !window.PC || !PC.user) return;
    const st = document.createElement('style'); st.textContent = BELL_CSS; document.head.appendChild(st);
    const badge = document.getElementById('bell-badge'), panel = document.getElementById('bell-panel'), list = document.getElementById('bell-list');
    let items = [], unread = 0;

    const ago = (iso) => {
      const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
      if (s < 60) return 'just now';
      if (s < 3600) return Math.floor(s / 60) + ' min ago';
      if (s < 86400) return Math.floor(s / 3600) + ' h ago';
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };
    const render = () => {
      badge.hidden = unread <= 0; badge.textContent = unread > 99 ? '99+' : unread;
      btn.setAttribute('aria-label', unread ? `Notifications, ${unread} unread` : 'Notifications');
      list.innerHTML = items.length ? items.map((n) => `<button class="bell-item ${n.read ? '' : 'unread'}" data-id="${PC.esc(n.id)}">
          <div class="t">${PC.esc(n.title)}</div>${n.body ? `<div class="b">${PC.esc(n.body)}</div>` : ''}<div class="w">${ago(n.createdAt)}</div></button>`).join('')
        : '<div class="bell-empty">No notifications yet.</div>';
    };
    const load = async () => { try { const r = await PC.api('GET', '/notifications'); items = r.items; unread = r.unread; render(); } catch (e) { /* the bell stays quiet if the server is busy */ } };
    const here = (link) => { try { const u = new URL(link, location.origin); return u.pathname === location.pathname && u.search === location.search; } catch { return false; } };

    const toast = (n) => {
      const t = document.createElement('div'); t.className = 'bell-toast'; t.setAttribute('role', 'status');
      t.innerHTML = `<b>${PC.esc(n.title)}</b>${PC.esc(n.body || '')}`;
      t.onclick = () => { t.remove(); open(n); };
      document.body.appendChild(t); setTimeout(() => t.remove(), 7000);
    };
    async function open(n) {
      if (!n.read) { n.read = true; unread = Math.max(0, unread - 1); render(); try { await PC.api('POST', '/notifications/' + encodeURIComponent(n.id) + '/read'); } catch (e) {} }
      panel.hidden = true; btn.setAttribute('aria-expanded', 'false');
      if (n.link && !here(n.link)) location.href = n.link;
    }

    btn.addEventListener('click', (e) => { e.stopPropagation(); panel.hidden = !panel.hidden; btn.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) { render(); load(); } });
    panel.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
    list.addEventListener('click', (e) => { const el = e.target.closest('.bell-item'); if (!el) return; const n = items.find((x) => x.id === el.dataset.id); if (n) open(n); });
    document.getElementById('bell-readall').addEventListener('click', async () => {
      items.forEach((n) => { n.read = true; }); unread = 0; render();
      try { await PC.api('POST', '/notifications/read-all'); } catch (e) {}
    });

    const s = PC.socket();
    if (s) {
      s.on('notify:new', (n) => { items.unshift(n); items = items.slice(0, 50); unread++; render(); toast(n); });
      s.on('connect', load); // catches anything that arrived while the connection was down
    }
    load();
    setInterval(render, 60000); // keeps "5 min ago" fresh
  }

  function nav(active) {
    const u = window.PC && PC.user;
    const onAdminPage = location.pathname.endsWith('/admin.html');
    const links = [['/index.html', 'Home', 'home']];
    if (u && u.role === 'patient') { links.push(['/patient.html', 'My care', 'dash']); links.push(['/record.html', 'My record', 'record']); }
    if (u && u.role === 'doctor') links.push(['/doctor.html', 'My patients', 'dash']);
    if (u && u.role === 'admin') links.push(['/admin.html', 'Admin', 'admin']);
    const themeBtn = '<button class="theme-toggle" type="button" data-theme-toggle><span class="ti"></span></button>';
    const right = themeBtn + (u
      ? `${u.role === 'admin' ? '' : BELL_HTML}<span class="who">${PC.esc(u.name)}</span><button class="btn btn-ghost btn-sm" id="logout-btn" aria-label="Log out"><span class="lo-text">Log out</span><svg class="lo-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg></button>`
      : (onAdminPage ? '' : '<a class="btn btn-primary btn-sm" href="/index.html#signin">Log in</a>'));
    return `<header class="nav" id="site-nav">
      <a class="logo" href="/index.html" aria-label="Pulscare home">${LOGO}<span>Puls<em>care</em></span></a>
      <ul class="nav-links" id="nav-links">${links.map(([h, t, k]) => `<li><a href="${h}" class="${active === k ? 'active' : ''}"${active === k ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}<li class="nav-theme"><button type="button" data-theme-toggle><span class="ti"></span><span class="tt"></span></button></li></ul>
      <div class="nav-right">${right}<button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div>
    </header>`;
  }

  function wireNav() {
    const nv = document.getElementById('site-nav'), tg = document.getElementById('nav-toggle');
    if (!nv || !tg) return;
    tg.addEventListener('click', () => { const o = nv.classList.toggle('open'); tg.setAttribute('aria-expanded', String(o)); tg.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); });
  }

  // ---------- Roadmap button + side panel (S2). The panel text is short on purpose; the full page is /roadmap.html ----------
  function roadmap() {
    if (!PC.user || PC.user.role !== 'admin') return;   // the roadmap is only for the admin; patients, doctors and visitors do not see it
    if (location.pathname.endsWith('/roadmap.html') || document.getElementById('rm-fab')) return;
    if (!document.getElementById('rm-style')) {
      const st = document.createElement('style'); st.id = 'rm-style';
      st.textContent = `
      .rm-body .rm-end{background:var(--green-800);color:#fff;border-radius:var(--radius-md);padding:1.1rem 1.2rem}
      .rm-body .rm-end .tag{color:var(--lime-500);background:transparent;margin-bottom:.6rem}
      .rm-body .rm-end p{font-size:.92rem;line-height:1.55;color:rgba(255,255,255,.88)}
      .rm-body .rm-steps{counter-reset:rms;display:grid;gap:.55rem;list-style:none}
      .rm-body .rm-steps li{display:grid;grid-template-columns:28px 1fr;gap:.65rem;font-size:.86rem;color:var(--muted);line-height:1.4}
      .rm-body .rm-steps li::before{content:counter(rms);counter-increment:rms;width:26px;height:26px;margin-top:0;border-radius:50%;background:var(--green-800);color:var(--lime-500);font-size:.78rem;font-weight:800;display:grid;place-items:center}
      .rm-body .rm-steps b{display:block;color:var(--ink);font-size:.93rem}
      .rm-body .rm-stages{display:grid;gap:.7rem}
      .rm-body .rm-stage{border:1px solid var(--line);border-radius:16px;padding:.9rem 1rem;background:var(--surface)}
      .rm-body .rm-stage.now{background:var(--green-800);color:#fff;border-color:rgba(138,235,76,.3)}
      .rm-body .rm-stage h4{display:flex;align-items:center;gap:.55rem;font-size:.95rem;margin-bottom:.5rem}
      .rm-body .rm-pct{font-size:.74rem;font-weight:800;border-radius:999px;padding:.1rem .6rem;background:var(--lime-500);color:var(--green-900)}
      .rm-body .rm-stage:not(.now) .rm-pct{background:var(--wash-2);color:var(--ink-soft)}
      .rm-body .rm-stage ul{gap:.3rem}
      .rm-body .rm-stage li{grid-template-columns:12px 1fr;font-size:.85rem;line-height:1.4}
      .rm-body .rm-stage li::before{content:'';width:6px;height:6px;margin-top:.5rem;background:currentColor;opacity:.55}
      .rm-body .rm-stage.now li::before{background:var(--lime-500);opacity:1}
      `;
      document.head.appendChild(st);
    }
    const wrap = document.createElement('div');
    wrap.innerHTML = `<button class="rm-fab" id="rm-fab" aria-label="Open roadmap" aria-expanded="false" aria-controls="rm-panel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z"/><path d="M9 4v13M15 6.5v13"/></svg><span>Roadmap</span></button>
      <div class="rm-overlay" id="rm-overlay"></div>
      <aside class="rm-panel" id="rm-panel" role="dialog" aria-modal="true" aria-labelledby="rm-title" aria-hidden="true">
        <div class="rm-head"><h2 id="rm-title">Roadmap</h2><button class="rm-close" id="rm-close" aria-label="Close roadmap">&times;</button></div>
        <div class="rm-body">
          <div class="rm-end"><span class="tag">The end result</span><p>A patient describes symptoms in their own language, meets an available specialist on encrypted video with live captions, pays once the call ends, and receives a signed prescription and a numbered invoice.</p></div>
          <div><h3>The journey, step by step</h3>
            <ol class="rm-steps">${STEPS.map((s) => `<li><span><b>${s.name}</b>${s.result}</span></li>`).join('')}</ol></div>
          <div><h3>Three stages</h3>
            <div class="rm-stages">${STAGES.map((g) => `<section class="rm-stage ${g.now ? 'now' : ''}"><h4><span class="rm-pct">${g.pct}</span>${g.title}</h4><ul>${g.items.map((i) => `<li>${i}</li>`).join('')}</ul></section>`).join('')}</div></div>
          <a class="btn btn-primary" href="/roadmap.html">Open full roadmap</a>
        </div>
      </aside>`;
    document.body.appendChild(wrap);
    const fab = document.getElementById('rm-fab'), panel = document.getElementById('rm-panel'), ov = document.getElementById('rm-overlay'), close = document.getElementById('rm-close');
    const setOpen = (o) => {
      panel.classList.toggle('open', o); ov.classList.toggle('open', o);
      panel.setAttribute('aria-hidden', String(!o)); fab.setAttribute('aria-expanded', String(o));
      if (o) close.focus(); else fab.focus();
    };
    fab.addEventListener('click', () => setOpen(true));
    close.addEventListener('click', () => setOpen(false));
    ov.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false); });
  }

  window.PCUI = {
    mount({ step, active } = {}) { // "step" is kept so old pages keep working; it is no longer used
      const slot = document.getElementById('chrome');
      slot.innerHTML = nav(active);
      wireNav();
      wireTheme();
      const lo = document.getElementById('logout-btn');
      if (lo) lo.addEventListener('click', () => PC.logout());
      bell();
      roadmap();
      // Emergency SOS button + Need help? widget on every page
      ['/js/sos.js', '/js/support.js'].forEach((src) => {
        if (document.querySelector('script[src="' + src + '"]')) return;
        const sc = document.createElement('script'); sc.src = src; document.body.appendChild(sc);
      });
    }
  };
})();