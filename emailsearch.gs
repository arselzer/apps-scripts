/*
* Emailsearch: send an email labeled 'searchquery' to yourself,
* receive an email with the search results.
* (this can be done using filters)
*
* This was mainly done for fun and getting to know the API,
* but it is potentially quite useful when there is no access
* to a browser, but there is a way to send emails to oneself.
*
* The script uses a little trick for responding quite fast:
* It polls the inbox for new messages with the label, and
* triggers the response, invoking the Gmail search API, deleting
* the query message, and sending an email with the search response
* to the user.
* As the minimum time-based trigger interval is limited to 1 minute,
* The script will stay alive for one minute and poll in 1-second-intervals.
*/

function emailsearch(q) {
  var threads = GmailApp.search(q);

  var body = "";

  threads.forEach(function(thread) {
    var msgCount = thread.getMessageCount();

    body += thread.getFirstMessageSubject()
    + "\n" + '"' + thread.getLastMessageDate() + '"'
    + "\n" + msgCount + " " + (function() { if (msgCount > 1) return "messages"; else return "message"; })()
    + "\n\n";
  });

  GmailApp.sendEmail(Session.getEffectiveUser().getEmail(), "Results for " + q, body);
}

function lookForQueries() {
  var label = GmailApp.getUserLabelByName("searchquery");

  var threads = label.getThreads();

  threads.forEach(function(thread) {
    var message = thread.getMessages()[0]
    var query = message.getPlainBody();
    if (query.length < 340) {
      emailsearch(query);
      message.moveToTrash();
    }
  });

  if (false) emailsearch("q");
}

function main() {
  for (var i = 0; i < 60; i++) {
    Utilities.sleep(1000);
    lookForQueries();
  }
}
