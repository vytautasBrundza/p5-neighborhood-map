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

  function LocationFinder() {
    var loc = [];
    var len=locations.locations.length;
    for (var i = 0; i < len; i++) {
     loc.push(locations.locations[i].address.street+" "+locations.locations[i].address.city);
     console.log(locations.locations[i].address.street+" "+locations.locations[i].address.city);
    };
    return loc;
  }

// Define data in a variable for developemnt purposes
var locationsFile='{"locations":[{"name": "Home", "type": "accomodation", "description": "thats my home", "address":{"street": "14 Glenwood", "city": "London", "postalCode": "N15 3JU"}},{"name": "Edinburgh home", "type": "accomodation", "description": "thats my current place", "address":{"street": "6 Glenfinlas St", "city": "Edinburgh", "postalCode": "EH3 6AQ"}},{"name": "Work", "type": "employment", "description": "thats my job", "address":{"street": "2 S Gyle Cres", "city": "Edinburgh", "postalCode": "EHQ12 9FQ"}}]}';

// Read locations data
//ReadLocations("data/locations.json", "file");
ReadLocations(locationsFile, "variable");
