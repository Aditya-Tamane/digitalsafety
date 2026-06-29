# Digital Safety — Live Audience Console

A scam-awareness workshop tool. You put a join code / QR on a screen, the
audience opens it on their **own phones**, and their clicks, numbers, votes
and passwords appear on your screen **in real time** — then you reveal,
together, exactly how easily it happened.

Five demos:

| # | Demo | What the room does | What lands on your screen |
|---|------|--------------------|---------------------------|
| 01 | **Would You Click?** | Taps a tempting "claim your reward" link | A live counter of who took the bait; you flip every phone to a warning |
| 02 | **Just Your Number** | Registers a phone number for a "voucher" | Numbers stream in (masked); reveal hits every phone (optional real WhatsApp/SMS) |
| 03 | **The Login Trap** | Types into a fake bank login | Each entry appears as a phishing operator would see it |
| 04 | **Vote the Room** | Votes Safe / Scam on a message | A live bar; you reveal the answer and red flags. 5 rounds, one score |
| 05 | **Crack the Room** | Types a sample password | A live leaderboard of crack-times, weakest on top |

---

## What's in this folder

| File | What it is | Do you edit it? |
|------|-----------|-----------------|
| `index.html` | The whole app (presenter + phone views in one file) | No |
| `config.js` | Your settings — database URL, etc. | **Yes — this is the one file you fill in** |
| `database.rules.json` | The Firebase database rules to paste in | No (you copy from it) |
| `twilio-worker.js` | Optional — only for Part C (real WhatsApp/SMS) | Only if sending real messages |
| `README.md` | This guide | No |

You can run the whole thing **for free**. There is nothing to install on your
computer — just a web browser.

---

## Part A · Put it online (get your public link)

This uses **GitHub Pages** — free static hosting.

1. Make a free account at **https://github.com** and click **New repository**.
2. Name it something like `digital-safety`, choose **Public**, click **Create**.
3. On the new repo page click **uploading an existing file**, then drag in all
   four files from this folder (`index.html`, `config.js`,
   `database.rules.json`, `README.md`). Click **Commit changes**.
4. Go to **Settings → Pages**. Under **Build and deployment → Source** pick
   **Deploy from a branch**, set branch to **main** and folder to **/ (root)**,
   then **Save**.
5. Wait about a minute, refresh, and GitHub shows your live link:

   ```
   https://YOUR-USERNAME.github.io/digital-safety/
   ```

Open that link on your laptop — that's the presenter console. (At this point
the demos run, but only as a single-computer preview. Part B switches on real
phones.)

> **No GitHub?** Drag `index.html` + `config.js` onto **https://app.netlify.com/drop**
> and you get an instant link instead. The Firebase steps below are identical.

---

## Part B · Switch on real phones (Firebase — free, ~3 minutes)

The audience's phones need a shared, real-time place to send their taps and
votes. A **Firebase Realtime Database** does this with no server and no cost.

1. Go to **https://console.firebase.google.com** and click **Add project**.
   Give it any name. You can **skip Google Analytics**. Click through to create.
2. In the left menu open **Build → Realtime Database**, then **Create Database**.
   - Pick the location nearest you.
   - Choose **Start in test mode**, then **Enable**.
3. At the top of the database page you'll see its URL — copy it. It looks like:

   ```
   https://your-project-default-rtdb.firebaseio.com
   ```
4. Open the **Rules** tab, replace what's there with the contents of
   `database.rules.json` (just read + write open), and click **Publish**:

   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
5. Back in your GitHub repo, click `config.js` → the pencil (**Edit**) → paste
   your URL into `dbURL`:

   ```js
   dbURL: "https://your-project-default-rtdb.firebaseio.com",
   ```
   Click **Commit changes**.

Done. Reload your public link — the top-right badge now reads **● LIVE** and
real phones will sync to your screen.

> **About those rules:** `read/write: true` means anyone with the database URL
> can read and write it. That's fine for a short, throwaway workshop database
> with no personal data stored. When you're finished, you can delete the
> Firebase project, or tighten the rules. (See *Locking it down* below.)

---

## Part C · (Optional) Real WhatsApp / SMS for demo 2

By default, demo 2 shows the "gotcha" on every phone — **no setup, and it's
plenty effective.** This part is only if you want a real **SMS** to land on each
phone the **instant the person submits their number** (a text from a stranger,
seconds after they type it in — a strong moment). A web page can't send texts on
its own, so you connect a messaging provider through a small webhook. WhatsApp is
possible too but heavier (see the note below); SMS is the simpler choice.

### Read this first — the real-world limits

Sending real messages to strangers is deliberately restricted, so be realistic
about what's possible:

- **WhatsApp** does **not** let you message arbitrary numbers. People must have
  messaged you first, or you must use a pre-approved template they opted into.
  The free **Twilio WhatsApp sandbox** works only if each person first sends a
  "join <phrase>" message to your sandbox number — which you could make step one
  of the demo, but it's friction.
- **SMS** can reach any number, but is regulated. A Twilio **trial** account can
  only text numbers you've **verified** in the console (great for a rehearsal,
  not a whole room). Texting **Indian** numbers in production also requires
  **DLT registration**; other countries have their own sender rules.

**Practical recommendation:** use the on-screen reveal for a live room. If you
want real messages, the dependable path is **SMS to a few verified numbers**
(e.g. a couple of volunteers) for impact, and explain that "at scale a scammer
just pays for a bulk gateway." Wire it up as below.

### What the app sends

The moment a person submits their number, that phone does one `POST` to your
`hook` URL (no waiting for the presenter). The body is plain text containing
JSON:

```
{ "to": "9876543210", "text": "the gotcha message" }
```

(`to` is exactly what the person typed; normalise it to full international
format on your side, e.g. prepend `+91`.)

### Option 1 — Cloudflare Worker + Twilio (copy-paste, reliable, free)

Use the included **`twilio-worker.js`**.

1. **Twilio** (https://www.twilio.com/try-twilio): sign up. From the Console
   note your **Account SID** and **Auth Token**. Get a phone number:
   - *SMS:* buy/grab an SMS-capable number → that's your `From` (e.g. `+1555…`).
   - *WhatsApp test:* Messaging → Try it out → WhatsApp sandbox; your `From` is
     `whatsapp:+14155238886` and each recipient must join the sandbox first.
   - On a trial, add the destination numbers under **Verified Caller IDs**.
2. **Cloudflare** (https://dash.cloudflare.com, free): **Workers & Pages →
   Create → Create Worker**. Replace the sample code with the contents of
   `twilio-worker.js`, then **Deploy**.
3. In the Worker’s **Settings → Variables**, add (mark the token as a Secret):
   - `TWILIO_SID` = your Account SID
   - `TWILIO_AUTH` = your Auth Token
   - `TWILIO_FROM` = your `From` (e.g. `+1555…` or `whatsapp:+14155238886`)
   - `CHANNEL` = `sms` or `whatsapp`
   - `COUNTRY` = your default country code digits, e.g. `91`
   - **Deploy** again so the variables take effect.
4. Copy the Worker URL (`https://your-worker.workers.dev`) into `config.js` →
   `hook`, commit. Test by running demo 2 with your own verified number.

### Option 2 — Make.com + Twilio (no code)

1. Make.com → **Create a scenario** → trigger **Webhooks ▸ Custom webhook** →
   **Add** → copy the URL.
2. Add a second module: **JSON ▸ Parse JSON**, input = the webhook body (the
   app sends JSON as text, so parse it). Define `to` and `text`.
3. Add **Twilio ▸ Send a Message** (or **WhatsApp**): **To** = `{{to}}` (prefix
   the country code), **Body** = `{{text}}`, **From** = your Twilio number.
4. Run once / set to **immediate**, turn the scenario **ON**, paste the webhook
   URL into `config.js` → `hook`, commit.

> Numbers show **masked** on your screen and are wiped on reset. Tell the room
> they'll see why it was a test — nothing is charged. Don't store real numbers
> beyond the session.

---

## Part D · Run a session (full runbook)

### The day before — 5-minute rehearsal

1. Open your public link on a computer. Top-right should read **● LIVE**
   (if it says **DEMO MODE**, revisit Part B — phones won't sync).
2. Tap **Would You Click?** A code + QR appear.
3. On your **own phone**, scan the QR (or open the link and type the code).
   You should see the bait screen.
4. Tap "claim" on your phone → the counter on the computer goes to **1**.
5. Hit **Reveal to all phones** → your phone flips to the warning. 
6. If that loop works, every demo works. Tap **⌂** to go home.

If you wired up Part C, also send yourself one real message from demo 2 using a
verified number.

### What each side needs

- **You (presenter):** the link open on a screen everyone can see (projector,
  TV, or screen-share on a call).
- **The audience:** any phone with a camera (for the QR) or a browser (to type
  the code) and internet. Nothing to install.

### Running it

For every demo the flow is the same:

1. **Tap the demo** on your screen. A fresh **4-letter code** and **QR** appear
   (a new code is created each time, so you can re-run cleanly).
2. **Say:** "Point your camera at this code, or open this link and type these
   four letters." Give them ~30 seconds.
3. **Watch the screen fill in** as people act — counter, numbers, logins, votes,
   or the leaderboard.
4. **Trigger the moment:** the red button — **Reveal to all phones** (01, 03),
   **Reveal on screen** (02), **Reveal answer** (04). Demo 05 needs no reveal.
5. **Freeze and explain.** Open **Notes** (top right) — each demo has a one-line
   "say this" for exactly this moment.
6. **Reset** (or just open the next demo) to clear the room.

Per-demo cues:

- **01 Would You Click?** — let the counter climb, *then* reveal. The point is
  how many tapped a stranger's link in a room about scams.
- **02 Just Your Number** — as people submit, a text hits each phone instantly
  (if SMS is connected) and the numbers stream in; then **Reveal on screen**.
  Point: a prize + a form is all it takes to harvest a number — and reach it.
- **03 The Login Trap** — say "use a **fake** name and password." Watch entries
  land, reveal. Point: a page that looks like your bank isn't your bank.
- **04 Vote the Room** — read the message aloud, let them vote, **Reveal
  answer**, then **Next round**. After round 5, **See the room score**.
- **05 Crack the Room** — say "type a **sample** password, never a real one."
  Point out the weakest on top, then build a long passphrase together and have
  someone add it — watch it jump to centuries.

### Navigation & housekeeping

- Keyboard: `←` / `→` move between demos, `Esc` returns home.
- Each demo reset wipes that session's data. To wipe everything afterwards, see
  *Locking it down* below (or just delete the Firebase project).
- The same code works for everyone in the room at once — there's no limit you
  need to manage for a normal workshop.

---


## Troubleshooting

**The QR scans to a search, or "nullsrcdoc…"**
You're looking at a preview with no real web address. Open the site from your
**hosted** link (Part A). The QR encodes whatever address the page is loaded
from.

**Badge says "DEMO MODE" / phones don't sync**
`dbURL` in `config.js` is empty or wrong. Re-check Part B step 5, and make sure
it's a **Realtime Database** URL (ends in `firebaseio.com`), not Firestore.

**Phones connect but nothing appears on screen**
Make sure you published the open **Rules** (Part B step 4). Without them
Firebase blocks the reads/writes.

**Changes to `config.js` didn't take effect**
GitHub Pages can take a minute to update. Hard-refresh the page
(Ctrl/Cmd + Shift + R).

---

## Locking it down (after your event)

The open rules are meant to be temporary. When you're done you can:

- **Delete the Firebase project** (simplest), or
- Set rules to deny everything: `{ "rules": { ".read": false, ".write": false } }`,
  then re-open them only when you next present.

Nothing sensitive is stored — sessions hold only a 4-letter code, masked
numbers, vote tallies, and masked password hints — but it's good hygiene.

---

## Privacy & safety notes

- Passwords (demo 3 and 5) are **never stored** — only a length and a masked
  hint reach the screen. Tell people to type fake details.
- Demo 2 stores numbers only to display them masked, and clears them on reset.
- Everything is a simulation. No real accounts, money, or links are involved.
