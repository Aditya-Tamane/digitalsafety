/* ============================================================
   twilio-worker.js  —  OPTIONAL (only for Part C: real messages)
   ------------------------------------------------------------
   A tiny Cloudflare Worker that receives  { "to": "...", "text": "..." }
   from demo 2 and sends it as an SMS or WhatsApp message via Twilio.

   It does NOT go in your GitHub repo. Paste it into a Cloudflare Worker
   (Workers & Pages → Create → Create Worker), then add these variables
   under the Worker's Settings → Variables (mark TWILIO_AUTH as a Secret):

     TWILIO_SID    your Twilio Account SID
     TWILIO_AUTH   your Twilio Auth Token        (Secret)
     TWILIO_FROM   your sender, e.g. +15551234567
                   or for WhatsApp: whatsapp:+14155238886
     CHANNEL       "sms"  or  "whatsapp"
     COUNTRY       default country code digits, e.g. "91" for India

   Deploy, copy the Worker URL, and put it in config.js → hook.
   ============================================================ */

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
    if (request.method !== "POST")    return cors(new Response("ok", { status: 200 }));

    let data;
    try { data = JSON.parse(await request.text()); }
    catch { return cors(new Response("bad body", { status: 400 })); }

    const text = data.text || "";
    let to = (data.to || "").replace(/[^\d+]/g, "");
    if (!to) return cors(new Response("missing 'to'", { status: 400 }));

    // Normalise to international format (E.164). Adjust COUNTRY as needed.
    if (!to.startsWith("+")) {
      const country = env.COUNTRY || "91";
      to = "+" + country + to.replace(/\D/g, "").slice(-10);
    }
    const toField = (env.CHANNEL === "whatsapp") ? "whatsapp:" + to : to;

    const body = new URLSearchParams();
    body.set("To", toField);
    body.set("From", env.TWILIO_FROM);
    body.set("Body", text);

    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(env.TWILIO_SID + ":" + env.TWILIO_AUTH),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      }
    );
    return cors(new Response(await resp.text(), { status: resp.status }));
  }
};

function cors(res) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
