// PASTE AS: public/js/record.js  (replaces the old file)  S13 edit: timeline grouped by doctor (click a doctor box to see only that doctor). S13: new look for the medical record (chips, file rows, timeline). Only styles, markup and class names changed; the behaviour is unchanged.
// Day 10: the medical record view, shared by record.html (the patient, editable) and the consult room (the doctor, read-only).
//   PCRecord.mount(element, { patientId, editable, compact })   loads and shows the record; returns the data, or null if it could not be opened.
(function () {
  const esc = PC.esc;
  const css = document.createElement('style');
  css.textContent = `
  /* sections */
  .rec-sec{margin-bottom:1.1rem}
  .rec-sec.card{padding:1.35rem}
  .rec-flat{border-top:1px solid var(--line);padding-top:.9rem;margin-bottom:.9rem}
  .rec-h{display:flex;align-items:center;gap:.6rem;font-size:1.05rem;margin:0 0 .85rem}
  .rec-h .rec-hi{width:34px;height:34px;flex:none;border-radius:11px;display:grid;place-items:center;background:var(--green-800);color:var(--lime-500)}
  .rec-h .rec-hi svg{width:18px;height:18px}
  .rec-h .rec-count{margin-left:auto;min-width:26px;height:26px;padding:0 .5rem;border-radius:999px;display:grid;place-items:center;font-size:.78rem;font-weight:800;background:var(--wash-2);color:var(--ink-soft)}
  .rec-cols{display:grid;gap:1.1rem;grid-template-columns:1fr 1fr;align-items:start;margin-bottom:1.1rem}
  .rec-cols .rec-sec{margin-bottom:0}
  .rec-compact .rec-cols{grid-template-columns:1fr;gap:0;margin-bottom:0}
  .rec-compact .rec-cols .rec-sec{margin-bottom:.9rem}
  @media (max-width:700px){.rec-cols{grid-template-columns:1fr}.rec-sec.card{padding:1.1rem}}


  /* wide layout: Reports and Timeline sit side by side so the page fills its width */
  .rec-grid{display:grid;gap:1.1rem;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start}
  .rec-grid .rec-sec{margin-bottom:0}
  @media (max-width:900px){.rec-grid{grid-template-columns:1fr}.rec-grid .rec-sec{margin-bottom:0}}

  /* timeline step 1: one box per doctor. Step 2: that doctor's timeline */
  .tl-hint{font-size:.88rem;color:var(--muted);margin:0 0 .8rem}
  .dr-grid{display:grid;gap:.7rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
  .dr-box{display:flex;align-items:center;gap:.75rem;width:100%;text-align:left;font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:.85rem;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .15s}
  .dr-box:hover{border-color:var(--lime-600);box-shadow:var(--shadow-card);transform:translateY(-1px)}
  .dr-box:focus-visible{outline:3px solid var(--green-800);outline-offset:2px}
  .dr-av{width:44px;height:44px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--green-800);color:var(--lime-500);font-weight:800;font-size:.95rem}
  .dr-av.own{background:var(--wash-2);color:var(--ink-soft)}
  .dr-av.own svg{width:20px;height:20px}
  .dr-tx{flex:1;min-width:0}
  .dr-tx b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .dr-tx span{display:block;font-size:.8rem;color:var(--muted);line-height:1.4}
  .dr-go{width:18px;height:18px;flex:none;color:var(--muted)}
  .tl-head{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin:0 0 1rem}
  .tl-head .dr-tx{flex:1 1 140px}
  @media (max-width:520px){.dr-grid{grid-template-columns:1fr}}

  /* notices */
  .rec-alert{border-radius:14px;padding:.75rem 1rem;margin-bottom:1rem;background:var(--coral-wash);color:var(--err-text);border:1px solid rgba(217,61,69,.35);line-height:1.45}
  .rec-alert.calm{background:var(--wash-2);color:var(--ink-soft);border-color:var(--line)}
  .rec-note{border-radius:14px;padding:.7rem 1rem;margin-bottom:1rem;background:var(--lime-wash);color:var(--ok-text);font-size:.88rem;line-height:1.45}

  /* chips (allergies, conditions) */
  .rec-chips{display:flex;flex-wrap:wrap;gap:.45rem;margin:0 0 .9rem}
  .rec-chip{display:inline-flex;align-items:center;gap:.4rem;border-radius:999px;padding:.28rem .35rem .28rem .8rem;font-size:.86rem;font-weight:700;line-height:1.2;background:var(--amber-wash);color:var(--amber-text);border:1px solid transparent}
  .rec-chip.allergy{background:var(--coral-wash);color:var(--err-text)}
  .rec-chip.read{padding-right:.8rem}
  .rec-chip button{border:0;background:rgba(0,0,0,.1);color:inherit;width:22px;height:22px;padding:0;border-radius:50%;cursor:pointer;display:grid;place-items:center}
  .rec-chip button:hover{background:rgba(0,0,0,.2)}
  .rec-chip button svg{width:12px;height:12px}
  .rec-chip button:focus-visible{outline:2px solid currentColor;outline-offset:2px}
  .rec-empty{font-size:.88rem;color:var(--muted)}

  /* add forms */
  .rec-form{display:grid;gap:.5rem}
  .rec-form .rec-add{display:flex;gap:.5rem}
  .rec-form .rec-add input{flex:1;min-width:0}
  .rec-form .rec-add .btn{flex:none}
  .rec-form .rec-more{display:flex;gap:.5rem;flex-wrap:wrap}
  .rec-form .rec-more select{flex:0 1 140px}
  .rec-form .rec-more input{flex:1;min-width:120px}
  .rec-form input,.rec-form select{min-height:44px}
  .rec-foot{display:flex;gap:.5rem;align-items:flex-start;margin:-.3rem 0 1.1rem;font-size:.82rem;line-height:1.45;color:var(--muted)}
  .rec-foot svg{width:15px;height:15px;flex:none;margin-top:2px}

  /* reports */
  .rec-list{list-style:none;display:grid;gap:.6rem;margin:0 0 1rem;padding:0}
  .rec-file{display:flex;flex-wrap:wrap;align-items:center;gap:.7rem .9rem;border:1px solid var(--line);border-radius:16px;padding:.7rem .85rem;background:var(--surface)}
  .rec-fi{width:42px;height:42px;flex:none;border-radius:12px;display:grid;place-items:center;background:var(--green-800);color:var(--lime-500)}
  .rec-fi svg{width:20px;height:20px}
  .rec-fm{flex:1 1 180px;min-width:0}
  .rec-fm b{display:block;font-size:.95rem;word-break:break-word}
  .rec-fa{display:flex;gap:.4rem;flex-wrap:wrap}
  .rec-up{border:1.5px dashed var(--border-strong);border-radius:16px;padding:1rem;display:grid;gap:.6rem}
  .rec-up .rec-more{display:flex;gap:.5rem;flex-wrap:wrap}
  .rec-up .rec-more input{flex:1;min-width:140px}
  .rec-up .rec-hint{font-size:.8rem;color:var(--muted)}
  .rec-up input{min-height:44px}
  .rec-up .btn{justify-self:start}

  /* timeline: a vertical line with lime dots */
  .tl{list-style:none;position:relative;display:grid;gap:.8rem;margin:.2rem 0 0 .55rem;padding:0 0 0 1.5rem;border-left:2px solid var(--line)}
  .tl > li{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:.75rem .95rem}
  .tl > li::before{content:'';position:absolute;left:calc(-1.5rem - 8px);top:1rem;width:14px;height:14px;border-radius:50%;background:var(--lime-500);box-shadow:0 0 0 4px var(--surface),0 0 0 5px var(--lime-600)}
  .tl-top{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .6rem}
  .tl-tag{display:inline-block;font-size:.68rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;border-radius:999px;padding:.12rem .6rem;background:var(--wash-2);color:var(--ink-soft)}
  .t-prescription .tl-tag{background:var(--lime-wash);color:var(--ok-text)}
  .t-allergy .tl-tag{background:var(--coral-wash);color:var(--err-text)}
  .t-condition .tl-tag{background:var(--amber-wash);color:var(--amber-text)}
  .t-report .tl-tag{background:rgba(106,90,205,.14);color:#6A5ACD}
  .tl-meta{font-size:.8rem;color:var(--muted);margin-top:.2rem}
  .tl-detail{font-size:.88rem;margin-top:.3rem;color:var(--ink-soft);line-height:1.45}
  .tl ul{margin:.45rem 0 0;padding-left:1.1rem;list-style:disc;font-size:.86rem;color:var(--ink-soft)}
  .tl ul li{padding:.1rem 0}
  .tl-act{margin-top:.55rem}
  @media (max-width:520px){.tl{padding-left:1.25rem;margin-left:.45rem}.tl > li::before{left:calc(-1.25rem - 8px)}.rec-fa{width:100%}.rec-fa .btn{flex:1}}

  /* doctor view inside the dark consult room: explicit colours, so it never depends on the page theme */
  .rec-compact .rec-h .rec-count{background:rgba(255,255,255,.1);color:#D6E4DC}
  .rec-compact .rec-h .rec-hi{background:rgba(138,235,76,.14)}
  .rec-compact .rec-chip{background:rgba(240,179,90,.16);color:#F0B35A}
  .rec-compact .rec-chip.allergy{background:rgba(217,61,69,.2);color:#FFB3B8}
  .rec-compact .rec-alert{background:rgba(217,61,69,.16);color:#FFD3D6;border-color:rgba(217,61,69,.5)}
  .rec-compact .rec-alert.calm{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8);border-color:rgba(255,255,255,.12)}
  .rec-compact .rec-note{background:rgba(138,235,76,.1);color:#A5F078}
  .rec-compact .rec-file,.rec-compact .tl > li{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12)}
  .rec-compact .tl{border-left-color:rgba(255,255,255,.18)}
  .rec-compact .tl > li::before{box-shadow:0 0 0 4px #001811,0 0 0 5px var(--lime-600)}
  .rec-compact .tl-tag{background:rgba(255,255,255,.1);color:#D6E4DC}
  .rec-compact .t-prescription .tl-tag{background:rgba(138,235,76,.16);color:#A5F078}
  .rec-compact .t-allergy .tl-tag{background:rgba(217,61,69,.2);color:#FFB3B8}
  .rec-compact .t-condition .tl-tag{background:rgba(240,179,90,.16);color:#F0B35A}
  .rec-compact .t-report .tl-tag{background:rgba(160,150,235,.18);color:#C9C2FF}
  .rec-compact .tl-detail,.rec-compact .tl ul{color:#D6E4DC}
  .rec-compact .dr-grid{grid-template-columns:1fr}
  .rec-compact .dr-box{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:#fff}
  .rec-compact .dr-box:hover{border-color:var(--lime-500);box-shadow:none}
  .rec-compact .dr-box:focus-visible{outline-color:var(--lime-500)}
  .rec-compact .dr-av{background:rgba(138,235,76,.14)}
  .rec-compact .dr-av.own{background:rgba(255,255,255,.1);color:#D6E4DC}
  .rec-compact .dr-tx span,.rec-compact .tl-hint,.rec-compact .dr-go{color:rgba(255,255,255,.7)}
  .rec-compact .rec-grid{display:block}
  .rec-compact .rec-grid .rec-sec{margin-bottom:.9rem}
  `;
  document.head.appendChild(css);

  const date = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const size = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');
  const TAG = { consult: 'Consultation', prescription: 'Prescription', report: 'Report', allergy: 'Allergy', condition: 'Condition' };

  const load = (opts) => PC.api('GET', opts && opts.patientId ? '/records/patient/' + encodeURIComponent(opts.patientId) : '/records/me');

  // Opens a file with the login sent in a header (so the token never sits in the address bar). Falls back to a download if popups are blocked.
  async function openFile(url, name, download, say) {
    const w = download ? null : window.open('', '_blank');
    try {
      const res = await fetch(url + (download && url.includes('/records/') ? '?download=1' : ''), { headers: { Authorization: 'Bearer ' + PC.token } });
      if (!res.ok) { let m = 'Could not open the file.'; try { m = (await res.json()).error || m; } catch {} throw new Error(m); }
      const obj = URL.createObjectURL(await res.blob());
      if (download || !w) { const a = document.createElement('a'); a.href = obj; a.download = name || 'file'; document.body.appendChild(a); a.click(); a.remove(); }
      else w.location.href = obj;
      setTimeout(() => URL.revokeObjectURL(obj), 60000);
    } catch (e) { if (w) w.close(); say(e.message); }
  }

  function render(el, data, opts) {
    opts = opts || {};
    const editable = !!opts.editable;
    const ic = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
    const IC = {
      alert: ic('<path d="M12 3.5l9 15.5H3z"/><path d="M12 10v4M12 17h.01"/>'),
      heart: ic('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
      file: ic('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>'),
      clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
      lock: ic('<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
      x: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
      user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
      go: ic('<path d="M9 5l7 7-7 7"/>')
    };
    const wrap = (inner, title, icon, count) => {
      const h = `<h3 class="rec-h"><span class="rec-hi">${icon}</span><span>${title}</span>${count == null ? '' : `<span class="rec-count" aria-label="${count} items">${count}</span>`}</h3>`;
      return opts.compact ? `<section class="rec-sec rec-flat">${h}${inner}</section>` : `<section class="card rec-sec">${h}${inner}</section>`;
    };
    const { allergies, conditions } = data.profile;
    const chip = (x, kind) => `<span class="rec-chip ${kind} ${editable ? '' : 'read'}" title="${esc(x.note || '')}">${esc(x.name)}${x.severity ? ' · ' + esc(x.severity) : ''}${editable ? `<button data-act="del-hist" data-id="${esc(x.id)}" aria-label="Remove ${esc(x.name)}">${IC.x}</button>` : ''}</span>`;

    let html = '';
    if (!editable) {
      html += `<div class="rec-note">Read-only. You can see this record because of your consultation with ${esc(data.patient.name)}. Opening it is logged and the patient is told. Allergies and conditions are entered by the patient and are not verified.</div>`;
      html += allergies.length
        ? `<div class="rec-alert" role="alert"><b>Allergies:</b> ${allergies.map((a) => esc(a.name) + (a.severity ? ' (' + esc(a.severity) + ')' : '')).join(', ')}</div>`
        : '<div class="rec-alert calm">No allergies recorded by the patient.</div>';
    }

    const histForm = (kind) => `<div class="rec-form" data-kind="${kind}">
        <div class="rec-add"><input data-f="name" maxlength="80" placeholder="${kind === 'allergy' ? 'e.g. Penicillin' : 'e.g. Type 2 diabetes'}" aria-label="${kind} name"><button class="btn btn-primary btn-sm" data-act="add-hist" data-kind="${kind}" aria-label="Add ${kind}">Add</button></div>
        <div class="rec-more">${kind === 'allergy' ? `<select data-f="severity" aria-label="Severity"><option value="">Severity</option><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option></select>` : ''}
        <input data-f="note" maxlength="200" placeholder="Note (optional)" aria-label="Note"></div></div>`;
    const list = (arr, kind) => `<div class="rec-chips">${arr.length ? arr.map((x) => chip(x, kind)).join('') : '<span class="rec-empty">None added</span>'}</div>`;
    const profile = `<div class="rec-cols">
        ${wrap(list(allergies, 'allergy') + (editable ? histForm('allergy') : ''), 'Allergies', IC.alert, allergies.length)}
        ${wrap(list(conditions, 'condition') + (editable ? histForm('condition') : ''), 'Conditions', IC.heart, conditions.length)}
      </div>${editable ? `<p class="rec-foot">${IC.lock}<span>Only you can change this. Doctors you consult can read it, and you are told each time one opens it.</span></p>` : ''}`;
    html += profile;

    const reps = data.reports.length ? `<ul class="rec-list">${data.reports.map((r) => `<li class="rec-file"><span class="rec-fi">${IC.file}</span><div class="rec-fm"><b>${esc(r.title)}</b><div class="small muted">${esc(r.filename)} · ${size(r.size)}${r.reportDate ? ' · ' + esc(date(r.reportDate)) : ''}</div></div>
        <div class="rec-fa"><button class="btn btn-ghost btn-sm" data-act="open" data-url="${esc(r.url)}" data-name="${esc(r.filename)}">Open</button><button class="btn btn-ghost btn-sm" data-act="dl" data-url="${esc(r.url)}" data-name="${esc(r.filename)}">Download</button>${editable ? `<button class="btn btn-ghost btn-sm" data-act="del-rep" data-id="${esc(r.id)}">Remove</button>` : ''}</div></li>`).join('')}</ul>` : '<p class="rec-empty" style="margin-bottom:.9rem">No reports added.</p>';
    const upForm = editable ? `<div class="rec-form rec-up" id="rep-form">
        <input data-f="title" maxlength="80" placeholder="Report name, e.g. Blood test" aria-label="Report name">
        <div class="rec-more"><input type="date" data-f="date" aria-label="Report date" max="${new Date().toISOString().slice(0, 10)}" style="flex:0 1 170px"><input type="file" data-f="file" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.txt,.doc,.docx" aria-label="Report file"></div>
        <button class="btn btn-primary btn-sm" data-act="add-rep">Upload report</button><span class="rec-hint">JPG, PNG, PDF, DOC. Up to 10 MB.</span></div>` : '';
    const repsSec = wrap(reps + upForm, 'Reports', IC.file, data.reports.length);

    // Timeline: group by doctor. Entries with no doctor (the patient's own reports, allergies, conditions) go in one "own entries" box.
    const initials = (n) => (String(n || '').replace(/^dr\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('') || '?').toUpperCase();
    const gm = new Map();
    for (const t of data.timeline) {
      const k = t.doctorId || 'own';
      if (!gm.has(k)) gm.set(k, { key: k, name: '', dept: '', items: [], visits: 0, last: '' });
      const g = gm.get(k);
      g.items.push(t);
      if (t.doctorName && !g.name) g.name = t.doctorName;
      if (t.dept && !g.dept) g.dept = t.dept;
      if (t.type === 'consult') g.visits++;
      if (String(t.at) > g.last) g.last = String(t.at);
    }
    const groups = [...gm.values()].sort((x, y) => (x.key === 'own') - (y.key === 'own') || y.last.localeCompare(x.last));
    const doctorCount = groups.filter((g) => g.key !== 'own').length;
    const gName = (g) => g.key === 'own' ? (editable ? 'My own entries' : 'Added by the patient') : (g.name || 'A doctor');
    const gSub = (g) => g.key === 'own' ? 'Reports, allergies and conditions' : `${g.dept ? esc(g.dept) + ' · ' : ''}${g.visits} ${g.visits === 1 ? 'visit' : 'visits'} · last ${esc(date(g.last))}`;
    const gAv = (g) => `<span class="dr-av ${g.key === 'own' ? 'own' : ''}" aria-hidden="true">${g.key === 'own' ? IC.user : esc(initials(g.name))}</span>`;
    const entry = (t) => {
      const meds = t.medicines && t.medicines.length ? `<ul>${t.medicines.map((m) => `<li>${esc(m.medicine)}${m.dose ? ' ' + esc(m.dose) : ''}${m.frequency ? ', ' + esc(m.frequency) : ''}${m.days ? ' for ' + esc(m.days) + ' days' : ''}</li>`).join('')}</ul>` : '';
      const act = t.open ? `<div class="rec-fa tl-act"><button class="btn btn-ghost btn-sm" data-act="open" data-url="${esc(t.open.url)}" data-name="${esc(t.open.name)}">Open</button></div>` : '';
      return `<li class="t-${t.type}"><div class="tl-top"><span class="tl-tag">${TAG[t.type] || esc(t.type)}</span><b>${esc(t.title)}</b></div>
        <div class="tl-meta">${esc(date(t.at))}${t.sub ? ' · ' + esc(t.sub) : ''}</div>${t.detail ? `<div class="tl-detail">${esc(t.detail)}</div>` : ''}${meds}${act}</li>`;
    };
    const tlSec = wrap('<div id="tl-host"></div>', 'Timeline', IC.clock, doctorCount || null);
    html += opts.compact ? repsSec + tlSec : `<div class="rec-grid">${repsSec}${tlSec}</div>`;
    html += '<div class="msg" id="rec-msg" role="alert"></div>';

    el.className = (el.className || '').replace(/\brec-compact\b/g, '') + (opts.compact ? ' rec-compact' : '');
    el.innerHTML = html;

    const drawTimeline = () => {
      const host = el.querySelector('#tl-host'); if (!host) return;
      const g = groups.find((x) => x.key === el._tlSel);
      if (!g) {
        el._tlSel = null;
        host.innerHTML = groups.length
          ? `<p class="tl-hint">${editable ? 'Choose a doctor to see your visits, prescriptions and files with them.' : 'Choose a doctor to see this patient\'s visits, prescriptions and files with them.'}</p><div class="dr-grid">${groups.map((x) => `<button type="button" class="dr-box" data-act="tl-pick" data-k="${esc(x.key)}">${gAv(x)}<span class="dr-tx"><b>${esc(gName(x))}</b><span>${gSub(x)}</span></span><span class="dr-go">${IC.go}</span></button>`).join('')}</div>`
          : '<p class="rec-empty">Nothing here yet. Completed consultations, prescriptions and reports will appear on this timeline.</p>';
        return;
      }
      host.innerHTML = `<div class="tl-head"><button type="button" class="btn btn-ghost btn-sm" data-act="tl-back">All doctors</button>${gAv(g)}<span class="dr-tx"><b>${esc(gName(g))}</b><span>${gSub(g)}</span></span></div><ul class="tl">${g.items.map(entry).join('')}</ul>`;
    };
    drawTimeline();

    const say = (t, good) => { const m = el.querySelector('#rec-msg'); if (!m) return; m.className = 'msg ' + (good ? 'ok' : 'err'); m.textContent = t; };
    const reload = () => (opts.reload ? opts.reload() : null);
    el.onclick = async (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      try {
        if (act === 'open') return openFile(b.dataset.url, b.dataset.name, false, say);
        if (act === 'dl') return openFile(b.dataset.url, b.dataset.name, true, say);
        if (act === 'tl-pick' || act === 'tl-back') {
          el._tlSel = act === 'tl-pick' ? b.dataset.k : null;
          drawTimeline();
          const f = el.querySelector(act === 'tl-pick' ? '[data-act="tl-back"]' : '.dr-box'); if (f) f.focus();
          return;
        }
        if (!editable) return;
        if (act === 'del-hist') { await PC.api('DELETE', '/records/history/' + encodeURIComponent(b.dataset.id)); return reload(); }
        if (act === 'del-rep') { if (!confirm('Remove this report from your record?')) return; await PC.api('DELETE', '/records/reports/' + encodeURIComponent(b.dataset.id)); return reload(); }
        if (act === 'add-hist') {
          const f = b.closest('.rec-form'), v = (k) => { const x = f.querySelector(`[data-f="${k}"]`); return x ? x.value : ''; };
          if (v('name').trim().length < 2) { say('Type a name first.'); return; }
          b.disabled = true;
          await PC.api('POST', '/records/history', { kind: b.dataset.kind, name: v('name'), severity: v('severity'), note: v('note') });
          return reload();
        }
        if (act === 'add-rep') {
          const f = el.querySelector('#rep-form'), file = f.querySelector('[data-f="file"]').files[0];
          if (!file) { say('Choose a file first.'); return; }
          if (file.size > 10 * 1024 * 1024) { say('That file is over 10 MB.'); return; }
          b.disabled = true; say('Uploading...', true);
          const res = await fetch('/api/records/reports', { method: 'POST', body: file, headers: {
            Authorization: 'Bearer ' + PC.token, 'Content-Type': 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name),
            'X-Report-Title': encodeURIComponent(f.querySelector('[data-f="title"]').value.trim()), 'X-Report-Date': f.querySelector('[data-f="date"]').value } });
          if (res.status === 401) return PC.logout();
          if (!res.ok) { let m = 'Upload failed.'; try { m = (await res.json()).error || m; } catch {} b.disabled = false; say(m); return; }
          return reload();
        }
      } catch (err) { b.disabled = false; say(err.message); }
    };
  }

  async function mount(el, opts) {
    opts = opts || {};
    el.innerHTML = '<p class="muted small">Loading record...</p>';
    let data;
    try { data = await load(opts); }
    catch (e) { el.innerHTML = `<div class="rec-alert calm" role="alert">${esc(e.message)}</div>`; return null; }
    render(el, data, { ...opts, reload: () => mount(el, opts) });
    return data;
  }

  window.PCRecord = { load, render, mount };
})();