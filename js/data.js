// *** DATA MANIPULATION
var locations=[];
var locationServiceData=[];

// Reads locations from file/variable JSON
function ReadLocations(source, source_type)
{
  switch(source_type) {
    case "file":
        $.ajax({
          url: source,
          success: function (data) {
            console.log('successfully loaded '+source);
            locations=JSON.parse(data);
          },
          error: function (data) {
              console.log('could not load '+source);
          }
        });
        break;
    case "variable":
        locations=JSON.parse(source);
        break;
    default:
      console.log("source type not specified!");
      break;
  }
}

  //locationFinder() returns an array of every location string from the JSON data

  function locationFinder() {
    var loc = [];
    var len=locations.locations.length;
    for (var i = 0; i < len; i++) {
     loc.push(locations.locations[i].address.street+" "+locations.locations[i].address.city);
     console.log(locations.locations[i].address.street+" "+locations.locations[i].address.city);
    };
    return loc;
  }

/*
  // RequestLocationData(array) fires off Google place searches for each location

  function RequestLocationData(array) {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(mapElement);

    // Iterates through the array of locations, creates a search object for each location
    for (var place in array) {
      // the search request object
      var request = {
        query: array[place]
      };

      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      service.textSearch(request, searchCallback);
    }
  }


  // callback(results, status) makes sure the search returned results for a location.
  // If so, it creates a new map marker for that location.

  function searchCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }
  }*/



// Define data in a variable for developemnt purposes
var locationsFile='{"locations":[{"name": "Home", "type": "accomodation", "description": "thats my home", "address":{"street": "14 Glenwood", "city": "London", "postalCode": "N15 3JU"}},{"name": "Work", "type": "employment", "description": "thats my job", "address":{"street": "2 S Gyle Cres", "city": "Edinburgh", "postalCode": "EHQ12 9FQ"}}]}';

// Read locations data
//ReadLocations("data/locations.json", "file");
ReadLocations(locationsFile, "variable");
console.log(locations);
