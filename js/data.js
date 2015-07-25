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
var groupedLocations={};

function LocationFinder() {
  var locSearchStr = [];
  var len=locations.locations.length;
  for (var i = 0; i < len; i++) {
    //if(typeof(groupedLocations[locations.locations[i].type]) !== 'undefined'){
      if(groupedLocations[locations.locations[i].type] && groupedLocations[locations.locations[i].type].constructor === Array){
      groupedLocations[locations.locations[i].type].push(locations.locations[i]);
    }else{
      groupedLocations[locations.locations[i].type]=[];
      groupedLocations[locations.locations[i].type][0]=locations.locations[i];}
   locSearchStr.push(locations.locations[i].address.street+" "+locations.locations[i].address.city);
   console.log(locations.locations[i].address.street+" "+locations.locations[i].address.city);
  };
  //console.log(groupedLocations);

  var panel=document.getElementById("user-panel");
  var ul;
  var keys = Object.keys(groupedLocations);
  var len = keys.length;
  var prop;
  for (i = 0; i < len; i++) {
    prop = keys[i];
    value = groupedLocations[prop];
    ul="<h3>"+prop.charAt(0).toUpperCase() + prop.slice(1);+"</h3><ul class='loc-group'>"
    for (var j = 0; j < value.length; j++) {
      ul+="<li>"+value[j].name+"</li>";
    };
    ul+="</ul>";
    panel.innerHTML+=ul;
  }
  return locSearchStr;
}

// Define data in a variable for developemnt purposes
var locationsFile='{"locations":[{"name": "Home", "type": "accomodation", "description": "thats my home", "address":{"street": "14 Glenwood", "city": "London", "postalCode": "N15 3JU"}},{"name": "Edinburgh home", "type": "accomodation", "description": "thats my current place", "address":{"street": "6 Glenfinlas St", "city": "Edinburgh", "postalCode": "EH3 6AQ"}},{"name": "Work", "type": "employment", "description": "thats my job", "address":{"street": "2 S Gyle Cres", "city": "Edinburgh", "postalCode": "EHQ12 9FQ"}}]}';

// Read locations data
//ReadLocations("data/locations.json", "file");
ReadLocations(locationsFile, "variable");
