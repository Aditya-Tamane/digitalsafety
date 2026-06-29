/* ============================================================
   Digital Safety Console — configuration
   ------------------------------------------------------------
   This is the ONLY file you normally need to edit.
   Every device that opens the site loads this, so the presenter
   screen and the audience's phones all share the same session.

   Fill in the values, commit the change, and you're live.
   ============================================================ */

window.DSC_CONFIG = {

  /* 1) REAL-TIME DATABASE  (required for real phones)
     Paste your Firebase Realtime Database URL here.
     It looks like:  https://your-project-default-rtdb.firebaseio.com
     Leave it "" to run in single-computer demo mode.            */
  dbURL: "https://socialawarenesscyber-default-rtdb.firebaseio.com/",

  /* 2) PUBLIC PAGE ADDRESS  (optional)
     Leave "" — once the site is hosted, it fills in automatically.
     Only set this if the join QR ever shows the wrong address,
     e.g. while previewing locally:
       baseURL: "https://your-name.github.io/digital-safety/"     */
  baseURL: "",

  /* 3) WHATSAPP / SMS WEBHOOK  (optional — demo 2 only)
     A URL that accepts  { "to": "...", "text": "..." }  and sends
     a message (Twilio / Meta WhatsApp Cloud API / Make / Zapier).
     Leave "" for an on-screen-only reveal.                       */
  hook: "https://sms-sender.aditya-tamane1.workers.dev/"

};
