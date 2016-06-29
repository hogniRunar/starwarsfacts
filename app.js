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
    facts: '',
    fact: {},
    value: 'films',
    types: ["films", "people", "planets", "vehicles", "starships", "species"],
    films: true
  },
  ready: function() {
    //begin with getting the facts from the api
    this.getFacts('films');
  },

  methods: {
    updateFact: function() {
      facts = JSON.parse(this.facts);
      random = Math.floor(Math.random() * facts.count);
      this.$set('fact', facts.results[5]);
      console.log(this.fact);
    },


    getFacts: function(type) {
      if(type === 'random'){
        random = Math.floor(Math.random() * this.types.length);
        type = this.types[random];
      }
      if(type === 'films'){
        this.films = true;
      }else{
        this.films = false;
      }
      // construct the api url
      url = 'http://swapi.co/api/' + type;

      this.$http.get(url).then(function(facts) {
        this.$set('facts', facts.body);
        console.log(JSON.parse(facts.body));
        console.log('Got facts for ' + type);
      });
      console.log(this.films);
    }
  }
});
