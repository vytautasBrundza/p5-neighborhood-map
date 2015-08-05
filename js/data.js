//  View Models

// Result model (represented in the list)
var Result=function(name, id){
  this.name=ko.observable(name);
  this.id=ko.observable(id);
  return this;
};

// Search box model
var SearchBox=function() {
  this.keyword=ko.observable("");
  // clear the search results
  this.Clear=function() {
    this.keyword("");
    viewModel.results.removeAll();
  }.bind(this);  // Ensure that "this" is always this view model

  // perform a new search whenever the keyword changes
  this.keyword.subscribe(function(newValue){
    // reset the results array
    viewModel.results.removeAll();
    // only search if keyword is 2 characters or more
    if(newValue.length<2){
      return;
    }
    // check for value matches in the locations data model object
    var resultsCount=0;
    for (var j=0; j<dataModel.locations.length; j++) {
      if (dataModel.locations[j].name.toLowerCase().match(newValue)) {
        viewModel.results.push(new Result(dataModel.locations[j].name,dataModel.locations[j].locId));
        resultsCount++;
      }
      if (dataModel.locations[j].description.toLowerCase().match(newValue)){
        viewModel.results.push(new Result(dataModel.locations[j].description,dataModel.locations[j].locId));
        resultsCount++;
      }
    }
    // if no matches were found, pass "not found" as a result
    if(resultsCount>0) return;
      viewModel.results.push(new Result("No results found",-1));
    });
};

// location info window

// information window model
var InfoWindow=function(){
  this.enabled=ko.observable(false);
  this.contents=ko.observable("No information found");
  // dismiss the info floater
  this.Dismiss=function() {
    this.enabled(false);
  }.bind(this);  // Ensure that "this" is always this view model
  return this;
};

// location model
var Location=function(name, type, id) {
  this.name=ko.observable(name);
  this.type=type;
  this.description="";
  this.locId=ko.observable(id);
  this.marker={};
  // return cached description or request a new one
  this.getDescription=function(){
    if(this.description){
      return this.description;
    }else{
      SearchWiki(this);
      return "No results found";
    }
  };
  dataModel.locations[id].view=this;
  return this;
};

// Define a "LocationGroup" class that tracks its own name and children, and has a method to add a new child
var LocationGroup=function(name, children) {
  this.name=ko.observable(name);
  this.children=ko.observableArray(children);
  // add an location entry
  this.addChild=function(newLoc) {
      this.children.push(newLoc);
  }.bind(this);
  return this;
};

// The view model is an abstract description of the state of the UI
var viewModel={
  searchBox: new SearchBox(),
  results: ko.observableArray(),
  locationGroup: ko.observableArray(),
  infoText: new InfoWindow(),
  notOnline: ko.observable()
};

// apply bindings
ko.applyBindings(viewModel);

// *** DATA MANIPULATION ***
var dataModel={};

// Reads dataModel from file/variable JSON
function ReadLocations(source, source_type){
  switch(source_type) {
    case "file":
        $.ajax({
          url: source,
          success: function (data) {
            dataModel=JSON.parse(data);
          },
          error: function (data) {
            alert('Application error: could not load '+source+' data file!');
          }
        });
        break;
    case "variable":
        dataModel=JSON.parse(source);
        break;
    default:
      alert("Application error: data source type not specified!");
      break;
  }
}

// LocationFinder() returns an array of every location string from the JSON locations data
var groupedLocations={};

function LocationFinder() {
  var len=dataModel.locations.length;
  for (var i=0; i < len; i++) {
    dataModel.locations[i].locId=i;
    // add multiple values to the string, if they are defined
    var combinedStr="";
    if(dataModel.locations[i].address.name) combinedStr+=dataModel.locations[i].address.name+" ";
    if(dataModel.locations[i].address.street) combinedStr+=dataModel.locations[i].address.street+" ";
    if(dataModel.locations[i].address.city) combinedStr+=dataModel.locations[i].address.city+" ";
    // prepare a string for search service
    dataModel.locations[i].searchString=combinedStr;
    // add new location object
    var newloc=new Location(dataModel.locations[i].name,dataModel.locations[i].type, i);
    AddLocation(newloc);
    // create a marker for the location
    pinPoster(combinedStr,i);
  }
}

// Define data in a variable for developemnt purposes
var locationsFile='{"locations":[{"name": "Arthur\'s Seat", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "Arthurs Seat", "city": "Edinburgh", "postalCode": "EH8"}},{"name": "Edinburgh Castle", "type": "leisure", "description": "A big castle on top of the hill", "address":{"name": "Edinburgh Castle", "city": "Edinburgh", "postalCode": "EH1 2NG"}},{"name": "The Meadows", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "The Meadows", "city": "Edinburgh", "postalCode": "EH9 9EX"}},{"name": "Glenfinlas street", "type": "accomodation", "description": "thats my current place", "address":{"street": "6 Glenfinlas St", "city": "Edinburgh", "postalCode": "EH3 6AQ"}},{"name": "Tesco Bank", "type": "employment", "description": "thats my job", "address":{"street": "2 S Gyle Cres", "city": "Edinburgh", "postalCode": "EHQ12 9FQ"}}]}';

// Read locations data
// ReadLocations("data/locations.json", "file"); // uncomment to use data file
ReadLocations(locationsFile, "variable");

// Wikipedia search (http://stackoverflow.com/a/3873658/1742303)
// base search string
var wikiSearchUrl="https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=";

function SearchWiki(location){
  var id=location.locId();
  // get location name
  var keyword=dataModel.locations[id].name;
  // set initial description
  var info="no description found";
  // send request to wikiMedia API
  $.getJSON("https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch="+keyword+"&format=json&callback=?", function(data) {
    var string=data.query.search[0].snippet;
    // discard first sentence?
    if(string.indexOf("For other uses")!=-1)
      string=string.slice(string.indexOf(".")+2,string.length);
    if(string.indexOf("redirects here")!=-1)
      string=string.slice(string.indexOf(".")+2,string.length);
    // add value to data model
    dataModel.locations[id].view.description=string;
    // add value to view model
    viewModel.infoText.enabled(true);
    viewModel.infoText.contents(string);
  })
  .fail(function() {
    alert("Wikipedia search failed!");
  });
}
// these don't work http://stackoverflow.com/questions/11044694/how-to-detect-ajax-call-failure-due-to-network-disconnected

// add new location to the list
function AddLocation(loc){
  var len=viewModel.locationGroup().length;
  for (var i=0; i < len; i++) {
    if(viewModel.locationGroup()[i].name()==loc.type) {
      viewModel.locationGroup()[i].addChild(loc);
      return;
    }
  }
  viewModel.locationGroup.push(new LocationGroup(loc.type,[loc]));
}

// checks if connected to the internet
function checkConnection(){
  viewModel.notOnline(!navigator.onLine);
  // requests next check in 500 ms
  setTimeout(checkConnection, 500);
}

// fire off the first check
checkConnection();
