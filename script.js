var listArr=new Array();
var listLat=new Array();
var listLng=new Array();
var searchFail="failed";
var searchLat=0;
var searchLng=0;
var listNames=[];
var uniqueArr;
var myListArr=[];
var removeList = new Array();
var removeTripName;
var currentMap;
var show = 0;

//displays the Create Itinerary area
function createNewItin()
{
	$("#newItin").show();
}

//
function trash()
{
	$(".add").attr("style","").attr("value", "Add");
	listArr.length = 0;
	uniqueArr.length = 0;
	$('#itinDestList').html('');
	listLat.length = 0;
	listLng.length = 0;
	myListArr.length = 0;
	location.reload();
}

//Returns the search results for the user's query
//Displays the results on the page
function getSearchResults()
{	
	//User did not enter name for Trip
	if($("#listName").val().length == 0 || $("#startingLoc").val().length == 0)
	{
		$("#error").show();
	}
	else {
		$("#error").hide();
		searchFail="succeeded";
		$('#myList').html('');
		var resSize=0;
		var searchString=$('#startingLoc').val();
		var venueString=$('#venueLoc').val();
		//Call Foursquare to return data about the different results
		$.ajax({
	    	url: 'https://api.foursquare.com/v2/venues/explore?near='+ searchString+'&query='+venueString+'&client_id=SC3J3U1LVJBWBL4YCBNBZCDF4IZJONWDZBRMD0SLFWFNGKJD&client_secret=AJGNKI2LJTQJAPC3KT3UQGZIGKBKTRA5JBCFQFZSRIGCWT3Y&v=20120101',
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
	    			var addPlaceToList = "addPlaceToList('"+recVenue.replace(/'/g, "\\'").replace(/"/g, "\\'")+"', '"+recVenueId+"');";
	    			$("#myList").append('<p>'+recVenue+'<input type="button" id="add'+recVenueId+'" class="add" name="input" value="Add" onClick="'+addPlaceToList+'"> <input type="button" id="moreInfobut'+recVenueId+'" class="moreInfo" name="infoBut" value="More Information" onClick="'+getPlaceInfo+'"></p><div class="moreInfoBox" id="moreInfo'+recVenueId+'"></div> <hr/>');
		  		});
		    },
		    //Could not find any locations
	    	error: function( data ) {
		      $("#myList").append('<p>Could not find any results for that location. Please enter another location and try again!</p>');
		      searchFail="failed";
	    	}
	    });
	$("#searchResults").show();
	}
}

//Allows user to View and Close the map
function viewCloseMap() {
	var view = $("#viewthisMap").attr('value');
	//Map currently closed
	if(view=="View Map")
	{
		//Map already initialized
		if(show == 1)
		{
			console.log("view");
			$("#mapDisp2").show();
			$("#viewthisMap").attr('value', 'Close Map');
		}
		//Map not yet initialized
		else {
			console.log("view2");
			viewMap2();
			updateMap();
			show = 1;
			$("#mapDisp2").show();
			$("#viewthisMap").attr('value', 'Close Map');
		}
	}
	//Map currently open
	else
	{
		console.log("close");
		$("#mapDisp2").hide();
		$("#viewthisMap").attr('value', 'View Map');
	}
}

//Displays additional information for each venue
function getPlaceInfo(divName)
{
	var buttonColor = $("#moreInfobut"+divName+"").css('background-color');
	if(buttonColor=="grey" || buttonColor == "rgb(128, 128, 128)")
	{
		$("#moreInfo"+divName+"").html('');
		$("#moreInfobut"+divName+"").attr("value", "More Information");
		$("#moreInfobut"+divName+"").css("background-color", "");
	}
	else
	{
		$("#moreInfo"+divName+"").html('');
		//Call to FourSquare to get information about location
		$.getJSON('https://api.foursquare.com/v2/venues/'+ divName+'?oauth_token=JHPVGF1KAR2F5RBE0JDHKU0X0KOVGQGZKPFFJDNL3QIDMIH1&v=20131201',
		function(data) {
			var checkins=data.response.venue.stats.checkinsCount;
		    //FourSquare URL
		    var canonicalURL=data.response.venue.canonicalUrl;
		    //If location has hours listed
		    var status = data.response.venue.hours;
		    if(typeof status === "undefined")
		    {
		    	status = "None listed";
		    }
		    else {
		    	status = data.response.venue.hours.status;
		    }
			//get photos
		    if(data.response.venue.photos.count > 0)
		    {
		    	$.each(data.response.venue.photos.groups[0].items, function(i,items){
		    	var pre=items.prefix;
		    	var suf=items.suffix;
		    	var imgurl=pre+'100x100'+suf;
		    	if (i<4)
		    		$("#moreInfo"+divName+"").append('<img src='+imgurl+' class="images">');
		    	});
		    }
		    else {
		    	$("#moreInfo"+divName+"").append('<em>No photos available.</em><br/>');
		    }
		    //Add logisitical information
			$("#moreInfo"+divName+"").append('<span class="info"><b>Hours Today: </b>'+status+'</span><br/>');
			$.each(data.response.venue.attributes.groups, function(i,groups){
		    	var name=groups.items[0].displayName;
		    	var value = groups.items[0].displayValue;
		    	if (i<3) {
		    		$("#moreInfo"+divName+"").append('<span class="info"><strong>'+name+': </strong>'+value+'</span><br/>');
		   		}
		    });
		    if(data.response.venue.tips.count > 0)
		    {
			    //get tips
			    $.each(data.response.venue.tips.groups[0].items, function(i,items){
			    	if (i<4) {
			    		var tip=items.text;
			    		$("#moreInfo"+divName+"").append('<br><span class="tips"><b>Customer Tip: </b><em>'+tip+'</em></span>');
			    	}
			    });
			}
			else {
			    	$("#moreInfo"+divName+"").append('<em>No tips available.</em>');
			    }
			//TimeZone/Check in info
			$("#moreInfo"+divName+"").append('<br><br>Time Zone: '+data.response.venue.timeZone);
			$("#moreInfo"+divName+"").append('<br>Check-Ins at this Location: '+checkins);
			$("#moreInfo"+divName+"").append('<br><a href="'+canonicalURL+'">Visit on FourSquare!</a>');
			}).error(function() { alert("error"); 
		});
		$("#moreInfobut"+divName+"").attr("value", "Less Information");
		$("#moreInfobut"+divName+"").css("background-color", "grey");
	}
}

//Adds venues marked as "Added" to list
function addPlaceToList(venueName, venueValue)
{
	$("#add"+venueValue+"").css("background-color", "green").attr("value","Added!");
	listArr.push(venueName);
	uniqueArr=listArr.filter(function(itm,i,listArr){
    	return i==listArr.indexOf(itm);
	});
	$('#addedL').html('');
	$('#itinDestList').html('');
	$.each(uniqueArr, function( index, value ) {
		var listName=$('#listName').val();
		var deleditfunc = "deleditfunc('"+listName+"', '"+value+"'); deleditfunc2('"+venueValue+"');"
		var getPlaceInfo = "getPlaceInfo('"+venueValue+"');";
		$("#itinDestList").append('<div id="itinList'+venueValue+'"><p>'+value+'<input type="button" id="moreInfobut'+venueValue+'" class="moreInfo" name="infoBut" value="More Information" onClick="'+getPlaceInfo+'"><button class="remove" id="remove'+venueValue+'" onclick="'+deleditfunc+'">X Remove</button></p><div class="moreInfoBox" id="moreInfo'+venueValue+'"></div><hr/></div>');
	});
	var temp1;
	var temp2;
	$.getJSON('https://api.foursquare.com/v2/venues/'+ venueValue+'?oauth_token=JHPVGF1KAR2F5RBE0JDHKU0X0KOVGQGZKPFFJDNL3QIDMIH1&v=20131201',
    function(data) {
		listLat.push(data.response.venue.location.lat);
    	listLng.push(data.response.venue.location.lng);
    	temp1=data.response.venue.location.lat;
    	temp2=data.response.venue.location.lat;
    });
    myListArr.push(
	{
		id:venueValue,
		name:venueName,
		lat: temp1,
		lng: temp2
	});
}

//Adds Places to be removed to a list
function removePlaceFromList(venueName, tripName, venueValue)
{
	$("#remove"+venueValue+"").css("background-color", "red").attr("value","Removed!");
	removeList.push(venueName);
	removeTripName = tripName;
}

//View/create map of locations directly after creating a new trip
function viewMap()
{
	if (listArr.length==0)
		alert("Please add some place to the list");
	else {
	    console.log("inside dontaddPlaceToList");
		var lat=listLat[0];
		var lng=listLng[0];
		console.log(lat+", "+lng);
		var map = L.mapbox.map('mapDisp', 'anirudha123.geib378g');
		var features = [];
    	/* Place marker for each venue. */
    	for (var i = 0; i < listLat.length; i++) {
        	/* Get marker's location */
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
    	}
		map.markerLayer.setGeoJSON({
	    	type: 'FeatureCollection',
	    	features: features
		});
		map.setView([lat, lng], 10);
	}
}

//View/create map of all locations currently in a trip
function viewMap2()
{
	var map;
	var lat=listLat[0];
	var lng=listLng[0];
	map = L.mapbox.map('mapDisp2', 'anirudha123.geib378g');
	var features = [];
    /* Place marker for each venue. */
    for (var i = 0; i < listLat.length; i++) {
        /* Get marker's location */
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
    }
	map.markerLayer.setGeoJSON({
	    type: 'FeatureCollection',
	    features: features
	});
	map.setView([lat, lng], 10);
	//sets currentMap to map for reference later
	currentMap = map;
	$("#mapDisp2").show();
}

//Recreates the map to reflect deleted/added locations
function updateMap()
{
	var view = $("viewthisMap").attr('value');
	currentMap.remove();
	viewMap2();
	if(view=="Close Map")
	{

	}
	else {

		$("#mapDisp2").hide();
	}
}

//Save the array listArr to local storage with listName captured below
function saveList()
{
	var listName=$('#listName').val();
	listNames.push(listName);
	store.set(listName,myListArr);
	$("#newItin").hide();
	$("#searchResults").hide();
	$("#finaListName").html('');
	$("#finaListName").append("<em>"+listName+"</em> Itinerary");
	$("#finalList").show();	
	viewMap();
}

//Displays list of all trips 
function displayAllListNames()
{
	var ctr=0;
	store.forEach(function(key,val) {
	    console.log(key);
	    var viewSelectedList = "viewSelectedList('"+key+"');";
	    $("#myTrips").append('<div id="tripDiv'+ctr+'"><input type="checkbox" id="'+ctr+'"><p style="display:inline;"><span>'+key+'</span><button class="edit" onclick="'+viewSelectedList+'">View/Edit</button></p><hr/>');
	    ctr++;
	});
}

var latArr=new Array();
var elementToBeEdited;

//Displays the List locations in a specific trip
function viewSelectedList(tripName)
{
	$("#viewEdit").hide();
	$("#thisTripDet").html('');
	$("#thisTripDet").append("<h1 id='thisTripName'><em>"+tripName+"</em> Itinerary</h1>");
	var result=store.get(tripName);
	for(i=0;i<result.length;i++)
	{
		console.log('inside for');
		var removePlaceFromList = "removePlaceFromList('"+result[i].name.replace(/'/g, "\\'")+"', '"+tripName.replace(/'/g, "\\'")+"', '"+result[i].id+"');"
		var getPlaceInfo = "getPlaceInfo('"+result[i].id+"');";
		$("#thisTripDet").append('<div id="tripItem'+result[i].id+'"><p>'+result[i].name+'<input type="button" id="moreInfobut'+result[i].id+'" class="moreInfo" name="infoBut" value="More Information" onClick="'+getPlaceInfo+'"><button class="remove" id="remove'+result[i].id+'" onclick="'+removePlaceFromList+'">X Remove</button></p><div class="moreInfoBox" id="moreInfo'+result[i].id+'"></div><hr/></div>');
		
		listArr.push(result[i].name);
		$.getJSON('https://api.foursquare.com/v2/venues/'+result[i].id+'?oauth_token=JHPVGF1KAR2F5RBE0JDHKU0X0KOVGQGZKPFFJDNL3QIDMIH1&v=20131201',
    	function(data) {
			listLat.push(data.response.venue.location.lat);
	    	listLng.push(data.response.venue.location.lng);
    	});
	}
	$("#thisTrip").show();
}

//deletes a location from a trip
function delNewTrip(listName, itemName, venueValue)
{
	deleditfunc(listName, itemName);
	$("#itinList"+venueValue+"").remove();
	updateMap();
}

//deletes trips marked as Remove
function delList()
{
	console.log(removeList.length);
	for(var i=0;i<removeList.length;i++)
	{
		deleditfunc(removeTripName, removeList[i]);
	}
	removeList.length = 0;
	removeTripName = "";
	updateMap();
}

//deletes a location from a trip
function deleditfunc(listName, itemName)
{
	var res = store.get(listName);
	var temp=[];
	var tempctr=0;
	for(i=0;i<res.length;i++)
	{
	  if (res[i].name!= itemName)
	  {
	  	temp.push(res[i]);
	  }
	  else {
	  	$("#tripItem"+res[i].id+"").remove();
	  }
	}
	store.remove(listName);
	store.set(listName,temp);
	for(var j=0;j<listArr.length;j++)
	{
		console.log("listarr"+listArr[j]);
		if(listArr[j]==itemName)
		{
			listArr.splice(j, 1);
			listLat.splice(j, 1);
			listLng.splice(j, 1);
			console.log("itemname"+itemName);
		}
	}
}

//a different div id
function deleditfunc2(venueValue)
{
	$("#itinList"+venueValue+"").remove();
}

//cancels changes made on a list
function cancelList()
{
	removeList.length = 0;
	removeTripName = "";
	$("#thisTrip").hide();
	$("#viewEdit").show();
	show = 0;
	currentMap.remove();
	$("#mapDisp2").hide();
	$("#viewthisMap").attr('value', 'View Map');
	listLat.length =0;
	listLng.length =0;
	listArr.length =0;
}

//delete trips that are checked
function deleteChecked()
{
	$('#myTrips').find(':checkbox').each(function(){
		if($(this).is(':checked'))
		{
			var tripDiv = "#tripDiv"+this.id+"";
			console.log(tripDiv);
			var tripName = $(tripDiv).find('p').find('span').text();
			console.log(tripName);
			store.remove(tripName);
			$(tripDiv).remove();

		}
	});
}

//Load trips in storage in drop-down menu
function loadItinList()
{
	store.forEach(function(val, key) {
    	$("#itinList").append("<option>"+val+"</option>");
	})
}

//Get results from searching (when adding to a previous trip)
function getResults()
{
	searchFail="succeeded";
	var searchString=$('#startingLoc').val();
	var venueString=$('#venueLoc').val();
	$.ajax({
    	url: 'https://api.foursquare.com/v2/venues/explore?near='+ searchString+'&query='+venueString+'&client_id=SC3J3U1LVJBWBL4YCBNBZCDF4IZJONWDZBRMD0SLFWFNGKJD&client_secret=AJGNKI2LJTQJAPC3KT3UQGZIGKBKTRA5JBCFQFZSRIGCWT3Y&v=20120101',
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
    			var addPlaceToList = "addPlaceToList('"+recVenue.replace(/'/g, "\\'").replace(/"/g, "\\'")+"', '"+recVenueId+"');";
    			$("#myList").append('<p>'+recVenue+'<input type="button" id="add'+recVenueId+'" class="add" name="input" value="Add" onClick="'+addPlaceToList+'"> <input type="button" id="moreInfobut'+recVenueId+'" class="moreInfo" name="infoBut" value="More Information" onClick="'+getPlaceInfo+'"></p><div class="moreInfoBox" id="moreInfo'+recVenueId+'"></div> <hr/>');
	  		});
	    },
    	error: function( data ) {
	      $("#myList").append('<p>Could not find any results for that location. Please enter another location and try again!</p>');
	      searchFail="failed";
    	}
    });
	$("#searchResults").show();
}

//Save the new updated trip list
function saveThisList()
{	
	var itinName = $('#itinList').find(":selected").text();
	var res = store.get(itinName);
	for(var i=0;i<myListArr.length;i++)
	{
	  res.push(myListArr[i]);
	}
	store.remove(itinName);
	store.set(itinName,res);
	console.log(itinName);
	$("#newItin").hide();
	$("#searchResults").hide();
	$("#finaListName").html('');
	$("#finaListName").append("<em>"+itinName+"</em> Itinerary");
	var newRes = store.get(itinName);
	$("#itinDestList").html('');
	for(var i=0;i<newRes.length;i++)
	{
		var deleditfunc = "deleditfunc('"+itinName+"', '"+res[i].name+"'); deleditfunc2('"+res[i].id+"');"
		var getPlaceInfo = "getPlaceInfo('"+res[i].id+"');";
    	$("#itinDestList").append('<div id="itinList'+res[i].id+'"><p>'+res[i].name+'<input type="button" id="moreInfobut'+res[i].id+'" class="moreInfo" name="infoBut" value="More Information" onClick="'+getPlaceInfo+'"><button class="remove" id="remove'+res[i].id+'" onclick="'+deleditfunc+'">X Remove</button></p><div class="moreInfoBox" id="moreInfo'+res[i].id+'"></div><hr/></div>');
	}
	$("#finalList").show();	
}