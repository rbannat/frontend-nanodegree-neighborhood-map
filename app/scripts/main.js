'use strict';

var locations = [
  {
    name: 'TK Maxx, Alexanderplatz, Berlin, Germany',
    position: {
      lat: 52.52070279999999,
      lng: 13.411023699999987
    }
  },
  {
    name: 'Weltzeituhr, Alexanderplatz, Berlin, Germany',
    position: {
      lat: 52.5211666,
      lng: 13.413308499999971
    }
  },
  {
    name: 'Schendelpark, Berlin, Germany',
    position: {
      lat: 52.52750959999999,
      lng: 13.408813499999951
    }
  },
  {
    name: 'ONE80 Hostel, Berlin, Germany',
    position: {
      lat: 52.523929,
      lng: 13.417916999999989
    }
  },
  {
    name: 'Kino International, Berlin, Germany',
    position: {
      lat: 52.52066199999999,
      lng: 13.423149899999999
    }
  },
  {
    name: 'Volkspark Friedrichshain, Berlin, Germany',
    position: {
      lat: 52.5280353,
      lng: 13.436393400000043
    }
  }
];

var Location = function (data) {
  this.name = data.name;
  this.position = data.position;
};

var ViewModel = function () {
  var self = this;

  self.filterValue = ko.observable('');

  // populate initial locations
  self.initialLocations = [];

  locations.forEach(function (location) {
    self.initialLocations.push(new Location(location));
  });

  // filtered locations computed observable array
  self.filteredLocations = ko.computed(function () {
    return self.initialLocations.filter(function (value) {
      return value.name.toLowerCase().indexOf(self.filterValue().toLowerCase()) > -1;
    });
  });

  // filtered markers
  self.filterValue.subscribe(function (newValue) {
    self.filteredMarkers = [];
    self.filteredMarkers = function () {
      return markers.filter(function (marker) {
        return marker.title.toLowerCase().indexOf(newValue.toLowerCase()) > -1;
      });
    };

    markers.forEach(function (marker) {
      marker.setMap(null);
    });

    self.filteredMarkers().forEach(function (marker) {
      marker.setMap(map);
    });
  });

  self.showMarkerWindow = function (data) {
    var showedMarker = markers.find(function (marker) {
      return marker.title === data.name;
    });
    if (lastActiveWindow) {
      lastActiveWindow.close();
    }
    lastActiveWindow = showedMarker.infoWindow;

    showedMarker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
      showedMarker.setAnimation(null);
    }, 740);
    showedMarker.infoWindow.open(map, showedMarker);

  }


};

ko.applyBindings(new ViewModel());

/*
 This is the fun part. Here's where we generate the custom Google Map for the website.
 See the documentation below for more details.
 https://developers.google.com/maps/documentation/javascript/reference
 */
var map;    // declares a global map variable
var markers = [];
var lastActiveWindow = null;

/*
 Start here! initializeMap() is called when page is loaded.
 */
function initializeMap() {

  var mapOptions = {
    disableDefaultUI: true
  };

  /*
   For the map to be displayed, the googleMap var must be
   appended to #mapDiv
   */
  map = new google.maps.Map(document.querySelector('#map'), mapOptions);

  /*
   createMapMarker(location) creates map pins by given location data
   */
  function createMapMarker(location) {

    // The next lines save location data from the search result object to local variables
    var lat = location.position.lat;  // latitude from the place service
    var lng = location.position.lng;  // longitude from the place service
    var name = location.name;   // name of the place from the place service
    var bounds = window.mapBounds;            // current boundaries of the map window

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
      map: map,
      position: location.position,
      animation: google.maps.Animation.DROP,
      title: name
    });

    var infoWindow = new google.maps.InfoWindow({
      content: name
    });

    google.maps.event.addListener(marker, 'click', function () {
      if (lastActiveWindow) {
        lastActiveWindow.close();
      }
      lastActiveWindow = infoWindow;
      infoWindow.open(map, marker);
      bounce();
    });

    marker.infoWindow = infoWindow;
    markers.push(marker);

    function bounce() {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function () {
        marker.setAnimation(null);
      }, 740);
    }

    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
    bounds.extend(new google.maps.LatLng(lat, lng));
    // fit the map to the new marker
    map.fitBounds(bounds);
    // center the map
    map.setCenter(bounds.getCenter());
  }

  /*
   pinPoster(locations) takes in the array of locations created by locationFinder()
   and fires off Google place searches for each location
   */
  function pinPoster(locations) {

    // Iterates through the array of locations, creates a search object for each location
    locations.forEach(function (location) {
      createMapMarker(location);
    });
  }

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
  pinPoster(locations);

}

// Calls the initializeMap() function when the page loads
window.addEventListener('load', initializeMap);

// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
window.addEventListener('resize', function (e) {
  //Make sure the map bounds get updated on page resize
  map.fitBounds(mapBounds);
});


