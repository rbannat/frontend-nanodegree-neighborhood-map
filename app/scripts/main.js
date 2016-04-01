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
  this.marker = null;
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

  //current location
  self.currentLocation = ko.observable();

  self.isError = ko.observable(false);

    // filtered markers
    self.filterValue.subscribe(function (newValue) {
      self.filteredMarkers = [];
      self.filteredMarkers = function () {
        return markers.filter(function (marker) {
          return marker.title.toLowerCase().indexOf(newValue.toLowerCase()) > -1;
        });
      };

      markers.forEach(function (marker) {
        marker.setVisible(false);
      });

      self.filteredMarkers().forEach(function (marker) {
        marker.setVisible(true);
      });
    });

    /*
     * function for showing marker by clicked list item
     * */
    self.showMarkerWindow = function (data) {

      //set current active location
      self.currentLocation(this);

      var showedMarker = markers.find(function (marker) {
        return marker.title === data.name;
      });

      //trigger click event of marker
      google.maps.event.trigger(showedMarker, 'click');

    };

  //toggle menu
  self.isMenuOpen = ko.observable(false);
  self.toggleNav = function () {
    self.isMenuOpen(!self.isMenuOpen());
  };

};


/*
 This is the fun part. Here's where we generate the custom Google Map for the website.
 See the documentation below for more details.
 https://developers.google.com/maps/documentation/javascript/reference
 */
var map,    // declares a global map variable
  markers = [],
  lastActiveWindow = null;

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
      content: '<h3>' + name + '</h3>'
    });

    google.maps.event.addListener(marker, 'click', function () {
      if (lastActiveWindow) {
        lastActiveWindow.close();
      }
      lastActiveWindow = infoWindow;
      infoWindow.open(map, marker);
      map.panTo(marker.getPosition());
      bounce();
    });

    marker.infoWindow = infoWindow;
    markers.push(marker);

    var maxVenues = 5;
    var foursquareUrl = 'https://api.foursquare.com/v2/venues/search?ll=' + lat + ',' + lng +
      '&client_id=R0UOFDICLTRD2XWTVOC2J2BRZPEZA1ASO2RZAOE3PGXVMA4H&client_secret=Z4IZVEOJR1GHPDJSE1EMG0V43ABQWEI3B5OXRNYG2UFRKIRS&v=20160329';
    $.getJSON(foursquareUrl, function (data) {
      var contentString = '<h3>' + name + '</h3><h4>Locations nearby:</h4>';
      for (var i = 0; i <= maxVenues; i++) {
        contentString +=
          '<div><span class="fs-name">' + data.response.venues[i].name +
          ', </span><span class="fs-herenow">Here now: ' +
          data.response.venues[i].hereNow.count + '</span></div>';
      }
      marker.infoWindow.setContent(contentString);
    }).error(function (e) {
      marker.infoWindow.setContent('<h3>' + name + '</h3><div>Failed to load nearby locations</div>');
    });

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

// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
window.addEventListener('resize', function (e) {
  //Make sure the map bounds get updated on page resize
  map.fitBounds(mapBounds);
});


// error callback if map is not loaded
function googleError() {
  console.log('error');
  vm.isError(true);
}

var vm = new ViewModel();
ko.applyBindings(vm);




