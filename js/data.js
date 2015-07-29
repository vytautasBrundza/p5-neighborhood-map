//  View Models

// Result model (represented in the list)
var Result=function(name, id){
  this.name=ko.observable(name);
  this.id=ko.observable(id);
  return this;
};

// Search box model
var SearchBox = function() {
  this.keyword = ko.observable("");

  // clear the search results
  this.Clear = function() {
    this.keyword("");
    viewModel.results = ko.observableArray();
  }.bind(this);  // Ensure that "this" is always this view model

  // perform a new search whenever the keyword changes
  this.keyword.subscribe(function(newValue){
    // reset the results array
    viewModel.results=ko.observableArray();
    // only search if keyword is 2 characters or more
    if(newValue.length<2){
      return;
    }
    // check for value matches in the locations data model object
    var resultsCount=0;
    for (var j=0; j<locations.locations.length; j++) {
      if (locations.locations[j].name.toLowerCase().match(newValue)) {
        viewModel.results().push(new Result(locations.locations[j].name,locations.locations[j].locId));
        resultsCount++;
      }
      if (locations.locations[j].description.toLowerCase().match(newValue)){
        viewModel.results().push(new Result(locations.locations[j].description,locations.locations[j].locId));
        resultsCount++;
      }
    }
    console.log(viewModel.results());
    // if no matches were found, pass "not found" as a result
    if(resultsCount>0) return;
      viewModel.results().push(new Result("No results found",-1));
    });
};

// location model
var Location=function(name, type, id) {
  this.name=ko.observable(name);
  this.type=type;
  this.description=ko.observable("");
  this.locId=ko.observable(id);
  this.marker={};
  this.getDescription=function(){
    if(this.description==""){
      SearchWiki(this);
    }else{
      return this.description;
    }
  };
  return this;
};

// Define a "LocationGroup" class that tracks its own name and children, and has a method to add a new child
var LocationGroup = function(name, children) {
    this.name = ko.observable(name);
    this.children = ko.observableArray(children);

    this.addChild = function(newLoc) {
        this.children.push(newLoc);
    }.bind(this);
    return this;
};

// The view model is an abstract description of the state of the UI
var viewModel = {
  searchBox: new SearchBox(),
  results: ko.observableArray(),
  locationGroup: ko.observableArray()
};

// apply bindings
ko.applyBindings(viewModel);

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

  // LocationFinder() returns an array of every location string from the JSON locations data
var groupedLocations={};

function LocationFinder() {
  var locSearchStr=[];
  //console.log("Read locations and add to the user panel");
  var len=locations.locations.length;
  for (var i = 0; i < len; i++) {
    locations.locations[i].locId=i;
    // add multiple values to the string, if they are defined
    var combinedStr="";
    if(locations.locations[i].address.name) combinedStr+=locations.locations[i].address.name+" ";
    if(locations.locations[i].address.street) combinedStr+=locations.locations[i].address.street+" ";
    if(locations.locations[i].address.city) combinedStr+=locations.locations[i].address.city+" ";
    // prepare a string for search service
    locations.locations[i].searchString=combinedStr;
    var newloc= new Location(locations.locations[i].name,locations.locations[i].type, i);
    AddLocation(newloc);
    //console.log(newloc);
    locSearchStr.push(combinedStr);
  }
  //console.log(viewModel.locationGroup);
  return locSearchStr;
}

// Define data in a variable for developemnt purposes
var locationsFile='{"locations":[{"name": "Arthur\'s Seat", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "Arthurs Seat", "city": "Edinburgh", "postalCode": "EH8"}},{"name": "Edinburgh Castle", "type": "leisure", "description": "A big castle on top of the hill", "address":{"name": "Edinburgh Castle", "city": "Edinburgh", "postalCode": "EH1 2NG"}},{"name": "The Meadows", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "The Meadows", "city": "Edinburgh", "postalCode": "EH9 9EX"}},{"name": "Glenfinlas street", "type": "accomodation", "description": "thats my current place", "address":{"street": "6 Glenfinlas St", "city": "Edinburgh", "postalCode": "EH3 6AQ"}},{"name": "Tesco Bank", "type": "employment", "description": "thats my job", "address":{"street": "2 S Gyle Cres", "city": "Edinburgh", "postalCode": "EHQ12 9FQ"}}]}';

// Read locations data
// ReadLocations("data/locations.json", "file"); // uncomment to use data file
ReadLocations(locationsFile, "variable");

// Wikipedia search (http://stackoverflow.com/a/3873658/1742303)
// base search string
var wikiSearchUrl="https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=";

function SearchWiki(location)
{
  var keyword=location.name;
  var description="no description found";
  $.getJSON("https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch="+keyword+"&format=json&callback=?", function(data) {
    var string= data.query.search[0].snippet;
    // discard first sentence?
    if(string.indexOf("For other uses")!=-1)
      string=string.slice(string.indexOf(".")+2,string.length);
    if(string.indexOf("redirects here")!=-1)
      string=string.slice(string.indexOf(".")+2,string.length);
    location.description= string;
  });
}

function AddLocation(loc){
  var len= viewModel.locationGroup().length;
  //console.log(len);
  for (var i = 0; i < len; i++) {
    //console.log("name: "+viewModel.locationGroup()[i].name());
    //console.log("type: "+loc.type);
    if(viewModel.locationGroup()[i].name()==loc.type) {
      //console.log("adding child to existing group "+loc.type);
      viewModel.locationGroup()[i].addChild(loc);
      return;
    }
  }
  //console.log("adding child to a new group "+loc.type);
  //console.log(viewModel.locationGroup());
  viewModel.locationGroup.push(new LocationGroup(loc.type,[loc]));
  //console.log(viewModel.locationGroup());
  //console.log(viewModel.locationGroup().length);
}
