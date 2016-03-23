var ViewModel = function () {
  var self = this;

  self.locations = ko.observableArray([
    {name: "Bungle"},
    {name: "George"},
    {name: "Zippy"}
  ]);
};

ko.applyBindings(new ViewModel());

