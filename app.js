new Vue({
  el: '#main',
  data: {
    fact: {},
    value: 'films',
    // TODO: get types and count from api and merge types and counts
    types: ["films", "people", "planets", "vehicles", "species"],
    counts: {"films": 7, "people": 87, "planets": 61, "vehicles": 39, "species": 37},
    films: true,
    failcounter: 0
  },
  ready: function() {
    this.getFacts(this.value);
    // TODO: reset timeout on button press (see clearTimeout)
    setInterval(function () {
      this.getFacts(this.value);
    }.bind(this), 60000);
  },

  methods: {
    // TODO: error handling for GET. Make function more dynamic (not only check 'name')
    fetchUrl: function(url) {
      console.log(url);
      this.$http.get(url).then(function(response) {
        var json = JSON.parse(response.body);
        return json['name'];
      });
    },

    resolveUrls: function(array) {
      var returnarray = [];
      for(var i = 0; i < array.length; i++) {
        this.$http.get(array[i]).then(function(response) {
          json = JSON.parse(response.body);
          if(json.hasOwnProperty('name')) {
            returnarray.push(' ' + json['name']);
          }else {
            returnarray.push(' ' + json['title']);
          }
        });
      }
      return returnarray;
    },

    formatDate: function  (input) {
      var datePart = input.match(/\d+/g),
      year = datePart[0],
      month = datePart[1], day = datePart[2];

      return day+'/'+month+'/'+year;
    },

    getFacts: function(type) {
      this.value = type;
      if(type === 'random') {
        random = Math.floor(Math.random() * this.types.length);
        type = this.types[random];
      }
      if(type === 'films') {
        this.films = true;
      }else {
        this.films = false;
      }
      random = (Math.floor(Math.random() * this.counts[type]) + 1);

      url = 'http://swapi.co/api/' + type + '/' + random;
      this.$http.get(url).then(function(facts) {
        // TODO: change json to array as the order is guaranteed that way
        var json = {};
        json['Category'] = type.charAt(0).toUpperCase() + type.slice(1);

        response = JSON.parse(facts.body);

        var ignore = ['created', 'edited', 'url'];
        for (var field in response) {
          if(response.hasOwnProperty(field) && $.inArray(field, ignore) === -1) {
            var newfield = field.replace(/_/g, ' ');
            newfield = newfield.charAt(0).toUpperCase() + newfield.slice(1);
            json[newfield] = response[field];
            // TODO: make seperate method to run all these checks
            if(newfield === 'Homeworld' && json[newfield].indexOf('http') > -1) {
              var homeworld = [json[newfield]];
              json[newfield] = homeworld;
            }
            if(this.value === 'people' || this.value === 'random') {
              if(newfield === 'Height' && json[newfield] !== 'unknown') {
                json[newfield] = json[newfield] + ' cm';
              }
              if(newfield === 'Mass' && json[newfield] !== 'unknown') {
                json[newfield] = json[newfield] + ' kg';
              }
            }
            if(this.value === 'planets' || this.value === 'random') {
              if(newfield === 'Rotation period' && json[newfield] !== 'unknown') {
                json[newfield] = json[newfield] + ' hours';
              }
              if(newfield === 'Orbital period' && json[newfield] !== 'unknown') {
                json[newfield] = json[newfield] + ' days';
              }
              if(newfield === 'Diameter' && json[newfield] !== 'unknown') {
                json[newfield] = json[newfield].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' km';
              }
              if(newfield === 'Population' && json[newfield] !== 'unknown') {
                json[newfield] = json[newfield].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
              }
            }
            if(this.value === 'films' || this.value === 'random') {
              if(newfield === 'Release date') {
                json[newfield] = this.formatDate(json[newfield]);
              }
            }
            if(json[newfield].constructor === Array) {
              if(json[newfield].length === 0) {
                delete json[newfield];
              }else {
                json[newfield] = this.resolveUrls(json[newfield]);
              }
            }
          }
        }
        this.$set('fact', json);
        console.log('Got facts for ' + type + ' and number ' + random);
      }).catch(function(data) {
        if(this.failcounter < 5) {
          this.failcounter++;
          this.getFacts(type);
        }else {
          console.log("Failed to contact API");
          this.failcounter = 0;
        }
      });
    }
  }
});
