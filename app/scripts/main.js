var initialLocations = [
  {
    name: 'Berlin'
  },
  {
    name: 'London'
  }
];

var Location = function (data) {
  this.name = data.name;
};

var ViewModel = function () {
  var self = this;

  self.locations = ko.observableArray([]);

  initialLocations.forEach(function (location) {
    self.locations.push(new Location(location));
  });


  //filteredLocations


};

ko.applyBindings(new ViewModel());

