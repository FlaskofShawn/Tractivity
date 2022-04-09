import barchart from './barchart.js'
// Project 3 code
// **************** Header Section Start ********************
// log out redirects to the splash page
// const logoutBtn = document.getElementById("logout_btn")
// logoutBtn.addEventListener("click", ()=> {
//   window.location.href = "https://fitness-3-watchweb-d17bb08.ecs162instruct.repl.co/splash.html"
//   fetch
// });

// fetch the user profile info
fetch('/name')
.then(response => response.text())
.then(data => {
  document.getElementById("username").textContent = data;
});

// Project 2 code

// **************** Reminder Section Start ********************
// fetch /reminder once the website loads
const remindAct = document.getElementById("remindAct");
const remindActDate = document.getElementById("redmindActDate");
var autoAct;
var autoDate;
var status;
const remindBox = document.getElementById("reminderBox");
fetch("/reminder")
  .then(response => {
    status = response.status;
    return response.text();
  })
  .then(data => {
    if (status == 200) {
      remindBox.style.display = 'flex';
      let obj = JSON.parse(data);
      const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      remindAct.textContent = obj[0].activity;
      if (new Date().getDate() - 1 == new Date(obj[0].date).getDate()) {
        remindActDate.textContent = "yesterday";
      } else {
        remindActDate.textContent = weekday[new Date(obj[0].date).getDay()];
      }

      autoAct = obj[0].activity;
      const date = new Date(obj[0].date);
      autoDate = `${date.getFullYear()}-${Math.floor(date.getMonth()/11)}${date.getMonth() + 1}-${date.getDate()}`;

    } else {
      console.log("No Reminder!!!! ");
      // invalid request, or no reminder.     
      remindBox.style.display = 'none';
    }

  });



// complete the reminder activity
// hide the reminder activity if user click No
const noBtn = document.getElementById("noText");
noBtn.addEventListener('click', () => {
  remindBox.style.display = 'none';
})

// auto fill with form in past box
const yesBtn = document.getElementById("yesText");
yesBtn.addEventListener("click", () => {
    document.getElementById("pastbtn").style.display = "none";

    // autofill with the reminder activity
    document.getElementById("pastActivity").value = autoAct;
    document.getElementById("pastDate").value = autoDate;
    if (autoAct == "Walk" || autoAct == "Run" || autoAct == "Swim") {
      document.getElementById("workunitsPast").value = "Miles";
    } else {
      document.getElementById("workunitsPast").value = "Minutes";
    }

    pastForm.style.display = 'flex';
    pastFeedback.style.display = 'none'

    // disable units input
    document.getElementById("workunitsPast").disabled = true;

    // hide the reminder activity if user click No
    remindBox.style.display = 'none';
});

// **************** Reminder Section End ********************


// **************** Activity History Bar char ********************
const btn_view_progress = document.getElementById("viewProBtn")
btn_view_progress.addEventListener('click', view_progress_onclick);
barchart.init('chart-anchor', 500, 300);

// Query the weekly report for selected activity and end-week date
// date: select date in ms
// act: selected activity
function query_week_report(act, date) {
  // validate the selected date
  const today = new Date();
  const selectDate = new Date(date);

  if (today < selectDate) {
    alert("You have to pick a day before today.");
    console.log("You have to pick a day before today.");
    return;
  }

  var status;
  // fetch the activity history data with given selections
  console.log(`Checking the end date: ${new Date(date)}  ---- line 98 example.js`);

  fetch(`/week?date=${date}&activity=${act}`)
    .then(response => {
      status = response.status;
      return response.text();
    })
    .then(data => {
      // prechecking the date validation
      if (status == 200) {
        let obj = [];
        if (data != undefined) {
          obj = JSON.parse(data);
        } 
    
        // convert the past activities to the array object
        var weekActs = [
          {
            'date': 0,
            'value': 0.0,
          },
          {
            'date': 0,
            'value': 0.0,
          },
          {
            'date': 0,
            'value': 0.0,
          },
          {
            'date': 0,
            'value': 0.0,
          },
          {
            'date': 0,
            'value': 0.0,
          },
          {
            'date': 0,
            'value': 0.0,
          },
          {
            'date': 0,
            'value': 0.0,
          }];

          var i = 0;
          const size = obj.length;
          const selectDate = new Date(date);    // Create Date object for selecting day

          // forcing to delete the extra day receive from the server
          // Need to figure out why DB return the one extra day
          const day1 = new Date(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate() - 6);
          obj.forEach((item) => {
            if (new Date(item.date) < day1) {
              i++;
            }
          });
          
          // fill 7 days array with activity amount on each day.
          weekActs.forEach((item, index) => {
            item.date  = new Date(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate() - (6 - index));
            // only update value if they are on the same date.
           
            if (i < size && new Date(obj[i].date).getDate() == item.date.getDate()) {
              item.value = obj[i++].amount;
            }
            console.log(item.date);
          });
          console.log(weekActs);
          
          // send arr to Barchart.
          let yLabel = 'unset unit';
          const expr = act
          switch (expr) {
            case 'Walk':
              yLabel = 'Miles Walked';
              break;
            case 'Run':
              yLabel = 'Miles Run';
              break;
            case 'Swim':
              yLabel = 'Miles Swim';
              break;
            case 'Yoga':
              yLabel = 'Minutes of Yoga';
              break;
            case 'Soccer':
              yLabel = 'Minutes of Soccer';
              break;
            case 'Basketball':
              yLabel = 'Minutes of Basketball';
              break;
          }

          barchart.render(weekActs, yLabel, 'Day of the Week');


        } else {
          alert("The Date You Pick is Too Late. Try another date.");
          console.log("The Date You Pick is Too Late. Try another date.");
          // not rendering the page

        }
        
    })
    .catch(err => {
      console.log(err);
    }) 
}

// view_progress button pressed
function view_progress_onclick() {
  console.log("pressed View!!!!");
  var selectAct = undefined;         
  var selectDate = undefined;

  // empty activity and unselected date
  if (selectAct === undefined && selectDate === undefined) {
    var status = 200;
    // query the most recent entry from DB when activity is empty
    fetch("/recent")
      .then(response => {
        status = response.status;
        return response.text();
      })
      .then(data => { 
        if (status === 400) {
          query_week_report(undefined, new Date().getTime());
        } else {
          console.log("@@@@@@ check data:", data);
          const obj = JSON.parse(data);
          query_week_report(obj.activity, obj.date);    // call query funct to retrive weekly report
        }
        openOverlay();
      })
      .catch(err => {
        console.log(err);
      }) 
  }
}

// for week ending feature
const btn_go = document.getElementById("goBtn")
btn_go.addEventListener('click', go_btn_onclick);

function go_btn_onclick() {
  var selectAct = document.getElementById("view_activity_for").value;

  const selectedDate = document.getElementById("weekending").value.split("-");
  const selectDate = new Date(selectedDate[0],selectedDate[1] - 1,selectedDate[2]);

  // var selectDate = document.getElementById("weekending").value;
  
  
  console.log("selectAct is " + selectAct);
  console.log("selectDate is " + selectDate);
  
  // empty activity and unselected date
  if (selectAct === undefined && selectDate === undefined) {
    // query the most recent entry from DB when activity is empty
    // fetch("/recent")
    //   .then(response => response.text())
    //   .then(data => { 
    //     const obj = JSON.parse(data);
    //     query_week_report(obj.activity, obj.date);    // call query funct to retrive weekly report
    //   })
    //   .catch(err => {
    //     console.log(err);
    //   }) 
  } else {
    console.log("triger?")
    query_week_report(selectAct, selectDate.getTime());    // call query funct to retrive weekly report
  }

}
// ******************** End For Activity History View *******************



// **************** Overlay Settings Start ********************

const btn_close_ovelay = document.getElementById("overlay_close_btn");
btn_close_ovelay.addEventListener('click', closeOverlay);

function closeOverlay() {
  overlayDiv.style.display = 'none';
}

const overlayDiv = document.getElementById("overlay");
function openOverlay() {
  console.log("Test overlay");
  overlayDiv.style.display = 'flex';
}
// **************** Overlay Settings End ********************

// ---------------------------------------------------------------------------------------
// Stage 1: Show Welcome Page

// hide all the form boxes
const pastForm = document.getElementById("formPast");
pastForm.style.display = 'none';

const futureForm = document.getElementById("formFuture");
futureForm.style.display = 'none';

// hide all feedback sentences
var futureFeedback = document.getElementById("futureFeedback");
futureFeedback.style.display = 'none';

var pastFeedback = document.getElementById("pastFeedback");
pastFeedback.style.display = 'none';


// Stage 2: Add Activities

// **************** event for buttons *********************
const btn_past = document.querySelector('#pastbtn');
const btn_future = document.querySelector('#futurebtn');
const todayObj = new Date();
const monthDigit = Math.floor((todayObj.getMonth() + 1) / 10);
const todayString = `${todayObj.getFullYear()}-${monthDigit}${todayObj.getMonth() + 1}-${todayObj.getDate()}`;
console.log(todayString);

// press the button in past activity
btn_past.addEventListener('click', (e) => { 
    document.getElementById("pastbtn").style.display = "none";
    pastForm.style.display = 'flex';
    pastFeedback.style.display = 'none'

    // disable units input
    document.getElementById("workunitsPast").disabled = true;
    
    // display current date for default
    document.getElementById("pastDate").value = todayString;
})


// press the button in future activity
btn_future.addEventListener('click', (e) => {
    document.getElementById("futurebtn").style.display = "none";
    futureForm.style.display = 'flex';  
    futureFeedback.style.display = 'none';

    // display current date for default
    document.getElementById("futureDate").value = todayString;   
})
// ******************** End for Buttons ***********************

// Past activity Units setting
const filledAct = document.getElementById("pastActivity");
let pastAct = "Walk";
let workUnit = "Miles";
filledAct.addEventListener('change', (e)=> {    
    pastAct = document.getElementById("pastActivity").value;
    if (pastAct == "Walk" || pastAct == "Run" || pastAct == "Swim") {
        workUnit = "Miles";
    } else {
        workUnit = "Minutes";
    }
    document.getElementById("workunitsPast").value = workUnit;
})



// Stage 3: User Submit Form
const submitsPast = document.querySelector("#pastSubmit");
const submitFuture = document.getElementById("futureSubmit");

// press the submit for past activity
submitsPast.addEventListener('click', (e)=> {    
    // check if all boxes filled
    if (document.getElementById("pastDate").value == "" || 
        document.getElementById("workloadPast").value == "") {
            alert("Please fill all datas!!");
            return;    
    } 
    
    pastForm.style.display = 'none';

    // validate the input date
    // const actDate = document.getElementById("pastDate").value;
    const today = new Date();
    const selectedDate = document.getElementById("pastDate").value.split("-");
    const selectDay = new Date(selectedDate[0],selectedDate[1] - 1,selectedDate[2]);
    
    if (selectDay >= today) {
        alert("Wrong Selected Date!!! Pick a date again.");
        pastForm.style.display = 'flex';
    } else {
        // read the input and display feedback on the user's screen
        // pastAct and workUnit are defined above at Stage2
        document.getElementById("pastAct").textContent = document.getElementById("pastActivity").value;
        document.getElementById("actUnit").textContent = document.getElementById("workunitsPast").value;

        const actiAmount = document.getElementById("workloadPast").value;
        document.getElementById("actAmount").textContent = actiAmount;

        // send data to server by POST requrest
        let postData = {"date" : document.getElementById("pastDate").value,
                        "activity" : document.getElementById("pastActivity").value,
                        "workload" : actiAmount,
                        "units" : document.getElementById("workunitsPast").value};
        let postJson = JSON.stringify(postData);

        fetch("/store", {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: postJson })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
        });
    
        pastFeedback.style.display = 'block';
        btn_past.style.display = 'block';
    }
})

// press submit for future activity
submitFuture.addEventListener('click', (e)=> {
    // check if all boxes filled
    if (document.getElementById("futureDate").value == "") {
            alert("Please Select a Date!!");
            return;    
    } 

    futureForm.style.display = 'none';

    // validate the input date
    const today = new Date();
    const selectedDate = document.getElementById("futureDate").value.split("-");
    const selectDay = new Date(selectedDate[0],selectedDate[1] - 1,selectedDate[2]);

    if (selectDay <= today) {
        alert("Wrong selected date!!! Pick a date again.");
        futureForm.style.display = 'flex';
    } else {
        // read the input and display feedback on the user's screen
        const futureAct = document.getElementById("futureActivity").value;
        document.getElementById("futureAct").textContent = futureAct;
        document.getElementById("futureDay").textContent = `${selectedDate[1]}/${selectedDate[2]}/${selectedDate[0].slice(2)}` ;

        // send data to server by POST requrest
        let postData = {"date" : document.getElementById("futureDate").value,
                        "activity" : futureAct,
                        "workload" : -1}; // future activity has -1 preset value for workload
        let postJson = JSON.stringify(postData);

        fetch("/store", {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: postJson })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
        });
     
        futureFeedback.style.display = 'block';
        btn_future.style.display = 'block';
    }
})