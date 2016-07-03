new Vue({
  el: '#main',
  data: {
    fact: {},
    value: 'films',
    types: ["films", "people", "planets", "vehicles", "species"],
    counts: {"films": 7, "people": 87, "planets": 61, "vehicles": 39, "species": 37},
    films: true,
    failcounter: 0
  },
  ready: function() {
    this.getFacts(this.value);

    setInterval(function () {
      this.getFacts(this.value);
    }.bind(this), 60000);
  },

  methods: {
    fetchUrl: function(url) {
      console.log(url);
      this.$http.get(url).then(function(response) {
        var json = JSON.parse(response.body);
        console.log(json['name']);
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

      // construct the api url
      url = 'http://swapi.co/api/' + type + '/' + random;
      this.$http.get(url).then(function(facts) {
        json = JSON.parse(facts.body);
        delete json['created'];
        delete json['edited'];
        delete json['url'];
        json['category'] = type.charAt(0).toUpperCase() + type.slice(1);
        for (var field in json) {
          if(json.hasOwnProperty(field)) {
            newfield = field.replace(/_/g, ' ');
            newfield = newfield.charAt(0).toUpperCase() + newfield.slice(1);
            json[newfield] = json[field];
            delete json[field];
            if(newfield === 'Homeworld' && json[newfield].indexOf('http') > -1) {
              var homeworld = [json[newfield]];
              json[newfield] = homeworld;
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
