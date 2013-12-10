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

function createNewItin()
{
	$("#newItin").show();
}

function trash()
{
	$(".add").attr("style","").attr("value", "Add");
	listArr.length = 0;
	uniqueArr.length = 0;
	$('#itinDestList').html('');
	listLat.length = 0;
	listLng.length = 0;
	myListArr.length = 0;
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
    			$("#myList").append('<p>'+recVenue+'<input type="button" id="add'+recVenueId+'" class="add" name="input" value="Add" onClick="'+addPlaceToList+'"> <input type="button" id="moreInfobut'+recVenueId+'" class="moreInfo" name="infoBut" value="More Information" onClick="'+getPlaceInfo+'"></p><div id="moreInfo'+recVenueId+'"></div> <hr/>');
	  		});
	    },
    	error: function( data ) {
	      $("#myList").append('<p>Could not find any results for that location. Please enter another location and try again!</p>');
	      searchFail="failed";
    	}
    });
	$("#searchResults").show();
}
}

//Prettify this
function getPlaceInfo(divName)
{
	var buttonColor = $("#moreInfobut"+divName+"").css('background-color');
	if(buttonColor=="blue" || buttonColor == "rgb(0, 0, 255)")
	{
		$("#moreInfo"+divName+"").html('');
		$("#moreInfobut"+divName+"").attr("value", "More Information");
		$("#moreInfobut"+divName+"").css("background-color", "");
	}
	else
	{
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
		$("#moreInfobut"+divName+"").attr("value", "Less Information");
		$("#moreInfobut"+divName+"").css("background-color", "blue");
	}
}


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
		$("#itinDestList").append('<div id="itinList'+venueValue+'"><p>'+value+'<input type="button" id="moreInfobut'+venueValue+'" class="moreInfo" name="infoBut" value="More Information" onClick="'+getPlaceInfo+'"><button class="remove" id="remove'+venueValue+'" onclick="'+deleditfunc+'">X Remove</button></p><div id="moreInfo'+venueValue+'"></div><hr/></div>');
	});
	console.log("the selected is "+ venueName);
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

function removePlaceFromList(venueName, tripName, venueValue)
{
	$("#remove"+venueValue+"").css("background-color", "red").attr("value","Removed!");
	removeList.push(venueName);
	removeTripName = tripName;
}

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
	currentMap = map;
	$("#mapDisp2").show();
}

function updateMap()
{
	currentMap.remove();
	viewMap2();
}

//TODO: save the array listArr to local storage with listName captured below
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
		$("#thisTripDet").append('<div id="tripItem'+result[i].id+'"><p>'+result[i].name+'<input type="button" id="moreInfobut'+result[i].id+'" class="moreInfo" name="infoBut" value="More Information" onClick="'+getPlaceInfo+'"><button class="remove" id="remove'+result[i].id+'" onclick="'+removePlaceFromList+'">X Remove</button></p><div id="moreInfo'+result[i].id+'"></div><hr/></div>');
		
		listArr.push(result[i].name);
		$.getJSON('https://api.foursquare.com/v2/venues/'+result[i].id+'?oauth_token=JHPVGF1KAR2F5RBE0JDHKU0X0KOVGQGZKPFFJDNL3QIDMIH1&v=20131201',
    	function(data) {
			listLat.push(data.response.venue.location.lat);
	    	listLng.push(data.response.venue.location.lng);
    	});
	}
	$("#thisTrip").show();
}

function delNewTrip(listName, itemName, venueValue)
{
	deleditfunc(listName, itemName);
	$("#itinList"+venueValue+"").remove();
	updateMap();
}

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

function deleditfunc2(venueValue)
{
	$("#itinList"+venueValue+"").remove();
}

function cancelList()
{
	removeList.length = 0;
	removeTripName = "";
	$("#thisTrip").hide();
	$("#viewEdit").show();
}

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