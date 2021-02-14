/*--------------------------------------------------*/
/*	Google Calendar to HTML / JavaScript			*/
/*--------------------------------------------------*/
/*	################ PLEASE NOTICE ################	*/
/*	 I use Node-Red to combine two iCal files, 		*/
/*	 personal calender and national hollidays		*/
/*	 to a json file named: calender.json (line 24)	*/
/*	################ PLEASE NOTICE ################	*/
/*--------------------------------------------------*/

var d = new Date(),
	month = '' + (d.getMonth() + 1),
	day = '' + d.getDate(),
	year = d.getFullYear();

if (month.length < 2) 
	month = '0' + month;
if (day.length < 2) 
	day = '0' + day;

var today = [day, month, year].join('-');

var request = new XMLHttpRequest();
request.open("GET", "../../domoticz/cal/calender.json", false);
request.overrideMimeType("application/json");
request.send(null);
var jsonData = JSON.parse(request.responseText);
var PlannerLength = jsonData.length;

if(PlannerLength >= 1) {
	for (var calenderInteger=0; calenderInteger<jsonData.length; calenderInteger++) {
		if(calenderInteger < 3) {
			var calendarEvent = jsonData[calenderInteger][0].event;
			var calendarDate = jsonData[calenderInteger][0].date;
			var node = document.createElement("LI");
			node.className = 'list-group-item';
			node.style.backgroundColor = 'transparent';
			var eventDate = calendarDate.substring(0,10);
			var niceEventDate = eventDate.replace(/\./g, '-');
			
			if(niceEventDate == today) {
				var showDay = "Vandaag";
			} else {
				var showDay = "Morgen";
			}
			
			var textnode = document.createTextNode(showDay + " " + calendarEvent);
			
			node.appendChild(textnode);
			document.getElementById("calendarEvents").appendChild(node);
		}
	}
}else{
	var node = document.createElement("LI");
	node.className = 'list-group-item';
	node.style.backgroundColor = 'transparent';
	node.innerHTML = "De kalender is leeg <span style='font-size:20px;'>&#128515;</span>";
	document.getElementById("calendarEvents").appendChild(node);
}