/*
Start here! initializeMap() is called when page is loaded.
*/
// *** MAP ***

function InitializeMap() {

  console.log("Initializing map");

  var mapCanvas=document.getElementById('map-canvas');

  var mapOptions = {
    disableDefaultUI: true,
    center: { lat: -34.397, lng: 150.644},
          zoom: 8
  };

  var mapElement = new google.maps.Map(mapCanvas, mapOptions);

}

// Calls the initializeMap() function when the page loads
//window.addEventListener('load', initializeMap);
google.maps.event.addDomListener(window, 'load', InitializeMap);