# Callback widget (free)

Floating button -> panel with **Call me now**, **Call me later**, **Message**, plus tap-to-call and WhatsApp buttons.
Leads land in a Google Sheet tab ("Widget leads") and in your inbox instantly. No paid services, no cookies, styles isolated (Shadow DOM).

What it is NOT: "Call me now" does not auto-dial the visitor (that needs paid telephony like Twilio). It emails you the number instantly so you call back yourself. No AI chat/receptionist.

## Setup (10 minutes)
1. **Receiver:** create a Google Sheet -> Extensions -> Apps Script -> paste `apps-script.gs`, set `NOTIFY_EMAIL` -> Deploy -> New deployment -> Web app -> Execute as *Me*, access *Anyone* -> copy the web app URL.
2. **Host the script:** put `callback-widget.js` somewhere public (GitHub repo + jsDelivr, or Vercel/Netlify/Cloudflare Pages).
3. **Add to the site** (Framer: Site Settings -> General -> Custom Code -> End of `<head>` or `<body>`):

```html
<script src="https://YOUR-HOST/callback-widget.js" defer
  data-endpoint="https://script.google.com/macros/s/XXXX/exec"
  data-phone="+38978981139"
  data-whatsapp="38978981139"
  data-lang="en"
  data-name="Aceski Media"
  data-hours="Mon-Fri 09:00-17:00"
  data-tz="Europe/Skopje"></script>
```
`data-lang` supports `en` and `mk`. `data-color` (default #0022FF), `data-color2` (gradient, default #110FDF) and `data-position="left"` are optional.
Note: the script reads its settings from its own tag, so add it as a plain script tag, not through a loader that strips attributes.

## Tracking
Pushes to `dataLayer`: `callback_widget_open`, `callback_widget_lead` (`lead_type` = now/later/msg), `callback_widget_call`, `callback_widget_wa`. Use them as Google Tag Manager / Google Ads conversion triggers.

## Test locally
`python3 -m http.server 8765` in this folder, open http://localhost:8765/demo.html
