var listArr=new Array();
var listLat=new Array();
var listLng=new Array();
window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFileSystem, errorHandler);
var searchFail="failed";
var searchLat=0;
var searchLng=0;

function createNewItin()
{
	$("#newItin").show();
}

function hideItin()
{
	$("#newItin").hide();
}

function saveItin()
{
	$("#newItin").hide();
	$("#searchResults").hide();
	$("#finalList").show();	
	viewMap();
}

function onInitFileSystem(filesystem) {
	filesystem.root.getFile('treehouse.txt', { create: true, exclusive: true },
    function(fileEntry) {
      // Do something with your new file.
    }, errorHandler);
}

function errorHandler(error) {
}

function getSearchResults()
{	
	searchFail="succeeded";
	$('#myList').html('');
	var resSize=0;
	var searchString=$('#startingLoc').val();
	$.ajax({
    	url: 'https://api.foursquare.com/v2/venues/explore?near='+ searchString+'&client_id=SC3J3U1LVJBWBL4YCBNBZCDF4IZJONWDZBRMD0SLFWFNGKJD&client_secret=AJGNKI2LJTQJAPC3KT3UQGZIGKBKTRA5JBCFQFZSRIGCWT3Y&v=20120101',
    	dataType: 'json',
    	success: function( data ) {
	    	searchLat=data.response.geocode.center.lat;
	    	searchLng=data.response.geocode.center.lng;
	    	resSize=data.response.groups[0].items.length;
			$.each(data.response.groups[0].items, function(i,items){
				var recVenue=items.venue.name;
				var recVenueId=items.venue.id;
    			console.log("venue is"+ recVenueId);
    			var getPlaceInfo = "getPlaceInfo('"+recVenueId+"');";
    			var addPlaceToList = "addPlaceToList('"+recVenue+"', '"+recVenueId+"');";
    			$("#myList").append('<p>'+recVenue+'<input type="button" id="add'+recVenueId+'" class="add" name="input" value="Add" onClick="'+addPlaceToList+'"> <input type="button" id="moreInfo'+recVenueId+'" class="moreInfo" name="infoBut" value="More Information" onClick="'+getPlaceInfo+'"></p><div id="moreInfo'+recVenueId+'"></div> <hr/>');
    			$("#myList").attr("size",resSize);
	  		});
	    },
    	error: function( data ) {
	      alert( "ERROR:  " + data );
	      searchFail="failed";
    	}
    });
	$("#searchResults").show();
}


function getPlaceInfo(divName)
{
	if (searchFail=="failed") {
		alert( "ERROR");
	}
	else {
		$("#moreInfo"+divName+"").html('');
		$.getJSON('https://api.foursquare.com/v2/venues/'+ divName+'?oauth_token=JHPVGF1KAR2F5RBE0JDHKU0X0KOVGQGZKPFFJDNL3QIDMIH1&v=20131201',
		function(data) {
			var checkins=data.response.venue.stats.checkinsCount;
		    console.log("no of checkins is "+checkins);
		    var rating=data.response.venue.rating;
		    //get photos
		    $.each(data.response.venue.photos.groups[0].items, function(i,items){
		    	var pre=items.prefix;
		    	var suf=items.suffix;
		    	var imgurl=pre+'160x160'+suf;
		    	if (i<4)
		    		$("#moreInfo"+divName+"").append('<img src='+imgurl+'>');
		    });
		    //get tips
		    $.each(data.response.venue.tips.groups[0].items, function(i,items){
		    	if (i<4) {
		    		var tip=items.text;
		    		$("#moreInfo"+divName+"").append('<br>tip is   '+tip);
		    	}
		    });
		    $("#moreInfo"+divName+"").append('<br>time zone is '+data.response.venue.timeZone);
		    $("#moreInfo"+divName+"").append('<br>number of checkins is   '+checkins);
		}).error(function() { alert("error"); });
	}
}


function addPlaceToList(venueName, venueValue)
{
	$("#add"+venueValue+"").css("background-color", "green").attr("value","Added!");
	listArr.push(venueName);
	var uniqueArr=listArr.filter(function(itm,i,listArr){
    	return i==listArr.indexOf(itm);
	});
	$('#addedL').html('');
	$.each(uniqueArr, function( index, value ) {
		$("#addedL").append('<option value='+index+'>'+value+'</option>');
	});
	console.log("the selected is "+ venueName);
	$.getJSON('https://api.foursquare.com/v2/venues/'+ venueValue+'?oauth_token=JHPVGF1KAR2F5RBE0JDHKU0X0KOVGQGZKPFFJDNL3QIDMIH1&v=20131201',
    function(data) {
		listLat.push(data.response.venue.location.lat);
    	listLng.push(data.response.venue.location.lng);
    });
}

function viewMap()
{
	if (listArr.length==0)
		alert("Please add some place to the list");
	else {
	    console.log("inside dontaddPlaceToList");
		var lat=listLat[0];
		var lng=listLng[0];
		var map = L.mapbox.map('mapDisp', 'anirudha123.geib378g')
		var features = [];
    	/* Place marker for each venue. */
    	for (var i = 0; i < listLat.length; i++) {
        	/* Get marker's location */
        	//console.log('venues lat is '+ venues[i]['venue']['location']['lat'] + 'and longitude is '+ venues[i]['venue']['location']['lng']);
	        features.push({
	            type: 'Feature',
	            geometry: {
	                type: 'Point',
	                coordinates: [listLng[i],listLat[i]]
	            },
	            properties: {
	                'marker-color': '#000',
	                'marker-symbol': 'star-stroked',
	                title: [listArr[i]]
	            }
	        });
        	console.log('the feature is '+ features[i].properties.title);
    	}
		console.log(features);
		map.markerLayer.setGeoJSON({
	    	type: 'FeatureCollection',
	    	features: features
		});
		map.setView([lat, lng], 10);
		for (var i = 0; i < features.length; i++) {
		//console.log('the feature is '+ features[i].properties.title);
		}
	}
}