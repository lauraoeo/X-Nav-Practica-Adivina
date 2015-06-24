$(document).ready(function() {

    var json_name ={"capitales":{"id": "capitales", "json":"capitales.json", "url": "/capitales"}, 
                    "monumentos":{"id": "monumentos","json":"monumentos.json", "url": "/monumentos"},
                    "edificios": {"id": "edificios","json": "edificios.json", "url" : "/edificios"}};

	puntuacion_total= 0;
	$("#puntos").html("PUNTUACIÓN : " + 	puntuacion_total);

    var juego; //0 capitales, 1 monumentos
    var interval;
    var photo_counter = 0;
    var count_features = 0;
    var data_json;
    var puntuacion = 0;
    var used_items= [];
    var numJuegos = 0;
    var marker;
    var click_popup= L.popup();   
    var first= true;
    var game_stopped= false;

    var map = L.map('map',{
	    center: [20, 5],
	    zoom: 2
    }).locate({setView: true, minZoom: 2, maxZoom: 2});

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

	game_type= '';//inicializamos el juego a vacío

	$("#city_button").click(function() {
		game_type= '/juegos/capitales.json';
				//alert("cambio game_type");

		document.getElementById("cities_style").style.background = "#D8D8D8"
		document.getElementById("monuments_style").style.background = "#FFFFFF"
		document.getElementById("buildings_style").style.background = "#FFFFFF"
	});
	$("#monuments_button").click(function() {
		game_type= '/juegos/monumentos.json';		
		//alert("cambio game_type");

		document.getElementById("cities_style").style.background = "#FFFFFF"
		document.getElementById("monuments_style").style.background = "#D8D8D8"
		document.getElementById("buildings_style").style.background = "#FFFFFF"
	});
	$("#building_button").click(function() {
		game_type= '/juegos/edificios.json';
		//alert("cambio game_type");
		document.getElementById("cities_style").style.background = "#FFFFFF"
		document.getElementById("monuments_style").style.background = "#FFFFFF"
		document.getElementById("buildings_style").style.background = "#D8D8D8"
	});

        
    if(first){//IniciLizamos el nivel de difilcultad a medio
		$('#difficulty3').prop('checked', false);
		$('#difficulty2').prop('checked',true);
		$('#difficulty1').prop('checked',false);
        difficulty_level= 2;  	
	}

	$('#difficulty3').change(function(){
		$('#difficulty3').prop('checked', true);
		$('#difficulty2').prop('checked',false);
		$('#difficulty1').prop('checked',false);
        difficulty_level= 3;  
	});
	$('#difficulty2').change(function(){
		$('#difficulty3').prop('checked', false);
		$('#difficulty2').prop('checked',true);
		$('#difficulty1').prop('checked',false);
        difficulty_level= 2;  
	});
	$('#difficulty1').change(function(){
		$('#difficulty3').prop('checked', false);
		$('#difficulty2').prop('checked',false);
		$('#difficulty1').prop('checked',true);
        difficulty_level= 1;  
	});

	$("#stop_button").click( function() {
		game_stopped = true;
		game_type = "";
		used_items = [];
		clearInterval(interval);
		photo_counter = 0;
		$("#images").empty();
		$("#puntos").html("PUNTUACIÓN: " + 	0);
		limpiarMapa();
		puntuacion_total = 0;
	});

	function readJSON(uu){
		console.log("readJSON " + uu);
		used_items =[];
		photo_counter = 0;
		$.getJSON(game_type).done(function(data){
	                                            data_json = data;  
	                                            nextFeature(data_json, 'readJSON');
	                                        })
	}

	function limpiarMapa(){
		if(click_popup!=undefined){
			map.removeLayer(click_popup);
		} 

        if(marker!=undefined){
        	map.removeLayer(marker);
        }
	}

	function onMapClick(e) {
		if(game_type == ""){
			alert("SELECCIONE JUEGO");
		}else{
			console.log(count_features);
			clearInterval(interval);
	        var lat = data_json.features[count_features].coordinates.lat;
	        var lng= data_json.features[count_features].coordinates.long;
	        var item_latlng = L.latLng(lat, lng);        
	        resultado= e.latlng.distanceTo(item_latlng);
			puntuacion_juego= resultado.toFixed(0)*(photo_counter + 1); 
			puntuacion_total= puntuacion_total + puntuacion_juego;
			limpiarMapa();
	    	click_popup
	        	.setLatLng(e.latlng)
	        	.setContent("Solución: "+ data_json.features[count_features].properties.name +"<br> Puntuación: " + puntuacion_juego + "<br> Distancia: " + resultado.toFixed(0))
	        	.openOn(map);

	        marker = L.marker([lat, lng]).addTo(map);
			$("#puntos").html("PUNTUACIÓN: " + puntuacion_total.toFixed(0));
			clearInterval(interval);
			console.log("llamo a fin desde onmapclick"); 

			if(used_items.length < 10){
	            document.getElementById("images").innerHTML = ""; 
            	nextFeature(data_json, "onMapClick"); 
        	}else{
	        	alert("¡Fin del juego!");
				used_items=[];
				clearInterval(interval);
				document.getElementById("puntos").innerHTML = "PUNTUACIÓN: 0"; 
				$("#images").empty();
				limpiarMapa();
        	}	    
    	}
    }

    function nextFeature(cities, str) { //Aqui pondriamos la variable game  
    	console.log("NextFeature: " + str);
    	clearInterval(interval);
        count_features= Math.floor(Math.random()*10);
            	console.log("cambio count_features antes de bucle: " + count_features);

        while($.inArray(count_features, used_items) >= 0){
        	count_features= Math.floor(Math.random()*10);
        	console.log("cambio count_features dentro de bucle: " + count_features);
        } 
        used_items.push(count_features);
        var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
        $.getJSON(flickerAPI, {
            tags: cities.features[count_features].properties.name,
            tagmode: "any",
            format: "json"
        })
        .done(function printer( data ){
        	console.log(cities.features[count_features].properties.name + " " + count_features);
        	photo_counter= 0;  
        	clearInterval(interval);
        	if(game_stopped){
                used_items=[];
				clearInterval(interval);
				document.getElementById("puntos").innerHTML = "PUNTUACIÓN: 0"; 
				$("#images").empty();
				limpiarMapa();
			}else{
				interval = setInterval(function(){
                                        	document.getElementById("images").innerHTML = "";
                                            $( "<img>" ).attr( "src", data.items[photo_counter].media.m).appendTo( "#images" ); 
                                            photo_counter++; 
                                            if(photo_counter == data.items.length){
                                            	clearInterval(interval);
                                            	console.log("llamo fin desde interval");
                                            	//alert("¡Fin del juego!");
												used_items=[];
												document.getElementById("puntos").innerHTML = "PUNTUACIÓN: 0"; 
												$("#images").empty();
												limpiarMapa();
												game_type = '';
                                            }
                                        
                                        }, 4000/difficulty_level);
			}
        });
    }

    function calculateDate() {
        var d = new Date();
        var hora = d.getHours();
        var minuto = d.getMinutes();
        var segundo = d.getSeconds();
        var month = d.getMonth()+1;
        var day = d.getDate();
        if (hora < 10) {hora = "0" + hora}
		if (minuto < 10) {minuto = "0" + minuto}
		if (segundo < 10) {segundo = "0" + segundo}
        var output = hora+ ":" +minuto+":"+segundo+"  "+ (day<10 ? '0' : '') + day +'/'+ (month<10 ? '0' : '') + month;
        return output;
	}

	/*function fin(finjuego){
        if(used_items.length < 10 && !finjuego){
            clearInterval(interval);
            document.getElementById("images").innerHTML = ""; 
            nextFeature(data_json); 
        }else{
        	alert("¡Fin del juego!");
			used_items=[];
			clearInterval(interval);
			document.getElementById("puntos").innerHTML = "PUNTUACIÓN: 0"; 
			$("#images").empty();
			limpiarMapa();
        }
    }*/

    $("#play_button").click(function() {
        map.on('click', onMapClick);
        game_stopped = false;
        if(game_type == ''){
        	//alert("Por favor, eliga un tipo de juego antes de jugar");
        }else{
        	readJSON("play button");
			var name = game_type.split(".")[0];
			var historyObject = {puntuacion: puntuacion_total, juego: game_type};
			history.pushState(historyObject, "nombrePrueba", "?" + name);
	    }    
    });


	$("#new_button").click(function() {
		game_stopped = true;   
		var name = game_type.split(".")[0];
		photo_counter = 0;
		var historyObject = {puntuacion: puntuacion_total, juego: game_type, nivel: difficulty_level};
		history.replaceState(historyObject, "nombrePrueba", "?"+name);
		used_items=[];
		$("#division_line").remove();
		$("#history_list").append('<li value='+numJuegos+'><a><span class=\"tab\">'+ name + ", fecha: " + calculateDate()+'</span></a></li>');
		numJuegos++;
		puntuacion_total = 0;
		game_type = "";
		clearInterval(interval);
		document.getElementById("puntos").innerHTML = "PUNTUACIÓN: 0"; 
		$("#images").empty();
		limpiarMapa();
	}); 

	

	window.onpopstate = function(event){
		if(event.state != null && game_stopped){
			clearInterval(interval);	
			game_stopped = false;
			puntuacion_total = parseFloat(JSON.stringify(event.state.puntuacion));
			$("#puntos").html("PUNTUACIÓN: " + puntuacion_total);
			game_type = (JSON.stringify(event.state.juego)).toString();
			var newStr = game_type.substring(0, game_type.length-1);
			newStr = newStr.substring(1, newStr.length);
			game_type = newStr;	
			if(game_type== '/juegos/capitales.json'){
				document.getElementById("cities_style").style.background = "#D8D8D8";
				document.getElementById("monuments_style").style.background = "#FFFFFF";
				document.getElementById("buildings_style").style.background = "#FFFFFF";
			}else if (game_type== '/juegos/monumentos.json'){
				document.getElementById("cities_style").style.background = "#FFFFFF";
				document.getElementById("monuments_style").style.background = "#D8D8D8";
				document.getElementById("buildings_style").style.background = "#FFFFFF";
			}else if(game_type== '/juegos/edificios.json'){
				document.getElementById("cities_style").style.background = "#FFFFFF";
				document.getElementById("monuments_style").style.background = "#FFFFFF";
				document.getElementById("buildings_style").style.background = "#D8D8D8";
			}
			difficulty_level = JSON.stringify(event.state.nivel);
			//alert(difficulty_level);
			clearInterval(interval);
			readJSON("onpopstate");
		}
	};

	$("#history_list").on('click', 'li', function (){
		game_stopped = true;
		var actualValue = $(this).attr("value");
		var size = $("#history_list li").length;
		var go = actualValue - numJuegos;
		numJuegos = actualValue;
		if(go != 0)
			history.go(go);
	});
});
