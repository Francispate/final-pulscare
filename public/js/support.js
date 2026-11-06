// PASTE AS: public/js/support.js  (replaces the old file)  S10b: consultation room help steps updated for the new room (side tabs, settings gear, dock buttons, End call in the dock). Everything else unchanged.
// Support: a "Need help?" button on every page. It lists the next steps for the page the user is on,
// and "Show me" scrolls to the right button and highlights it.
(function () {
  if (window.PCSupport) return;
  const SUPPORT_EMAIL = 'support@pulscare.test'; // change this to your real support address
  const SUPPORT_PHONE = '';                       // optional, for example '+91 80000 00000'

  const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  const user = window.PC && PC.user;
  const role = user && user.role;

  // Each step: t = title, d = what to do, sel = element to highlight (optional).
  const GUIDE = {
    index: () => role
      ? { title: 'You are signed in', steps: [
          { t: 'Go to your page', d: role === 'doctor' ? 'Press "Continue to your doctor page" in the green box at the top.' : 'Press "Continue to your patient page" in the green box at the top.', sel: '#signed-in' },
          { t: 'Or switch account', d: 'Use "Log out" at the top right, then sign in again.', sel: '#logout-btn' } ],
        problems: [] }
      : { title: 'Getting started', steps: [
          { t: 'Choose your language', d: 'Tap English, हिन्दी or ಕನ್ನಡ.', sel: '#lang-pills' },
          { t: 'Select your symptoms', d: 'Tap every symptom you have. A suggested doctor appears under the buttons.', sel: '#symptoms' },
          { t: 'Press "Continue to sign in"', d: 'This takes you to the login boxes.', sel: '#triage .btn-primary' },
          { t: 'Log in or create an account', d: 'Already registered? Use Patient log in. New? Open the "New patient" tab and fill the form.', sel: '#signin .tabs' },
          { t: 'Are you a doctor?', d: 'Use the Doctor log in box on the right. Pick your name and enter your password.', sel: '#d-select' } ],
        problems: [['I forgot my password', 'For the demo, use demo@pulscare.test with patient123, or create a new account.']] },
    patient: () => ({ title: 'Your care page', steps: [
      { t: 'Tell us your languages', d: 'Pick English, Hindi, Kannada, or a mix, or type your own. Doctors who speak your way are shown first with a "Best match" tag.', sel: '#lang-card' },
      { t: 'Check who is online', d: 'Doctors with a green "Online" badge can take your request now. Use the switch above the cards to show only doctors who speak your language.', sel: '#doctor-grid' },
      { t: 'Press "Request consult"', d: 'This sends your request. If the doctor is in another call, the button says "Join queue" instead. It is grey when the doctor is offline.', sel: '#doctor-grid [data-doc]:not([disabled])' },
      { t: 'Or book a time with "Book a slot"', d: 'Choose a day, pick a time, add a reason if you like, then press the green book button. The room opens 10 minutes before your slot.', sel: '#doctor-grid [data-slots]' },
      { t: 'Wait for the doctor', d: 'A yellow box counts down 2 minutes after a request. If you joined a queue, a dark strip at the top shows your number. Keep this page open.', sel: '#banner' },
      { t: 'Press "Join now" or "Join call"', d: 'When your turn comes the strip turns green with a Join now button. For accepted requests, press Join call in the green box.', sel: '#banner .btn, #tab-appts' },
      { t: 'Find old visits and documents', d: 'Open "My consultations" to join a booked visit, pay, or download a prescription or invoice.', sel: '#tab-appts' } ],
      problems: [['All doctors are offline', 'Doctors must press Go Online on their own screen. Try again in a minute, or book a slot for later.'],
        ['My request expired', 'Requests last 2 minutes. Press Request consult again.'],
        ['I missed my turn in the queue', 'Your turn lasts 2 minutes after the alert. Press Join queue again on the doctor card.']] }),
    doctor: () => ({ title: 'Doctor page', steps: [
      { t: 'Turn on "Go online"', d: 'Patients can only send you a request while this switch is on.', sel: '#online-switch' },
      { t: 'Wait for a request', d: 'New requests appear in this box instantly. You do not need to refresh.', sel: '#queue' },
      { t: 'Press "Accept"', d: 'This opens the private consultation room.', sel: '#queue [data-act="accept"]' },
      { t: 'Reopen a room later', d: 'If you left the room, press "Open room" in the list below.', sel: '#appts' } ],
      problems: [['Patient cannot see me online', 'Check the switch is on. Keep this page open; closing it marks you offline after a few seconds.']] }),
    consult: () => role === 'doctor'
      ? { title: 'Consultation room (doctor)', steps: [
          { t: 'Check the patient\'s files', d: 'Open the Files tab on the right. Select a name to preview, or press Download.', sel: '#stab-files' },
          { t: 'Talk with the patient', d: 'The patient\'s video is the big tile. Use the Chat tab if the sound is poor.', sel: '#tile-remote' },
          { t: 'Look at the patient record', d: 'Open the Record tab and press Open. The patient is told that you opened it.', sel: '#stab-record' },
          { t: 'Fill in the prescription', d: 'Open the Prescription tab. Add each medicine with dose, how often, and days.', sel: '#stab-rx' },
          { t: 'Press \"Save prescription\"', d: 'The patient gets the signed PDF only after payment.', sel: '#stab-rx' },
          { t: 'Press the red \"End call\" button', d: 'It is at the right end of the buttons under the video. This sends the patient to payment. Your prescription is saved first.', sel: '#btn-end' } ],
        problems: [['I cannot see the patient', 'Press the sliders button (bottom left of the video) to open Call settings and read the connection check. If it says the devices cannot connect, the TURN relay in the .env file must be set, then restart the server.'],
          ['No sound', 'Press the lock icon in the address bar and allow the microphone. Use headphones to avoid echo. The sound bars in Call settings show who has a problem.']] }
      : { title: 'Consultation room (patient)', steps: [
          { t: 'Allow camera and microphone', d: 'When the browser asks, press Allow. If you blocked it, press the lock icon in the address bar and allow both, then reload.', sel: '#btn-settings' },
          { t: 'Wait for your doctor', d: 'The doctor\'s video appears in the large tile when they join.', sel: '#tile-remote' },
          { t: 'Share your reports', d: 'Open the Files tab on the right and press \"Add a file\" to upload an X-ray, a photo, or a report. The doctor can open it right away.', sel: '#stab-files' },
          { t: 'Type to your doctor', d: 'The Chat tab is private. It unlocks when both of you are in the room. A red number on the tab means you have unread messages.', sel: '#stab-chat' },
          { t: 'Want to read what is being said?', d: 'Open the Captions tab, choose the language you speak in Call settings, and press \"Start my live captions\". Your words appear for the other person as you talk.', sel: '#stab-captions' },
          { t: 'See everything that was said', d: 'Press the captions button under the video, or \"Open captions panel\" in the Captions tab. The list stays there after captions fade.', sel: '#btn-dock-cap' },
          { t: 'Wait for the doctor to end the call', d: 'You will move to the payment page on your own.' } ],
        problems: [['I cannot see the doctor\'s face', 'Press the sliders button under the video to open Call settings and read the connection check. Ask the doctor to allow the camera. If you are on different networks, the TURN relay must be set on the server.'],
          ['The upload failed', 'Use JPG, PNG, PDF, DOC or TXT under 10 MB. Photos from a phone are fine.']] },
    payment: () => ({ title: 'Payment', steps: [
      { t: 'Check the amount', d: 'The summary shows the doctor and the fee.', sel: '#content' },
      { t: 'Choose Card or UPI', d: 'Use the two tabs above the form.', sel: '#m-card' },
      { t: 'Use a test payment', d: 'This is test mode. Press "Use the success card" to fill the form for you.', sel: '#fill-ok' },
      { t: 'Press Pay', d: 'The server checks the payment, then creates your documents.', sel: '#pay-btn' },
      { t: 'Open your documents', d: 'After success, open the prescription and the invoice. They are two separate PDFs.', sel: '#dl-rx' } ],
      problems: [['My payment was declined', 'The card 4000 0000 0000 0002 is meant to fail. Use 4111 1111 1111 1111 to see a success.'],
        ['Nothing happens when I press Pay', 'Check the red message under the button. It says which field needs fixing.']] }),
    verify: () => ({ title: 'Signature check', steps: [
      { t: 'Read the result', d: 'A green "Valid" means the prescription has not been changed since it was signed.', sel: '#result' },
      { t: 'Check another prescription', d: 'Scan the QR code printed on the prescription PDF.' } ], problems: [] }),
    roadmap: () => ({ title: 'Roadmap', steps: [
      { t: 'Read the table', d: 'Each row is a feature. The columns show what the prototype does now and what the final version adds.', sel: '#steps-body' },
      { t: 'Go back to the demo', d: 'Press "Home" in the top menu.' } ], problems: [] })
  };
  const guide = (GUIDE[page] || (() => ({ title: 'Help', steps: [{ t: 'Use the top menu', d: 'Home takes you to the start. Your care or My patients is your main page.' }], problems: [] })))();

  const css = document.createElement('style');
  css.textContent = `
  .hlp-fab{position:fixed;left:18px;bottom:18px;z-index:60;height:44px;background:var(--lime-500,#8AEB4C);color:var(--on-lime,#001811);border:0;border-radius:999px;padding:0 1.1rem 0 .55rem;font-weight:800;font-size:.9rem;box-shadow:0 8px 22px rgba(0,24,17,.3);display:flex;align-items:center;gap:.55rem;transition:background .15s,transform .15s}
  .hlp-fab:hover{background:var(--lime-600,#6FD13A);transform:translateY(-1px)}
  .hlp-fab:focus-visible{outline:3px solid var(--link,#1B4A3B);outline-offset:2px}
  .hlp-fab i{font-style:normal;background:#11372C;color:#8AEB4C;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:.95rem;font-weight:800}
  .hlp-panel{position:fixed;left:18px;bottom:74px;z-index:60;width:min(390px,calc(100vw - 36px));max-height:min(620px,78vh);background:var(--surface,#fff);color:var(--ink,#0B1F18);border:1px solid var(--line,#DCE5DA);border-radius:24px;box-shadow:0 18px 50px rgba(0,24,17,.35);display:none;flex-direction:column;overflow:hidden}
  .hlp-panel.open{display:flex}
  .hlp-head{padding:1rem 1.15rem;background:#11372C;color:#fff}
  .hlp-head b{font-family:var(--font-display);font-size:1.1rem;color:#fff}
  .hlp-head p{font-size:.82rem;color:rgba(255,255,255,.78);margin-top:.15rem}
  .hlp-body{overflow-y:auto;padding:.5rem 1.15rem 1.1rem}
  .hlp-steps{list-style:none;counter-reset:s;display:grid;gap:.15rem;margin:.4rem 0 .6rem;padding:0}
  .hlp-steps li{counter-increment:s;display:grid;grid-template-columns:28px 1fr;gap:.2rem .7rem;padding:.65rem 0;border-bottom:1px solid var(--row-line,#ECF1EA)}
  .hlp-steps li::before{content:counter(s);grid-row:1 / span 3;width:26px;height:26px;border-radius:50%;background:#8AEB4C;color:#001811;font-size:.8rem;font-weight:800;display:grid;place-items:center}
  .hlp-steps b{font-size:.92rem}
  .hlp-steps p{font-size:.85rem;color:var(--ink-soft,#3D4F46)}
  .hlp-show{justify-self:start;margin-top:.15rem}
  .hlp-sub{font-size:.8rem;font-weight:700;color:var(--muted,#46574F);margin:.8rem 0 .2rem}
  .hlp-panel details{border-bottom:1px solid var(--row-line,#ECF1EA);padding:.45rem 0;font-size:.86rem}
  .hlp-panel summary{cursor:pointer;font-weight:600}
  .hlp-panel details p{color:var(--ink-soft,#3D4F46);margin-top:.25rem}
  .hlp-contact{background:var(--paper,#F3F6F1);border-radius:16px;padding:.75rem .9rem;font-size:.86rem;margin-top:.6rem}
  .hlp-sos{margin-top:.7rem;width:100%}
  .pc-spot{outline:4px solid #F0B35A !important;outline-offset:4px;border-radius:12px;animation:pcSpot 1s ease-in-out 4;position:relative;z-index:5}
  @keyframes pcSpot{0%,100%{outline-color:#F0B35A}50%{outline-color:#D93D45}}
  @media (prefers-reduced-motion:reduce){.pc-spot{animation:none}.hlp-fab{transition:none}}
  .hlp-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:70;background:#11372C;color:#fff;border:1px solid rgba(138,235,76,.4);border-radius:16px;padding:.65rem 1rem;font-size:.88rem;max-width:min(420px,90vw);box-shadow:0 10px 30px rgba(0,24,17,.35)}
  `;
  document.head.appendChild(css);

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const visible = (el) => el && el.getClientRects().length > 0;
  const find = (sel) => { if (!sel) return null; return [...document.querySelectorAll(sel)].find(visible) || null; };

  function toast(text) {
    const t = document.createElement('div'); t.className = 'hlp-toast'; t.setAttribute('role', 'status'); t.textContent = text;
    document.body.appendChild(t); setTimeout(() => t.remove(), 4500);
  }
  function showMe(sel, title) {
    const el = find(sel);
    if (window.innerWidth < 760) toggle(false);
    if (!el) return toast(`"${title}" is not on the screen yet. Finish the step before it, then press Show me again.`);
    document.querySelectorAll('.pc-spot').forEach((x) => x.classList.remove('pc-spot'));
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('pc-spot');
    setTimeout(() => el.classList.remove('pc-spot'), 4200);
  }

  const fab = document.createElement('button');
  fab.className = 'hlp-fab'; fab.id = 'hlp-fab'; fab.type = 'button'; fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'hlp-panel');
  fab.innerHTML = '<i aria-hidden="true">?</i>Need help?';
  const panel = document.createElement('aside');
  panel.className = 'hlp-panel'; panel.id = 'hlp-panel'; panel.setAttribute('aria-label', 'Help');
  panel.innerHTML = `<div class="hlp-head"><b>${esc(guide.title)}</b><p>Follow these steps in order. Press "Show me" and we will point to the button.</p></div>
    <div class="hlp-body">
      <ol class="hlp-steps">${guide.steps.map((s, i) => `<li><b>${esc(s.t)}</b><p>${esc(s.d)}</p>${s.sel ? `<button class="btn btn-ghost btn-sm hlp-show" data-i="${i}">Show me</button>` : ''}</li>`).join('')}</ol>
      ${guide.problems.length ? `<div class="hlp-sub">Common problems</div>${guide.problems.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}` : ''}
      <div class="hlp-contact"><b>Still stuck?</b><br>Email <a href="mailto:${esc(SUPPORT_EMAIL)}">${esc(SUPPORT_EMAIL)}</a>${SUPPORT_PHONE ? ` or call <a href="tel:${esc(SUPPORT_PHONE.replace(/\s/g, ''))}">${esc(SUPPORT_PHONE)}</a>` : ''}.<br>
        <span class="small muted">Mention the page name: ${esc(page)}.</span></div>
      <button class="btn btn-danger btn-sm hlp-sos" id="hlp-sos">Medical emergency? Open SOS</button>
    </div>`;
  document.body.appendChild(panel); document.body.appendChild(fab);

  function toggle(force) {
    const open = force == null ? !panel.classList.contains('open') : force;
    panel.classList.toggle('open', open); fab.setAttribute('aria-expanded', open);
  }
  fab.onclick = () => toggle();
  panel.querySelectorAll('.hlp-show').forEach((b) => (b.onclick = () => { const s = guide.steps[Number(b.dataset.i)]; showMe(s.sel, s.t); }));
  panel.querySelector('#hlp-sos').onclick = () => { toggle(false); if (window.PCSOS) PCSOS.open(); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
  document.addEventListener('click', (e) => { const o = e.target.closest('[data-open-help]'); if (o) { e.preventDefault(); toggle(true); fab.scrollIntoView({ block: 'nearest' }); } });

  window.PCSupport = { open: () => toggle(true), close: () => toggle(false) };
})();