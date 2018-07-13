
$( document ).ready((function() {
	var marketId = []; //returned from the API
	var allLatlng = []; //returned from the API
	var allMarkers = []; //returned from the API
	var marketName = []; //returned from the API
	var infowindow = null;
	var pos;
	var userCords;
	var tempMarkerHolder = [];

	//Start geolocation
	if (navigator.geolocation) {

	function error(err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
	}

	function success(pos){
		userCords = pos.coords;
	}

	// Get the user's current position
	navigator.geolocation.getCurrentPosition(success, error);

	} else {
		alert('Geolocation is not supported in your browser');
	}

	//map options
	var mapOptions = {
		zoom: 4,
		center: new google.maps.LatLng(37.09024, -100.712891),
		panControl: false,
		panControlOptions: {
			position: google.maps.ControlPosition.BOTTOM_LEFT
		},
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE,
			position: google.maps.ControlPosition.RIGHT_CENTER
		},
		scaleControl: false
	};

	//Adding infowindow option
	infowindow = new google.maps.InfoWindow({
		content: "holding..."
	});

	//Fire up Google maps and place inside the map-canvas div
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	//grab form data
    $('#chooseZip').submit(function() { // bind function to submit event of form

		//define and set variables
		var accessURL;

		accessURL = "http://localhost:3000/brewery/search?key=967e04421a98c9c66c4b38912d9e438e&lat=" + parseFloat(userCords.latitude) + "&lng=" + parseFloat(userCords.longitude);


			//Use the zip code and return all market ids in area.
			$.ajax({
			type: "GET",
			contentType: "application/json; charset=utf-8",
			url: accessURL,
			dataType: 'json',
			success: function (data) {

			 		$.each(data.data, function (i, val) {
			 		//covert values to floats, to play nice with .LatLng() below.
					var latitude = parseFloat(val['latitude']);
					var longitude = parseFloat(val['longitude']);

					//set the markers.
					myLatlng = new google.maps.LatLng(latitude, longitude);

					allMarkers = new google.maps.Marker({
						position: myLatlng,
						map: map,
						title: val.brewery['nameShortDisplay'],
						html:
							'<div class="markerPop">' +
							'<h1>' + val.brewery['nameShortDisplay']+ '</h1>' + //substring removes distance from title
							'<h3>' + val.brewery['website'] + '</h3>' +
							'<p>' + val.brewery['description'] + '</p>' +
							'</div>'
						});
					//console.log(allMarkers);
					//put all lat long in array
					allLatlng.push(myLatlng);

					//Put the breweries in an array
					tempMarkerHolder.push(allMarkers);

					google.maps.event.addListener(allMarkers, 'click', function () {
						infowindow.setContent(this.html);
						infowindow.open(map, this);
					});

				});//end .each

				//  Make an array of the LatLng's of the markers you want to show
				//  Create a new viewpoint bound
				var bounds = new google.maps.LatLngBounds ();
				//  Go through each...
				for (var i = 0, LtLgLen = allLatlng.length; i < LtLgLen; i++) {
				  //  And increase the bounds to take this point
				  bounds.extend (allLatlng[i]);
				}
				//  Fit these bounds to the map
				map.fitBounds (bounds);
		 	},
		 	error: function(xhr, status, error) {
			        console.log('Geo Error:' + error);
			    }
		 });

        return false; // important: prevent the form from submitting
    });
}));

$(function() {
	$( "#searchZip" ).click(function() {
		$("#searchZip").hide();
		$( ".zipSearch" ).show();
	});
});

$(function() {
	$("#aZipCode").click(function() {
		var allLatlng = []; //returned from the API
		var allMarkers = []; //returned from the API
		var infowindow = null;
		var tempMarkerHolder = [];

		//map options
		var mapOptions = {
			zoom: 4,
			center: new google.maps.LatLng(37.09024, -100.712891),
			panControl: false,
			panControlOptions: {
				position: google.maps.ControlPosition.BOTTOM_LEFT
			},
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.RIGHT_CENTER
			},
			scaleControl: false
		};

		//Adding infowindow option
		infowindow = new google.maps.InfoWindow({
			content: "holding..."
		});
		//Fire up Google maps and place inside the map-canvas div
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		$.ajax({
			type: "GET",
			contentType: "application/json; charset=utf-8",
			url: 'http://localhost:3000/search/zip?q=' + $("#textZip").val(),
			dataType: 'json',
			success: function (data) {
				accessURL = "http://localhost:3000/brewery/search?key=967e04421a98c9c66c4b38912d9e438e&lat=" + parseFloat(data.lat) + "&lng=" + parseFloat(data.lng);

				//Use the zip code and return all market ids in area.
			$.ajax({
					type: "GET",
					contentType: "application/json; charset=utf-8",
					url: accessURL,
					dataType: 'json',
					success: function (data) {
					 		$.each(data.data, function (i, val) {
					 		//covert values to floats, to play nice with .LatLng() below.
							var latitude = parseFloat(val['latitude']);
							var longitude = parseFloat(val['longitude']);
							//set the markers.
							myLatlng = new google.maps.LatLng(latitude, longitude);
							allMarkers = new google.maps.Marker({
								position: myLatlng,
								map: map,
								title: val.brewery['nameShortDisplay'],
								html:
									'<div class="markerPop">' +
									'<h1>' + val.brewery['nameShortDisplay']+ '</h1>' + //substring removes distance from title
									'<h3>' + val.brewery['website'] + '</h3>' +
									'<p>' + val.brewery['description'] + '</p>' +
									'</div>'
								});
							//put all lat long in array
							allLatlng.push(myLatlng);

							//Put the breweries in an array
							tempMarkerHolder.push(allMarkers);

							google.maps.event.addListener(allMarkers, 'click', function () {
							infowindow.setContent(this.html);
							infowindow.open(map, this);
						});

						});//end .each

						//console.log(allLatlng);
						//  Make an array of the LatLng's of the markers you want to show
						//  Create a new viewpoint bound
						var bounds = new google.maps.LatLngBounds ();
						//  Go through each...
						for (var i = 0, LtLgLen = allLatlng.length; i < LtLgLen; i++) {
						  //  And increase the bounds to take this point
						  bounds.extend (allLatlng[i]);
						}
						//  Fit these bounds to the map
						map.fitBounds (bounds);
				 	},
				 	error: function(xhr, status, error) {
					        console.log('Nested Error: ' + error);
					    }
				 });


				},
		 	error: function(xhr, status, error) {
			        console.log('Error: ' + error);
			    }
		 });

		return false;
	});
});
