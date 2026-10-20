/**
 * Receives leads from callback-widget.js, appends a row to the active Google Sheet
 * and emails you instantly. Free: uses your own Google account quota (~100 emails/day on free Gmail).
 *
 * Setup: Sheet -> Extensions -> Apps Script -> paste this -> set NOTIFY_EMAIL ->
 * Deploy -> New deployment -> type "Web app" -> Execute as: Me -> Who has access: Anyone -> Deploy.
 * Copy the web app URL into the script tag's data-endpoint.
 */
var NOTIFY_EMAIL = "roberto@aceskimedia.com";
var SHEET_NAME = "Widget leads";
var HEADERS = ["Received", "Type", "Name", "Phone", "Email", "Call when", "Message", "Page", "Lang"];

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);

    // Stop spreadsheet formula injection from visitor-typed text.
    var safe = function (v) { v = String(v || ""); return /^[=+\-@]/.test(v) ? "'" + v : v; };
    sh.appendRow([new Date(), d.type, safe(d.name), safe(d.phone), safe(d.email), safe(d.when), safe(d.message), safe(d.page), d.lang]);

    var label = { now: "CALL ME NOW", later: "CALL ME LATER", msg: "MESSAGE" }[d.type] || "LEAD";
    var body = "Type: " + label + "\nName: " + d.name + "\nPhone: " + d.phone +
      (d.email ? "\nEmail: " + d.email : "") +
      (d.when ? "\nCall when: " + d.when : "") +
      (d.message ? "\n\nMessage:\n" + d.message : "") +
      "\n\nPage: " + d.page;
    MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: "[" + label + "] " + d.name + " " + d.phone, body: body });
  } catch (err) {
    // Never throw back to the visitor; check Executions in Apps Script if leads go missing.
  }
  return ContentService.createTextOutput("ok");
}
