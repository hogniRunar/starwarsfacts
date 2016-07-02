Vue.directive('radio', {
  twoWay: true,
  bind: function() {
      var self = this;
      var btns = $(self.el).find('.btn');
      btns.each(function() {
          $(this).on('click', function() {
              var v = $(this).find('input').get(0).value
              self.set(v);
          })
      });
  },
  update: function() {
      var value = this._watcher.value;
      if (value) {
          this.set(value);
          var btns = $(this.el).find('.btn')
          btns.each(function() {
              $(this).removeClass('active');
              var v = $(this).find('input').get(0).value;

              if (v === value) {
                  $(this).addClass('active');
              }
          });
      } else {
          var input = $(this.el).find('.active input').get(0);
          if (input) {
              this.set(input.value);
          }
      }
  }
})

new Vue({
  el: '#main',
  data: {
    fact: {},
    value: 'films',
    types: ["films", "people", "planets", "vehicles", "starships", "species"],
    counts: {"films": 7, "people": 87, "planets": 61, "starships": 37, "vehicles": 39, "species": 37},
    films: true,
    failcounter: 0
  },
  ready: function() {
    this.getFacts(this.value);
  },

  methods: {
/*    fetchUrl: function(url) {
      this.$http.get(url).then(function(response) {
        return JSON.parse(response.body);
      }).catch(function(data) {
        console.log(data);
        if(this.failcounter < 5){
          this.failcounter++;
          this.fetchUrl(url);
        }else{
          console.log("Failed to contact API");
          this.failcounter = 0;
        }
      });
    },
*/
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

    setUpdateCycle: function() {
      //var self = this;
      (function Forever() {
        console.log(this.value);
        this.getFacts(this.value);
        setTimeout(Forever,60000);
      })();
    },

    getFacts: function(type) {
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
        for (var field in json) {
          if(json.hasOwnProperty(field)) {
            newfield = field.replace(/_/g, ' ');
            newfield = newfield.charAt(0).toUpperCase() + newfield.slice(1);
            json[newfield] = json[field];
            delete json[field];
            console.log(newfield);
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
        //this.setUpdateCycle();
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
