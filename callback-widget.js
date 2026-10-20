/*!
 * Callback Widget — free, self-hosted lead widget (call me now / call me later / message).
 * One <script> tag, no dependencies, no cookies, styles isolated in a Shadow DOM.
 *
 * Config is read from data-* attributes on the script tag:
 *   data-endpoint   (required) Google Apps Script web app URL that receives leads
 *   data-phone      phone number shown on the "Call us" button, e.g. +38978981139
 *   data-whatsapp   WhatsApp number, digits only, e.g. 38978981139 (optional)
 *   data-lang       en | mk            (default: en)
 *   data-color      brand colour       (default: #e8590c)
 *   data-name       business name shown in the header (default: "We")
 *   data-position   right | left       (default: right)
 *   data-hours      opening hours as "Mon-Fri 09:00-17:00" (default: none = always "now")
 *   data-tz         IANA timezone for hours (default: Europe/Skopje)
 */
(function () {
  "use strict";
  var script = document.currentScript;
  if (!script || window.__cbwLoaded) return;
  window.__cbwLoaded = true;

  var cfg = {
    endpoint: script.dataset.endpoint || "",
    phone: script.dataset.phone || "",
    whatsapp: (script.dataset.whatsapp || "").replace(/\D/g, ""),
    lang: script.dataset.lang || "en",
    color: script.dataset.color || "#e8590c",
    name: script.dataset.name || "",
    position: script.dataset.position === "left" ? "left" : "right",
    hours: script.dataset.hours || "",
    tz: script.dataset.tz || "Europe/Skopje"
  };

  var T = {
    en: {
      title: "How can we help?", sub: "Pick the way that suits you.",
      now: "Call me now", later: "Call me later", msg: "Message",
      name: "Your name", phone: "Your phone number", email: "Your email",
      message: "How can we help?", when: "When should we call?",
      send: "Request call", sendMsg: "Send message",
      okNow: "Thanks! We'll call you shortly. Keep your phone nearby.",
      okLater: "Done! We'll call you at the time you picked.",
      okMsg: "Message sent. We'll get back to you soon.",
      err: "Something went wrong. Please try again or call us.",
      bad: "Please enter your name and a valid phone number.",
      badMsg: "Please enter your name, email and a message.",
      closed: "We're closed right now. Pick a time and we'll call you when we open.",
      callUs: "Call us", wa: "WhatsApp", terms: "By sending you agree that we contact you about your request.",
      today: "Today", tomorrow: "Tomorrow", anytime: "As soon as possible", open: "Open chat widget", close: "Close"
    },
    mk: {
      title: "Како можеме да помогнеме?", sub: "Изберете што ви одговара.",
      now: "Повикајте ме сега", later: "Повикајте ме подоцна", msg: "Порака",
      name: "Вашето име", phone: "Ваш телефонски број", email: "Ваша е-пошта",
      message: "Како можеме да помогнеме?", when: "Кога да ве повикаме?",
      send: "Побарај повик", sendMsg: "Испрати порака",
      okNow: "Благодариме! Наскоро ќе ве повикаме. Држете го телефонот при рака.",
      okLater: "Готово! Ќе ве повикаме во избраното време.",
      okMsg: "Пораката е испратена. Наскоро ќе ви одговориме.",
      err: "Настана грешка. Обидете се повторно или јавете ни се.",
      bad: "Внесете име и валиден телефонски број.",
      badMsg: "Внесете име, е-пошта и порака.",
      closed: "Моментално сме затворени. Изберете време и ќе ве повикаме кога ќе отвориме.",
      callUs: "Јавете ни се", wa: "WhatsApp", terms: "Со испраќање се согласувате да ве контактираме за вашето барање.",
      today: "Денес", tomorrow: "Утре", anytime: "Што е можно поскоро", open: "Отвори", close: "Затвори"
    }
  };
  var L = T[cfg.lang] || T.en;

  // ---------- opening hours ----------
  var DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  function isOpen() {
    if (!cfg.hours) return true;
    var m = cfg.hours.toLowerCase().match(/^(\w{3})\s*-\s*(\w{3})\s+(\d\d):(\d\d)\s*-\s*(\d\d):(\d\d)$/);
    if (!m) return true;
    var parts;
    try {
      parts = new Intl.DateTimeFormat("en-US", { timeZone: cfg.tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    } catch (e) { return true; }
    var get = function (t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; };
    var day = DAYS.indexOf(get("weekday").toLowerCase().slice(0, 3));
    var mins = parseInt(get("hour"), 10) % 24 * 60 + parseInt(get("minute"), 10);
    var a = DAYS.indexOf(m[1]), b = DAYS.indexOf(m[2]);
    var inDays = a <= b ? (day >= a && day <= b) : (day >= a || day <= b);
    return inDays && mins >= (+m[3]) * 60 + (+m[4]) && mins < (+m[5]) * 60 + (+m[6]);
  }

  // ---------- DOM (shadow root keeps host-site CSS out) ----------
  var host = document.createElement("div");
  host.id = "cbw-host";
  var root = host.attachShadow({ mode: "open" });
  var side = cfg.position;
  root.innerHTML =
    '<style>' +
    ':host{all:initial}*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.fab{position:fixed;bottom:20px;' + side + ':20px;width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;background:' + cfg.color + ';color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;z-index:2147483646;transition:transform .15s}' +
    '.fab:hover{transform:scale(1.06)}.fab svg{width:28px;height:28px;fill:currentColor}' +
    '.panel{position:fixed;bottom:92px;' + side + ':20px;width:340px;max-width:calc(100vw - 24px);max-height:calc(100vh - 120px);overflow:auto;background:#fff;color:#1a1a1a;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.28);z-index:2147483647;display:none}' +
    '.panel.open{display:block;animation:in .18s ease-out}@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '.head{background:' + cfg.color + ';color:#fff;padding:16px 18px;border-radius:16px 16px 0 0}.head h3{margin:0;font-size:17px}.head p{margin:4px 0 0;font-size:13px;opacity:.92}' +
    '.tabs{display:flex;border-bottom:1px solid #eee}.tab{flex:1;padding:11px 4px;font-size:12.5px;font-weight:600;background:none;border:0;border-bottom:2px solid transparent;cursor:pointer;color:#666}' +
    '.tab[aria-selected=true]{color:' + cfg.color + ';border-bottom-color:' + cfg.color + '}' +
    '.body{padding:16px 18px 14px}label{display:block;font-size:12px;font-weight:600;margin:10px 0 4px;color:#444}' +
    'input,select,textarea{width:100%;padding:10px 11px;font-size:14px;border:1px solid #d6d6d6;border-radius:8px;background:#fff;color:#111}' +
    'input:focus,select:focus,textarea:focus{outline:2px solid ' + cfg.color + '33;border-color:' + cfg.color + '}textarea{min-height:76px;resize:vertical}' +
    '.go{width:100%;margin-top:14px;padding:12px;font-size:14.5px;font-weight:700;color:#fff;background:' + cfg.color + ';border:0;border-radius:9px;cursor:pointer}.go[disabled]{opacity:.6;cursor:default}' +
    '.note{font-size:11px;color:#888;margin:10px 0 0}.msg{margin:10px 0 0;font-size:13px;padding:9px 11px;border-radius:8px}.msg.err{background:#fdecea;color:#b3261e}.msg.ok{background:#e8f5e9;color:#1b5e20}' +
    '.closed{font-size:12.5px;background:#fff6e5;color:#8a5a00;padding:8px 10px;border-radius:8px;margin-bottom:6px}' +
    '.alt{display:flex;gap:8px;padding:0 18px 16px}.alt a{flex:1;text-align:center;padding:9px;font-size:13px;font-weight:600;text-decoration:none;border:1px solid #ddd;border-radius:8px;color:#333}' +
    '.hp{position:absolute;left:-9999px;opacity:0}.hide{display:none}' +
    '</style>' +
    '<button class="fab" aria-label="' + L.open + '"><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg></button>' +
    '<div class="panel" role="dialog" aria-label="' + L.title + '">' +
    '<div class="head"><h3>' + (cfg.name ? cfg.name + " — " : "") + L.title + '</h3><p>' + L.sub + '</p></div>' +
    '<div class="tabs" role="tablist"><button class="tab" role="tab" data-t="now">' + L.now + '</button><button class="tab" role="tab" data-t="later">' + L.later + '</button><button class="tab" role="tab" data-t="msg">' + L.msg + '</button></div>' +
    '<form class="body" novalidate>' +
    '<div class="closed hide"></div>' +
    '<label class="f-name">' + L.name + '</label><input class="f-name" name="name" autocomplete="name">' +
    '<label class="f-phone">' + L.phone + '</label><input class="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="+389 7X XXX XXX">' +
    '<label class="f-email hide">' + L.email + '</label><input class="f-email hide" name="email" type="email" autocomplete="email">' +
    '<label class="f-when hide">' + L.when + '</label><select class="f-when hide" name="when"></select>' +
    '<label class="f-message hide">' + L.message + '</label><textarea class="f-message hide" name="message"></textarea>' +
    '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<button class="go" type="submit"></button><div class="msg hide" role="status"></div><p class="note">' + L.terms + '</p>' +
    '</form><div class="alt"></div></div>';
  document.documentElement.appendChild(host);

  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var fab = $(".fab"), panel = $(".panel"), form = $(".body"), go = $(".go"), msg = $(".msg");
  var mode = "now";

  var alt = $(".alt");
  if (cfg.phone) alt.innerHTML += '<a href="tel:' + cfg.phone.replace(/[^\d+]/g, "") + '" data-cbw="call">' + L.callUs + "</a>";
  if (cfg.whatsapp) alt.innerHTML += '<a href="https://wa.me/' + cfg.whatsapp + '" target="_blank" rel="noopener" data-cbw="wa">' + L.wa + "</a>";
  if (!alt.innerHTML) alt.style.display = "none";

  function fillWhen() {
    var sel = $("select.f-when"), o = "";
    o += '<option value="asap">' + L.anytime + "</option>";
    for (var h = 9; h <= 17; h++) {
      var hh = (h < 10 ? "0" : "") + h + ":00";
      o += '<option value="today ' + hh + '">' + L.today + " " + hh + "</option>";
    }
    for (h = 9; h <= 17; h++) {
      hh = (h < 10 ? "0" : "") + h + ":00";
      o += '<option value="tomorrow ' + hh + '">' + L.tomorrow + " " + hh + "</option>";
    }
    sel.innerHTML = o;
  }
  fillWhen();

  function show(sel, on) { $$(sel).forEach(function (e) { e.classList.toggle("hide", !on); }); }
  function setMode(m) {
    mode = m;
    $$(".tab").forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.t === m)); });
    show(".f-phone", m !== "msg" || true);
    show(".f-email", m === "msg");
    show(".f-message", m === "msg");
    show(".f-when", m === "later");
    go.textContent = m === "msg" ? L.sendMsg : L.send;
    msg.className = "msg hide";
    var closed = $(".closed");
    var showClosed = m === "now" && !isOpen();
    closed.textContent = L.closed; closed.classList.toggle("hide", !showClosed);
  }
  $$(".tab").forEach(function (t) { t.addEventListener("click", function () { setMode(t.dataset.t); }); });

  function toggle(open) {
    panel.classList.toggle("open", open);
    if (open) {
      setMode(isOpen() ? "now" : "later");
      push("callback_widget_open", {});
    }
  }
  fab.addEventListener("click", function () { toggle(!panel.classList.contains("open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
  alt.addEventListener("click", function (e) { var a = e.target.closest("a"); if (a) push("callback_widget_" + a.dataset.cbw, {}); });

  function push(event, data) {
    try {
      window.dataLayer = window.dataLayer || [];
      var o = { event: event }; for (var k in data) o[k] = data[k];
      window.dataLayer.push(o);
    } catch (e) {}
  }
  function flash(text, ok) { msg.textContent = text; msg.className = "msg " + (ok ? "ok" : "err"); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = {}; new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    if (d.website) return;                                  // honeypot
    var phoneOk = /^\+?[\d\s().-]{7,20}$/.test(d.phone || "");
    if (mode === "msg") {
      if (!d.name || !/^\S+@\S+\.\S+$/.test(d.email || "") || !d.message) return flash(L.badMsg, false);
    } else if (!d.name || !phoneOk) return flash(L.bad, false);
    if (!cfg.endpoint) return flash(L.err, false);

    go.disabled = true;
    var payload = {
      type: mode, name: d.name, phone: d.phone || "", email: d.email || "", message: d.message || "",
      when: mode === "later" ? d.when : "", page: location.href, lang: cfg.lang,
      sentAt: new Date().toISOString()
    };
    // text/plain avoids a CORS preflight, which Apps Script web apps do not answer.
    fetch(cfg.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
      .then(function () {
        flash(mode === "now" ? L.okNow : mode === "later" ? L.okLater : L.okMsg, true);
        push("callback_widget_lead", { lead_type: mode });
        form.reset(); go.disabled = false;
      })
      .catch(function () { flash(L.err, false); go.disabled = false; });
  });
})();
