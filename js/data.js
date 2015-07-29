//  View Model

// search box
/*
var SearchBox=function(){
  this.keyword="";
  this.results=ko.observableArray();
  this.Clear=function(){
    this.keyword="";
    this.results=ko.observableArray();
  }.bind(this);
  return this;
}*/

var SearchBox = function(items) {
    this.items = ko.observableArray(items);
    this.itemToAdd = ko.observable("");
    this.addItem = function() {
      console.log(this.itemToAdd());
        if (this.itemToAdd() != "") {
            this.items.push(this.itemToAdd()); // Adds the item. Writing to the "items" observableArray causes any associated UI to update.
            this.itemToAdd(""); // Clears the text box, because it's bound to the "itemToAdd" observable
        }
    }.bind(this);  // Ensure that "this" is always this view model
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
  }
  return this;
}

// Define a "LocationGroup" class that tracks its own name and children, and has a method to add a new child
var LocationGroup = function(name, children) {
    this.name = ko.observable(name);
    this.children = ko.observableArray(children);

    this.addChild = function(newLoc) {
        this.children.push(newLoc);
    }.bind(this);
    return this;
}

// The view model is an abstract description of the state of the UI, but without any knowledge of the UI technology (HTML)
var viewModel = {
  searchBox: new SearchBox(["Alpha", "Beta", "Gamma"]),
  locationGroup: ko.observableArray()
};

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
  console.log("Read locations and add to the user panel");
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
    console.log(newloc);
    locSearchStr.push(combinedStr);
  }
  console.log(viewModel.locationGroup);
  return locSearchStr;
}

// Define data in a variable for developemnt purposes
var locationsFile='{"locations":[{"name": "Arthur\'s Seat", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "Arthurs Seat", "city": "Edinburgh", "postalCode": "EH8"}},{"name": "Edinburgh Castle", "type": "leisure", "description": "A big castle on top of the hill", "address":{"name": "Edinburgh Castle", "city": "Edinburgh", "postalCode": "EH1 2NG"}},{"name": "The Meadows", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "The Meadows", "city": "Edinburgh", "postalCode": "EH9 9EX"}},{"name": "Glenfinlas street", "type": "accomodation", "description": "thats my current place", "address":{"street": "6 Glenfinlas St", "city": "Edinburgh", "postalCode": "EH3 6AQ"}},{"name": "Tesco Bank", "type": "employment", "description": "thats my job", "address":{"street": "2 S Gyle Cres", "city": "Edinburgh", "postalCode": "EHQ12 9FQ"}}]}';

// Read locations data
// ReadLocations("data/locations.json", "file"); // uncomment to use data file
ReadLocations(locationsFile, "variable");

// Run the search against data
function SearchLocations(){
  var keyword=document.getElementById("search-field").value.toLowerCase();
  // only search if keyword is 2 characters or more
  if(keyword.length<2){
    document.getElementById("search-results").innerHTML="";
    return;
  }
// reset results
  var results="";
  for (var j=0; j<locations.locations.length; j++) {
      if (locations.locations[j].name.toLowerCase().match(keyword)) results+="<li data-loc-id="+locations.locations[j].locId+" onclick='FocusMarker(this);' >"+locations.locations[j].name+"</li>";
      if (locations.locations[j].description.toLowerCase().match(keyword)) results+="<li data-loc-id="+locations.locations[j].locId+" onclick='FocusMarker(this);' >"+locations.locations[j].description+"</li>";
  }
  // add results to the page
  document.getElementById("search-results").innerHTML=(results.length===0)?"<li>No results found</li>":results;
}

// Reset search box and results
function ClearSearch(){
  viewModel.searchBox.keyword="";
  document.getElementById("search-field").value="";
  document.getElementById("search-results").innerHTML="";
}

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
      console.log("adding child to existing group "+loc.type);
      viewModel.locationGroup()[i].addChild(loc);
      return;
    }
  };
  //console.log("adding child to a new group "+loc.type);
  //console.log(viewModel.locationGroup());
  viewModel.locationGroup.push(new LocationGroup(loc.type,[loc]));
  //console.log(viewModel.locationGroup());
  //console.log(viewModel.locationGroup().length);
}
