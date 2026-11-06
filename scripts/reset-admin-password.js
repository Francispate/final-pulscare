// PASTE AS: scripts/reset-admin-password.js  (new file)
// Run:   node scripts/reset-admin-password.js
// Sets a new password for an EXISTING admin account. Only accounts with role "admin" can be changed here.
// You type the email and the new password in this window. The password is hidden and is saved only as a bcrypt hash.
require('dotenv').config();
const readline = require('readline');
const { Writable } = require('stream');
const bcrypt = require('bcryptjs');
const { supabase } = require('../server/supabase');

function ask(question, hidden) {
  return new Promise((resolve) => {
    let muted = false;
    const out = new Writable({ write(chunk, enc, cb) { if (!muted) process.stdout.write(chunk, enc); cb(); } });
    const rl = readline.createInterface({ input: process.stdin, output: out, terminal: true });
    rl.question(question, (answer) => { rl.close(); if (hidden) process.stdout.write('\n'); resolve(answer); });
    muted = !!hidden;
  });
}

(async () => {
  console.log('\nReset an admin password for Pulscare\n');
  const email = (await ask('Admin email: ')).trim().toLowerCase();
  const found = await supabase.from('users').select('id, role, full_name').eq('email', email).maybeSingle();
  if (found.error) { console.error('\nCould not reach Supabase: ' + found.error.message); process.exit(1); }
  if (!found.data) { console.error('\nNo account with that email.'); process.exit(1); }
  if (found.data.role !== 'admin') { console.error('\nThat account is not an admin, so it cannot be changed here.'); process.exit(1); }
  const pw = await ask('New password (at least 10 characters, hidden): ', true);
  if (pw.length < 10) { console.error('\nUse at least 10 characters.'); process.exit(1); }
  if (pw !== (await ask('Type it again (hidden): ', true))) { console.error('\nThe two passwords do not match. Nothing was changed.'); process.exit(1); }
  const upd = await supabase.from('users').update({ password_hash: bcrypt.hashSync(pw, 10) }).eq('id', found.data.id).eq('role', 'admin');
  if (upd.error) { console.error('\nCould not update: ' + upd.error.message); process.exit(1); }
  console.log(`\nPassword changed for ${found.data.full_name} (${found.data.id}). Log in at http://localhost:${process.env.PORT || 3000}/admin.html\n`);
  process.exit(0);
})();