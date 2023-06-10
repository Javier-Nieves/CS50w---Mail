document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => location.reload());
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent', "ok"));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive', "ok"));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Letter is clicked
  document.addEventListener('click', event => {
    const tar = event.target;
    let ClName = tar.className;
    // if letter is clicked
    // method like "in (str)" in Python
    if (ClName.includes("letter")) {
      // super method! You can search inside the choosen element
      const id = event.target.querySelector(".mailDiv").value;
      // change read status of the letter to True
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      });
      view_letter(id);
    }
    if (ClName === "archive-button") {
      // arc will be the ID of an email to archive
      const arc = event.target.parentElement.querySelector(".mailDiv").value;
      fetch(`/emails/${arc}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      });
    }
  });

  // By default, load the inbox
  load_mailbox('inbox', "ok");




function load_mailbox(mailbox, message) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#letter-view').style.display = 'none';
  
  // is there a message?
  //var mes = localStorage.getItem("message");
  //var er = localStorage.getItem("error");
  //console.log(mes);
  //console.log("56:", er);
  //console.log("57:", mes);
  // Show the mailbox name
  console.log("log:", mailbox);
  console.log("log:", message);
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  const messaging = document.createElement('div');
  
  if (message === "Email sent successfully") {
    messaging.innerHTML = `<div id="alert" class='alert-good'>Email sent successfully</div>`;
    document.querySelector('#emails-view').append(message);
    localStorage.clear();
  }
  else if (message != null) {
    messaging.innerHTML = `<div id="alert" class='alert-bad'>${message}</div>`;
    document.querySelector('#emails-view').append(message);
    localStorage.clear();
  }
    //for alerts to disappear
    setTimeout(function(){
      document.getElementById("alert").style.display = 'none';
    }, 4000);  // in 4 sec


// show emails
fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {
    // Print emails
    // console.log(emails);
    emails.forEach((item) => {
      show_mail(item , `${mailbox}`)
    });
});
}


function show_mail(item, box) {
    // adding a new element
      const element = document.createElement('div');
      //element.className = 'letter';
      if (box === 'inbox') {
          element.innerHTML = `<input type="hidden" class="mailDiv" value=${item['id']}> 
          ${item['timestamp'].slice(0,6)} &nbsp; ${item['sender']} : &nbsp; <b>${item['subject']}</b> ${item['body']}`;
          if (item['read']) {
            element.className = 'letter inbox-read';
          }
          else {
            element.className = 'letter inbox-unread';
          }
        }
      else if (box === 'sent') {
          element.innerHTML = `<input type="hidden" class="mailDiv" value=${item['id']}> ${item['timestamp'].slice(0,6)} &nbsp; To: ${item['recipients']} &nbsp; <b>${item['subject']}</b> ${item['body']}`;
          element.className = 'letter inbox-read';
      }
      else if (box === 'archive') {
        element.innerHTML = `<input type="hidden" class="mailDiv" value=${item['id']}> 
        ${item['timestamp'].slice(0,6)} &nbsp; ${item['sender']} : &nbsp; <b>${item['subject']}</b> ${item['body']}`;
        element.className = 'letter inbox-read';
    }
      document.querySelector('#emails-view').append(element);
    }

function view_letter(id) {
  const arc_button = document.querySelector('.archive')
  arc_button.innerHTML = '';
  const rep_button = document.querySelector('.reply')
  rep_button.innerHTML = '';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#letter-view').style.display = 'block';
  // show 1 specific email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    // display the letter
    document.querySelector('#letter-time').innerHTML = `<div class="text-display"> ${email.timestamp}</div>`;
    document.querySelector('#letter-adress').innerHTML = `<div class="text-display-cursive"> <b>${email.sender}</b> &#8594 <b>${email.recipients}</b> </div>`;
    document.querySelector('#letter-subject').innerHTML = `<div class="text-display">${email.subject}</div>`;
    document.querySelector('#letter-body').value = email.body;
    
    // Add some buttons
    // if the letter is from someone else
    if (email.sender != document.querySelector('h2').innerHTML) {
        // if the letter is in archive
        if (email.archived === true) {
          arc_button.innerHTML = '<input class="unarchive-button" type="submit" value="Un-\narchive">';
          // if letter is beeing unarchived
          arc_button.addEventListener('click', function() {
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
                  })
            });
            location.reload()
          });
        }
        else {
          arc_button.innerHTML = '<input class="archive-button" type="submit" value="Archive"> ';
          // if letter is beeing archived
          arc_button.addEventListener('click', function() {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
                })
          });
          location.reload()
        });
        }
        rep_button.innerHTML = '<input class="reply-button" type="submit" value="Reply">';
        // if user replies to the letter
        rep_button.addEventListener('click', function() {
            compose_email(id)
        });
      }
      // if there are no buttons - move letter's body left
      else {
        document.querySelector('#letter-body').style.marginLeft="-8vw";
      }
    });
  }



  function compose_email(id) {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#letter-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    document.querySelector('#compose-recipients').value = '';
    

    // it it's a reply - function is receiving letter's ID
    if (id != "[object PointerEvent]") {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        // check letter's subject for Re: start
        const log = email.subject.slice(0,3);
        console.log("reply")
        if (log != "Re:") {
          document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        }
        else {
          document.querySelector('#compose-subject').value = `${email.subject}`;
        }
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n "${email.body}"`;
        document.querySelector('#compose-recipients').value = email.sender;
    });
    }
  
    const send = document.querySelector('#send');
    send.addEventListener("click", function() {
    let sub = document.querySelector('#compose-subject').value;
    let bod = document.querySelector('#compose-body').value;
    let receive = document.querySelector('#compose-recipients').value;
      // send email
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: receive,
            subject: sub,
            body: bod,
        })
      })
      .then(response => response.json())
      .then(result => {
          console.log("error - ", result['error']);
          //localStorage.setItem('error', result['error']);
          load_mailbox(inbox, result['error']);
      });
      //console.log("251 error is: ", localStorage.getItem("error"))
      //if (localStorage.getItem("error") === null) {
        //console.log("here 456")
        // это костыль. почему-то не работает Return после сохранения записи о новом письме в Джанго.. вообще никак. Я устал, весь день с этим боролся
        //localStorage.setItem('message', 'Email sent successfully');
        //console.log("256 message is: ", localStorage.getItem("error"))
      //} 
  });
  
  
  }

});