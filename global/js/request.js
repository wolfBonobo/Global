        let mapProp;
        let map;
        let localizacion;
        let marker;
        let myLatLng;
        let usersId = [];
        var radar;

        myMap = function () {
        	mapProp = {
        		center: new google.maps.LatLng(50.83333333, 4.0),
        		zoom: 4,

        	};
        	map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
        }


        $(document).ready(function () {

        	//SIDEBAR 
        	$('#sidebarCollapse').on('click', function () {
        		$('#sidebar').toggleClass('active');
        	});
        	//Mostrar mapa y esconder graficos 
        	$("#showMap").on('click', function () {
        		$("#googleMap").show();
        	});
        	//Mostrar graficos y esconder mapa 
        	$("#showGrap").on('click', function () {
        		$("#googleMap").hide();
        		$("#chartContainer").show();
        	});


        	//PETICION GET QUE RECUPERA PAISES DE LA UE CON SU CODIGO
        	$.ajax({
        		url: "http://94.177.215.172:3000/countries",
        		type: "get",
        		success: function (result, status, xhr) {
        			result.forEach(function (ele, pos, arr) {
        				$(".countries").append("<option value='" + ele.id + "'>" + ele.name + " (" + ele.id + ")</option>");
        			})
        		}
        	})

        	//AUTOCOMPLETE: 
        	$(".target").keyup(function () {

        		if ($(this).val().length >= 2) {
        			var request = {
        				country: $(".countries").val(),
        				city: $(this).val(),
        			}

        			$.ajax({
        				url: "http://94.177.215.172:3000/checkCities",
        				method: "post",
        				data: request,
        				success: function (result, status, xhr) {
        					let cities = [];

        					result.forEach(function (ele, pos, arr) {
        						cities.push(ele.name);
        						console.log(ele.name);

        					})
        					$("#tags").autocomplete({
        						source: cities
        					});

        				}
        			})
        		}
        	});

        	//----------------------------------------------------------------------------------------------------

        	//COLOCA MARCADOR EN EL MAPA, O RADIO
        	$(".marker").click(function () {

        		let radius = parseInt($(".radius").val());

        		let request = {
        			city: $(".target").val()
        		}
        		$.ajax({
        			url: "http://94.177.215.172:3000/getLocation",
        			method: "post",
        			data: request,
        			success: function (result, status, xhr) {

        				myLatLng = {
        					lng: result[0].location.coordinates[0],
        					lat: result[0].location.coordinates[1]
        				};

        				if (isNaN(radius)) {
        					marker = new google.maps.Marker({
        						position: myLatLng,
        						title: result[0].name
        					});
        				} else {
        					marker = new google.maps.Circle({
        						center: myLatLng,
        						radius: radius,
        						strokeColor: "#0000FF",
        						strokeOpacity: 0.8,
        						strokeWeight: 2,
        						fillColor: "#0000FF",
        						fillOpacity: 0.4
        					});
        				}
        				radar = myLatLng;
        				map.panTo(myLatLng);
        				map.setZoom(10);
        				marker.setMap(map);

        			}
        		})
        	});

        	// PUNTOS DE CALOR
        	$(".heat").click(function () {
        		let heatmapData = [];
        		$.ajax({
        			url: "http://94.177.215.172:3000/heat",
        			type: "get",
        			success: function (result, status, xhr) {
        				result.forEach(function (ele, pos, arr) {
        					heatmapData.push(new google.maps.LatLng(ele.location.coordinates[1], ele.location.coordinates[0]))
        				})

        				//console.log(heatmapData);

        				var heatmap = new google.maps.visualization.HeatmapLayer({
        					data: heatmapData,
        					radius: 10,
        					opacity: 0.4,

        				});

        				heatmap.setMap(map);
        			}

        		})

        	})
        })