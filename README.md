# Pulscare Tele-Health: prototype (runs on your laptop, data in Supabase)

## 1. Install (once per laptop)
1. Install **Node.js 22 LTS or 24** from https://nodejs.org (no Python needed).
2. Check: open a terminal and run `node -v` (should show v22.x.x or v24.x.x).
3. In the project folder, run `npm install`.

If you have an older copy: delete `node_modules` and `package-lock.json`, then run `npm install`. Do not run `npm audit fix --force`.

## 2. Set up Supabase (once)
1. Create a free project at https://supabase.com.
2. Open **SQL Editor** and run the files in the `supabase` folder **in number order**, `01_schema.sql` to `10_admin_role.sql`.
3. Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Supabase, Project Settings, API)
   - `JWT_SECRET`, at least 32 characters. Make one with:
     `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
4. Add the sample doctors and the demo patient: `node scripts/seed-supabase.js`
5. Create your admin account: `node scripts/create-admin.js` (you type the email and password).

Never share or upload `.env`. It holds your keys, and `.gitignore` keeps it out of GitHub.

## 3. Start
In a terminal, inside the project folder:

```
npm install
npm start
```

Open **Chrome** at **http://localhost:3000**

To restart automatically while you edit the code, use `npm run dev` instead.

## 4. Accounts
- Patient: `demo@pulscare.test` / `patient123` (or register a new patient)
- Doctors: pick any doctor in the dropdown on the login form / `doctor123`
- Admin: open **http://localhost:3000/admin.html** and log in with the account you made in step 2.5

**Forgot the admin password?** Run `node scripts/reset-admin-password.js` and type the admin email and a new password.
**Forgot a doctor's password?** Log in as admin, open **People**, and use **Change password** on the doctor's row.

## 5. Two people on one laptop
Use two browser windows (for example a normal window and an Incognito window, or two Chrome profiles).
Each window keeps its own login. Use headphones to avoid echo.

## 6. Two laptops
Camera, microphone and chat encryption need a secure origin.
- **Option A (same Wi-Fi):** on the second laptop open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`,
  add `http://<server-laptop-IP>:3000`, enable, relaunch Chrome, then open that address.
- **Option B (any network):** install ngrok, run `ngrok http 3000`, open the https URL on both laptops.

For video across different networks you can also add a TURN relay in `.env` (`TURN_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL`).

## 7. Reset data
- Uploaded files, prescriptions and invoices are kept in the `storage/` folder. Stop the app, delete `storage/`, and start again.
- Patients, appointments and everything else live in Supabase. To start clean, run the SQL files again in a new Supabase project, or delete the rows in the Supabase **Table Editor**.

## 8. Checks (optional)
The `scripts` folder has a check script for each build day, for example `node scripts/day11-check.js`. Start the server first, in another terminal.
