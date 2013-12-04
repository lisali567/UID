function createNewItin()
{
	$("#newItin").show();
}

function hideItin()
{
	$("#newItin").hide();
}

function newItin()
{
	var searchString=$('#startingLoc').val();
	var client_id='CCIWHUGAWEKWL3GYCVJS4PMWRAB3ZU0NWVCWMUNMVZUODUI5';
	var client_secret='RRST11JJTAOPLW1WHSCIV3NRQAHXCOFUS3Q0XD5NHYPLJT3P';
	$.getJSON('https://api.foursquare.com/v2/venues/search?near='+ searchString+'&client_id='+client_id+'&client_secret='+client_secret);
//     function(data) {
       
//     	resSize=data.response.groups[0].items.length;
// $.each(data.response.groups[0].items, function(i,items){
// var recVenue=items.venue.name;
// var recVenueId=items.venue.id;
//     		//console.log("venue is"+ recVenue);
//     		//$('#searchedVenuesList').append('<li>'+recVenue+'</li>');
//     		$("#myList").append('<option value='+recVenueId+'>'+recVenue+'</option>');
//     		$("#myList").attr("size",resSize);
//     		//$( "#greatphoto" ).attr( "alt", "Beijing Brush Seller" );
// 	  });
}