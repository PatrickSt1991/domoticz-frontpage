/*--------------------------------------------------*/
/*	Domoticz to HTML / JavaScript					*/
/*	Change domoticzIP, solarIDX to the value you 	*/
/*	wan't to show on your solar dashboard			*/
/*--------------------------------------------------*/
/*	################ PLEASE NOTICE ################	*/
/*	Line 109 contains the net price of electricity	*/
/*	################ PLEASE NOTICE ################	*/
/*--------------------------------------------------*/

var domoticzIP = '192.168.0.125:8080';
var solarIDX = '18';

var json_arr = [];
var orderedByMonths = [];
var SolarT = [];
var SolarR = [];
var pricePower = [];
var MonthArray = [];
var d = new Date()
year = d.getFullYear();
var color = Chart.helpers.color;
var MonthText = {'01':'Januari', '02':'Februari', '03':'Maart', '04':'April', '05':'Mei', '06':'Juni', '07':'Juli', '08':'Augustus', '09':'September', '10':'Oktober', '11':'November', '12':'December'};
var barChartData = {
	labels: MonthArray,
	datasets: [{
		type: 'bar',
		label: 'Stroom Afname (T1/T2)',
		backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
		borderColor: window.chartColors.red,
		borderWidth: 1,
		data: SolarT
	}, {
		type: 'bar',
		label: 'Stroom Teruggeleverd (R1/R2)',
		backgroundColor: color(window.chartColors.yellow).alpha(0.5).rgbString(),
		borderColor: window.chartColors.yellow,
		borderWidth: 1,
		data: SolarR
	}, {
		type: 'line',
		label: 'Euro\'s',
		backgroundColor: color(window.chartColors.green).alpha(0.5).rgbString(),
		borderColor: window.chartColors.green,
		borderWidth: 5,
		fill: false,
		xAxisID: 'power-time',
		yAxisID: 'power-amount',
		data: pricePower
	}]
};

function get_solarInfomation(){
	$.getJSON('http://' + domoticzIP + '/json.htm?type=graph&sensor=counter&range=year&idx=' + solarIDX, function(data){
		$.each(data.result,function(int,value){
			var yearValue = value.d
			var yearCheck = yearValue.split("-");
			if(yearCheck[0] == year)
			{
				json_arr.push({d: value.d, r1: value.r1, r2: value.r2, v: value.v, v2: value.v2});
			}
		})
			
		var orderedByMonths = _.groupBy(json_arr, function(element) {
			return element.d.substring(5,7);
		});
		
		processSolarInformation(orderedByMonths);
	});

}

function processSolarInformation(orderedByMonths){
	var monthsKey = Object.keys(orderedByMonths);
	
	for (var key=0; key<monthsKey.length; key++)
	{
		var maandenCheck = (monthsKey[key]); 
		var sumT1 = 0;
		var sumT2 = 0;
		var sumR1 = 0;
		var sumR2 = 0;
		
		MonthArray.push(MonthText[maandenCheck]);
		
		//Voor de stroom waardes
		for (var i=0; i<orderedByMonths[maandenCheck].length; i++)
		{
			sumT1 += +orderedByMonths[maandenCheck][i].v;   // T1 berekenen
			sumT2 += +orderedByMonths[maandenCheck][i].v2;  // T2 berekenen
			
			sumR1 += +orderedByMonths[maandenCheck][i].r1;  // R1 berekenen
			sumR2 += +orderedByMonths[maandenCheck][i].r2;  // R2 berekenen
		}
		
		var totalValueT = sumT1 + sumT2;
		var totalValueR = sumR1 + sumR2;
		
		var totalEarned = totalValueR - totalValueT;
		
		var totalValueT = totalValueT.toFixed(2);
		var totalValueR = totalValueR.toFixed(2);
	
		SolarT.push(totalValueT);
		SolarR.push(totalValueR);

		if(totalEarned > 0)
		{
			totalEarned = totalEarned * 0.07;
			totalEarned = totalEarned.toFixed(2);
			pricePower.push(totalEarned);
		} else {
			totalEarned = 0;
			pricePower.push(totalEarned);
		}
	}
	setChartView();
}

function setChartView() {
	var title_text = ('Zonnepanelen ' + year);
	var ctx = document.getElementById('canvas').getContext('2d');
	window.myBar = new Chart(ctx, {
		type: 'bar',
		data: barChartData,
		options: {
			responsive: true,
			legend: {
				position: 'top',
			},
			title: {
				display: true,
				text: title_text,
			},
			scales: {
			  xAxes: [{
				display: true,
				stacked: false,
			  }, {
				id: 'power-time',
				display: false,
				stacked: false,
				ticks: {
				  beginAtZero: true,
				  stepSize: 1,
				  suggestedMax: 125
				}
			  }],
			  yAxes: [{
				display: true,
				stacked: false,
				scaleLabel: {
				  display: true,
				  labelString: 'KwH'
				},
				ticks: {
				  beginAtZero: true,
				}
			  }, {
				id: 'power-amount',
				display: false,
				stacked: false,
				scaleLabel: {
				  display: false,
				  labelString: 'Euro\'s'
				},
				ticks: {
				  beginAtZero: true,
				}
			  }]
			},
			hover: {
				animationDuration: 0
			},
			animation: {
				duration: 1,
				onComplete: function () {
					var chartInstance = this.chart,
					ctx = chartInstance.ctx;
					ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
					ctx.fillStyle = 'rgb(0, 0, 0)';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'bottom';

					this.data.datasets.forEach(function (dataset, i) {
						var meta = chartInstance.controller.getDatasetMeta(i);
						meta.data.forEach(function (bar, index) {
							var data = dataset.data[index];                            
							ctx.fillText(data, bar._model.x, bar._model.y - 5);
						});
					});
				}
			}
		}
	});
};

window.onload = get_solarInfomation();