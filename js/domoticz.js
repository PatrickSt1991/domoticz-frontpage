/*--------------------------------------------------*/
/*	Domoticz to HTML / JavaScript					*/
/*	Change domoticzIP, roombaIDX and idx_array to	*/
/*	the values you wan't to show on your dashboard	*/
/*--------------------------------------------------*/
/*	################ PLEASE NOTICE ################	*/
/*	Line 55 contains IDX 66 used for AfvalWijzer.	*/
/*	The AfvalWijzer script for Domoticz is based on */
/*	https://github.com/jvanderzande/GarbageCalendar	*/
/*	I've changed the output i.o.t. get the icon		*/
/*	################ PLEASE NOTICE ################	*/
/*--------------------------------------------------*/

var domoticzIP = '192.168.0.125:8080';
var roombaIDX = '60';
var idx_array = ['35','44','43','1','66']; //All buttons from Domoticz but no Scenes, otherwise you get two times id 1, Scene is line 106

var m_names = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augusts", "September", "Oktober", "November", "December"];
var d_names = ["Zondag","Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

var d = new Date(),
	month = '' + d.getMonth(),
	show_month = '' + (d.getMonth() + 1),
	day = '' + d.getDate(),
	curr_day  = d.getDay();
	tomorrow_day = '' + (d.getDate() + 1),
	year = d.getFullYear();

var today = [day, show_month, year].join('-');
var tomorrow = [tomorrow_day, month, year].join('-');

if (day.length < 2) { day = '0' + day;}
if (tomorrow_day.length < 2) { tomorrow_day = '0' + tomorrow_day;}
if (show_month.length < 2) { show_month = '0' + show_month;}

var dateTime = year + "-" + show_month + "-" + day + " " + d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();


function getSwitchData(){
	for (let i = 0; i < idx_array.length; i++) {
		$.getJSON('http://' + domoticzIP + '/json.htm?type=devices&rid=' + idx_array[i], function (result) {

			var switchStatus = result.result[0].Status;
			var switchIDX = result.result[0].idx;
			var afvalData = result.result[0].Data;
			var afvalSolo = [];
			

			if (switchStatus === 'On')
			{
				$("#i_"+switchIDX).attr('style',  'color: #DECF3F');
				$("#btn_"+switchIDX).attr('style', 'background-color: #EFEFEF');
				$("#btn_"+switchIDX).attr('active', 'yes');
			}else{
				$("#i_"+switchIDX).attr('style', null);
				$("#btn_"+switchIDX).attr('style', null);
				$("#btn_"+switchIDX).attr('active', 'default');
			}
		
			if (switchIDX === '66')
			{
				var afvalDataSplit = afvalData.split("\r\n");
				afvalDataSplit.pop();
				
				for (let i = 0; i < 2; i++) 
				{
					var breakSolo = afvalDataSplit[i].split(": ");
					afvalSolo.push(breakSolo);
				}
				
				var afvalInteger = 0;
				for (let afvalInteger = 0; afvalInteger < 2; afvalInteger++) {
					if (today === afvalSolo[afvalInteger][0])
					{
						var showIcon = afvalSolo[afvalInteger][1];
						var node = document.createElement("LI");
						textnode = document.createElement("div");
						node.className = 'align-middle; list-group-item';	
						node.style='background-color: transparent; align-items: center;';
						textnode.style='align-items:center; height: 67px;';
						textnode.innerHTML = "<p id=\"dag\" style=\"float:left; transform: translateX(50%) translateY(50%);\">Vandaag: </p><img id=\"imgType\" style=\"float: right;\" src=\"images/" + showIcon + "_80.png\"><p id=\"type\" style=\"float: none; transform: translateY(50%);\">" + afvalSolo[afvalInteger][2] + "</p>";
						node.appendChild(textnode);
					
						document.getElementById("calendarEvents").appendChild(node);						
					}

					if (tomorrow === afvalSolo[afvalInteger][0]) 
					{
						var showIcon = afvalSolo[afvalInteger][1];
						var node = document.createElement("LI");
						textnode = document.createElement("div");
						node.className = 'align-middle; list-group-item';	
						node.style='background-color: transparent; align-items: center;';
						textnode.style='align-items:center; height: 67px;';
						textnode.innerHTML = "<p id=\"dag\" style=\"float:left; transform: translateX(50%) translateY(50%);\">Morgen: </p><img id=\"imgType\" style=\"float: right;\" src=\"images/" + showIcon + "_80.png\"><p id=\"type\" style=\"float: none; transform: translateY(50%);\">" + afvalSolo[afvalInteger][2] + "</p>";
						node.appendChild(textnode);
					
						document.getElementById("calendarEvents").appendChild(node);	
					}
				}
			}
		});
	}
}

function getSceneData(){

	$.getJSON('http://' + domoticzIP + '/json.htm?type=scenes', function(scenes) {
		
		var scenesIDX = scenes.result[0].idx;
		var scenesStatus = scenes.result[0].Status;
		
		if (scenesIDX == '1'){
			if (scenesStatus == 'On'){
				$("#i_light").attr('style',  'color: #DECF3F');
				$("#btn_light").attr('style', 'background-color: #EFEFEF');
				$("#btn_light").attr('active', 'yes');
			}else{
				$("#i_light").attr('style',  null);
				$("#btn_light").attr('style', null);
				$("#btn_light").attr('active', 'default');			
			}
		}
	});
}

function roombaVirtualWall(){
	$.getJSON('http://' + domoticzIP + '/json.htm?type=devices&rid=' + roombaIDX, function(result) {
		var wallUpdateTime = result.result[0].LastUpdate;	
		var date1 = new Date(wallUpdateTime);
		var date2 = new Date(dateTime);

		var diff = date2.getTime() - date1.getTime();

		var msec = diff;
		var hh = Math.floor(msec / 1000 / 60 / 60);
		msec -= hh * 1000 * 60 * 60;
		var mm = Math.floor(msec / 1000 / 60);
		msec -= mm * 1000 * 60;
		var ss = Math.floor(msec / 1000);
		msec -= ss * 1000;
		
		var timeDiff = (hh);
		
		if (timeDiff > 24)
		{
			$("#hidden_warning").attr('style', 'display: block;');
		}
		
	});
}

function getTimeDateTemp(){
	var showDate = (d_names[curr_day] + ", " + day + " " + m_names[month] + " " + year);
	
	$.getJSON('http://' + domoticzIP + '/json.htm?type=devices&filter=temp&used=true', function(scenes) {
		
		kamerTemp = scenes.result[1].Temp;
		
		$.getJSON('https://data.buienradar.nl/2.0/feed/json', function(scenes) {
			
			weatherDesc = scenes.actual.stationmeasurements[30].weatherdescription;
			weatherImg = scenes.actual.stationmeasurements[30].iconurl;
			
			$("#showDateWeather").html("<b>" + showDate + "<br/><img src=\"" + weatherImg + "\"> " + weatherDesc + " | Temperatuur: " + kamerTemp + "<span class=\"symbol\">°</span>C</b>");
			
			
			for (let foreCast = 0; foreCast < 5; foreCast++) {
				var d = new Date(scenes.forecast.fivedayforecast[foreCast].day);
				var dayName = d_names[d.getDay()];
				
				$("#forecastday0"+foreCast).html(dayName);
				$("#forecastweather0"+foreCast).html(scenes.forecast.fivedayforecast[foreCast].maxtemperatureMin + "<span class=\"symbol\">°C</span>  <img src=\"" + scenes.forecast.fivedayforecast[foreCast].iconurl + "\">");
			}
				
		});
	});
}

function ToggleSwitch(idx){
	$.ajax({ url: 'http://' + domoticzIP + '/json.htm?type=command&param=switchlight&idx=' + idx + '&switchcmd=Toggle' });
}

function ToggleScene(idx){
	$.ajax({ url: 'http://' + domoticzIP + '/json.htm?type=command&param=switchscene&idx=' + idx + '&switchcmd=Toggle' });
}