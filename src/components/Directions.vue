<template>
  <v-container>
    <v-layout align-center justify-center v-show="load">
          <v-flex xs12 sm8 md4 class="text-xs-center text-sm-center mt-5">
                <p>loading directions</p>
          <v-progress-circular indeterminate :width="3" color="primary"></v-progress-circular>
      </v-flex>
    </v-layout>
        <v-stepper v-model="e1" v-show="steps">
        <v-stepper-header style="height: auto !important">
            <v-stepper-step v-for="(direction,index) in directions" :key="index" :step="index + 1" :complete="e1 > index + 1">{{direction.title}}</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items v-touch="{
          left: () => nextBtn(),
          right: () => prevBtn()
        }">
          <v-stepper-content v-for="(direction,index) in directions" :key="index"  :step="index + 1">
            <v-card color="elevation-0" class="mb-1" v-show="details">
              <v-flex xs12 sm12 md12 class="text-xs-center my-3">
                <div class="pt-1">
                  <v-icon style="font-size: 35px;">{{direction.icon}}</v-icon>
                  <div class="mt-2">
                    <small class="grey--text">{{direction.travel}}</small>
                  </div>
                  <v-layout wrap justify-space-around align-center class="my-2">
                    <span class="secondary--text headline">{{direction.price}}</span>
                  </v-layout>
                  <p>
                    <b><span>{{ direction.fromText }}</span></b><br>
                    <span>{{ direction.address }}</span><br>
                    <b><span>{{ direction.toText }}</span></b><br>
                    <span>{{ direction.address2 }}</span>
                  </p>
                </div>
              </v-flex>
              <v-flex xs12 sm12 md12 class="text-xs-center">
                <v-btn flat icon color="secondary lighten-1 mb-3" @click="prevBtn()">
                  <v-icon>keyboard_arrow_left</v-icon>
                </v-btn>
                <v-btn outline icon large color="primary lighten-1 mb-3" @click="showMap(direction.address, index, direction.mode)">
                  <v-icon>map</v-icon>
                </v-btn>
                <v-btn outline icon large color="primary lighten-1 mb-3" @click="showDirections(direction.address, index, direction.mode)">
                  <v-icon>directions</v-icon>
                </v-btn>
                <v-btn flat icon color="secondary lighten-1 mb-3" @click="nextBtn()">
                  <v-icon>keyboard_arrow_right</v-icon>
                </v-btn>
              </v-flex>
            </v-card>
            <v-card color="elevation-0" class="mb-1" v-show="map">
              <div :id="'map' + index" style="width: 100%; height: 400px; border-radius: 10px"></div>
              <v-flex xs12 sm12 md12 class="text-xs-center my-2">
                <v-btn flat icon color="secondary lighten-1 mb-3" @click="prevBtn()">
                  <v-icon>keyboard_arrow_left</v-icon>
                </v-btn>
                <v-btn outline icon large color="primary lighten-1 mb-3" @click="showDirections(direction.address, index, direction.mode)">
                  <v-icon>directions</v-icon>
                </v-btn>
                <v-btn fab dark large color="secondary mb-3" v-show="false">
                  <span>{{direction.price}}</span>
                </v-btn>
                <v-btn outline icon large color="primary lighten-1 mb-3" @click="showInfo(direction.address, index, direction.mode)">
                  <v-icon>info</v-icon>
                </v-btn>
                <v-btn flat icon color="secondary lighten-1 mb-3" @click="nextBtn()">
                  <v-icon>keyboard_arrow_right</v-icon>
                </v-btn>
              </v-flex>
            </v-card>
            <v-card color="elevation-0" class="mb-1" v-show="info">
              <v-flex xs12 sm12 md12 class="text-xs-center text-sm-center my-5" v-show="infoLoad">
                <v-progress-circular indeterminate :width="3" color="primary"></v-progress-circular>
              </v-flex>
              <v-flex xs12 sm12 md12 v-show="!infoLoad">
                <p :id="'right-panel' + index">directions</p>
              </v-flex>
              <v-flex xs12 sm12 md12 class="text-xs-center my-2">
                <v-btn icon flat color="secondary lighten-1 mb-3" @click="prevBtn()">
                  <v-icon>keyboard_arrow_left</v-icon>
                </v-btn>
                <v-btn outline icon large color="primary lighten-1 mb-3" @click="showMap(direction.address, index, direction.mode)">
                  <v-icon>map</v-icon>
                </v-btn>
                <v-btn fab dark large color="secondary mb-3" v-show="false">
                  <span>{{direction.price}}</span>
                </v-btn>
                <v-btn outline icon large color="primary lighten-1 mb-3" @click="showInfo(direction.address, index, direction.mode)">
                  <v-icon>info</v-icon>
                </v-btn>
                <v-btn icon flat color="secondary lighten-1 mb-3" @click="nextBtn()">
                  <v-icon>keyboard_arrow_right</v-icon>
                </v-btn>
              </v-flex>
            </v-card>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
      <v-layout align-center justify-center v-show="noResults">
        <v-flex xs12 sm8 md4 class="text-xs-center text-sm-center mt-5">
          <h1><v-icon style="font-size: 40px;">sentiment_very_dissatisfied</v-icon></h1>
          <p>No results found</p>
        </v-flex>
      </v-layout>
      <v-flex xs12 sm12 md12 style="position: fixed; bottom: 30px; right: 25px">
        <v-btn
              dark
              fab
              top
              color="pink"
               class="hidden-lg-only hidden-xl-only hidden-md-only hidden-sm-only mb-3"
              @click="goToHome()"
        >
        <v-icon>home</v-icon>
        </v-btn>
      </v-flex>
  </v-container>
</template>

<script>
import fetchRoutes from '../queries/fetchRoutes'
import fetchRoute from '../queries/fetchRoute'
import { stat } from 'fs';

export default {
  name: 'Directions',
  data () {
    return {
      e1: 0,
      show: false,
      map: false,
      info: false,
      load: true,
      infoLoad: true,
      steps: false,
      noResults: false,
      details: true,
      fetchRoutes: true,
      to: 'Centurion Central',
      from: 'Centurion Central',
      routes: [],
      timeArray: [],
      route: {
        title: null,
        icon: null,
        address: null,
        price: null,
        travel: null,
        step: null
      },
      directions: [],
      snackbar: {
          show: false,
          text: ""
        },
      navItems: [
          {icon:"home", title:"Home", url:"/home"},
          {icon:"directions", title:"Directions", url:"/directions"},
          {icon:"wb_sunny", title:"Weather", url:"/weather"}
        ]
    }
  },
  methods: {
      setNav: function(){
        if(this.auth === false){
          this.navItems.push({icon:"account_circle", title:"Sign in | Sign up", url:"/login"})
        }
        else{
          this.navItems.push({icon:"account_circle", title:"Profile", url:"/profile"},{icon:"exit_to_app", title:"Sign out", url:"/logout"})
        }
        this.$store.commit('setPageNav',this.navItems);
      },
      setColor: function(){
        this.$store.commit('setNavColor','orange darken-4 elevation-4')
      },
      goToHome(){
        this.$router.push('home')
      },
      showMap: function(location,index,mode){
        $('#right-panel' + index).html('');
        var self =this;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var directionsService = new google.maps.DirectionsService;
        var map = new google.maps.Map(document.getElementById('map' + index), {
          zoom: 13,
          center: {lat: 41.85, lng: -87.65}
        });
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('right-panel' + index));

        // var control = document.getElementById('floating-panel');
        // control.style.display = 'block';
        // map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

        calculateAndDisplayRoute(directionsService, directionsDisplay);


      function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        var start = self.directions[index].address;
        var end = self.directions[index].address2;
        directionsService.route({
          origin: start,
          destination: end,
          travelMode: mode
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
            //change markers
            // var leg = response.routes[0].legs[0];
            // makeMaker(leg.start_location,index);
            // makeMaker(leg.end_location,index + 1);
          } else {
            //show error message
            console.log(status)
            self.$router.push("home")
            self.snackbar.show = true
            self.snackbar.text = "An error occured while computing your directions, please try again"
            self.$store.commit('showSnackBar',this.snackbar);
          }
        });

        function makeMaker(position,icon,title){
          new google.maps.Marker({
            position: position,
            map: map,
            label: icon,
            title: title
          })
        }
      }
      this.details = false;
      this.map = true;
      this.info = false;
    },
    showInfo(location, index){
      this.details = true;
      this.map = false;
      this.info = false;
    },
    showDirections(location, index, mode){
      $('#right-panel' + index).html('');
        var self =this;
        var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
        var directionsService = new google.maps.DirectionsService;
        var map = new google.maps.Map(document.getElementById('map' + index), {
          zoom: 7,
          center: {lat: 41.85, lng: -87.65}
        });
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('right-panel' + index));

        // var control = document.getElementById('floating-panel');
        // control.style.display = 'block';
        // map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

        calculateAndDisplayRoute(directionsService, directionsDisplay);


      function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        var start = self.directions[index].address;
        var end = self.directions[index].address2;
        directionsService.route({
          origin: start,
          destination: end,
          travelMode: mode
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
            var leg = response.routes[0].legs[0];
            makeMaker(leg.start_location,"1");
            makeMaker(leg.end_location,"2");
            self.infoLoad = false;
          } else {
            console.log(status)
            self.$router.push("home")
            self.snackbar.show = true
            self.snackbar.text = "An error occured while computing your directions, please try again"
            self.$store.commit('showSnackBar',this.snackbar);
          }
        });
      }

      function makeMaker(position,icon,title){
          new google.maps.Marker({
            position: position,
            map: map,
            label: icon,
            title: title
          })
        }
      this.details = false;
      this.map = false;
      this.info = true;
    },
    setDirections(){
      //push loading
      this.directions.push({
        title: "loading...",
        icon: "",
        address: "",
        address2: "",
        price: "",
        travel: "",
        step: 1
      })
  
      //check if destination and location have been initialized
      if(this.location){
        if(this.location.location == null || this.location.destination == null){
          this.$router.push("home")
          this.snackbar.show = true;
          this.snackbar.text = "Error loading directions, please try again";
          this.$store.commit('showSnackBar',this.snackbar);
        }
        else{
          if(this.location.locationProvince != this.location.destinationProvince){
            this.getLongDistance();
          }
          else{
            this.getLocal();
          }
        }
      }
    },
    getLocal(){
      var self = this;
      //fetch a taxi routes from the database
          var variables = {
            location: self.location.locationSublocality,
            destination: self.location.destinationSublocality
          }
          this.$apollo.queries.routes.refetch(variables)
          .then(
            function(results){
              var data = results.data.fetchRoutes;
              if(data.items.length <= 0){
                self.fetchRoutes = false
                
                //get town
                var variables = {
                  location: "Town",
                  destination: self.location.destinationSublocality
                }
                self.$apollo.queries.route.refetch(variables)
                .then(
                  function(results){
                    var data = results.data.fetchRoute
                    console.log("TOWN 2",data)

                    var min;
                    var min2;
                    var routeFrom;
                    var routeTo;
                    data.items.forEach(function(item,index){
                      var address = item['routeLocation']
                      var taxiType = item['taxiType']
                      var cityFrom = item['from']
                      if(cityFrom == self.location.locationSublocality){
                        self.getTravelTime(self.location.location,address,"DRIVING")
                        .then(function(results){
                          console.log("FROM",results)
                          //if not min, initialize it else get min from all
                          if(!min || results['time'] < min['time']){
                            min = results
                            routeFrom = cityFrom
                          }
                          if(index === (data.items.length - 1)){
                            //check taxi boundry
                            if(taxiType == "Town"){
                              //set local
                              if(min.time){
                                //get town
                                var variables = {
                                  location: self.location.locationSublocality,
                                  destination: routeFrom
                                }
                                self.$apollo.queries.routes.refetch(variables)
                                .then(
                                  function(results){
                                    var data = results.data.fetchRoutes
                                    console.log("TOWN 2 LOCAL",data)
                                    data.items.forEach(function(item2,index3){
                                      var address = item2['routeLocation']
                                      var taxiType = item2['taxiType']

                                      self.getTravelTime(self.location.location,address,"WALKING")
                                      .then(function(results){
                                        console.log("RES",results)
                                        //if not min, initialize it else get min from all
                                        if(!min2 || results['time'] < min2['time']){
                                          min2 = results
                                        }
                                        if(index === (data.items.length - 1)){
                                          //check taxi boundry
                                          if(taxiType == "Town"){
                                            //set local
                                            if(min2.time){
                                              //get town drop off closest to destination
                                              //get local taxi from town drop off
                                                var variables = {
                                                  location: self.location.destinationSublocality,
                                                  destination: routeFrom
                                                }
                                                      
                                                self.$apollo.queries.routes.refetch(variables)
                                                .then(
                                                  function(results){
                                                    var data = results.data.fetchRoutes;
                                                    var mins;
                                                    data.items.forEach(function(item,index){
                                                      var address = item['routeLocation']
                                                      var taxiType = item['taxiType']
                                                      var price = item['price']

                                                      self.getTravelTime(self.location.destination,address,"WALKING")
                                                      .then(function(results){
                                                        //if not min, initialize it else get min from all
                                                        if(!mins || results['time'] < mins['time']){
                                                          mins = results
                                                        }
                                                        if(index === (data.items.length - 1)){
                                                          //check taxi boundry
                                                          if(taxiType == "Town"){
                                                            //set local
                                                            if(mins.time){
                                                              self.getTown2(min2, routeFrom, min, mins, price)
                                                            }
                                                          }
                                                        }
                                                      })
                                                      .catch(function(status){
                                                        console.log(status)
                                                        self.$router.push("home")
                                                        self.snackbar.show = true
                                                        self.snackbar.text = "An error occured while computing your directions, please try again"
                                                        self.$store.commit('showSnackBar',this.snackbar);
                                                      })
                                                    })
                                                  }
                                                )
                                            }
                                          }
                                        }
                                      })
                                      .catch(function(status){
                                        console.log(status)
                                        self.$router.push("home")
                                        self.snackbar.show = true
                                        self.snackbar.text = "An error occured while computing your directions, please try again"
                                        self.$store.commit('showSnackBar',this.snackbar);
                                      })
                                    })
                                  })
                              }
                            }
                          }
                        })
                        .catch(function(status){
                          console.log(status)
                          self.$router.push("home")
                          self.snackbar.show = true
                          self.snackbar.text = "An error occured while computing your directions, please try again"
                          self.$store.commit('showSnackBar',this.snackbar);
                        })
                      }
                      else{
                        self.load = false;
                        self.steps = false;
                        self.noResults = true;
                      }
                    })

                    //if there are no results here show no results to user
                    if(data.items.length <= 0){
                        self.load = false;
                        self.steps = false;
                        self.noResults = true;
                    }
                  }
                )
              }
              else{
              //////////////////////////////////////////////////////////////////////
              // LOCAL TO LOCAL
              /////////////////////////////////////////////////////////////////////
                //check local to local
                //for each route get route with minimum travel time
                var min;
                data.items.forEach(function(item,index){
                  var address = item['routeLocation']
                  var taxiType = item['taxiType']

                  self.getTravelTime(self.location.location,address,"WALKING")
                  .then(function(results){
                    //if not min, initialize it else get min from all
                    if(!min || results['time'] < min['time']){
                      min = results
                    }
                    if(index === (data.items.length - 1)){
                      //check taxi boundry
                      if(taxiType == "Local"){
                        //set local
                        if(min.time){
                          //push the users location
                          self.directions.push({
                            title: "You are here",
                            icon: "person_pin",
                            fromText: "Walk from",
                            address: self.location.location,
                            toText: "To",
                            address2: min.routeLocation,
                            price: "",
                            travel: min.travelTime + " | " + min.travelDistance,
                            mode: "WALKING",
                            step: 1
                          })

                          //get drop off from destination and routes
                          var variables2 = {
                            location: self.location.destinationSublocality,
                            destination: self.location.destinationSublocality
                          }
                          self.$apollo.queries.routes.refetch(variables2)
                          .then(
                            function(results){
                              var data = results.data.fetchRoutes;
                              //for each route get route with minimum travel time
                              var min2;
                              data.items.forEach(function(item2,index2){
                                var address = item2['routeLocation']
                                self.getTravelTime(self.location.destination,address,"WALKING")
                                .then(function(results){
                                  //if not min, initialize it else get min from all
                                  if(!min2 || results['time'] < min2['time']){
                                    min2 = results
                                  }
                                  if(index2 === (data.items.length - 1)){
                                    //set local
                                    if(min2.time){
                                      //get drop off from destination and routes
                                      //get the index from routes which is the same as min route
                                      var i = self.routes.findIndex(x => x.routeLocation == min2.routeLocation)
                                      //push local taxi
                                      self.getTravelTime(min.routeLocation,min2.routeLocation,"DRIVING")
                                      .then(function(results){
                                        if(results.time < 10){
                                          var route2 = {
                                            title: self.routes[i].taxiType + " taxi (Optional)",
                                            icon: "local_taxi",
                                            fromText: "Take local taxi here (Optional)",
                                            address: min.routeLocation,
                                            toText: "Drop off here",
                                            address2: min2.routeLocation,
                                            price: "R" + self.routes[i].price,
                                            travel: results.travelTime + " | " + results.travelDistance,
                                            mode: "DRIVING",
                                            step: 2
                                          }
                                        }
                                        else{
                                          var route2 = {
                                            title: self.routes[i].taxiType + " taxi",
                                            icon: "local_taxi",
                                            fromText: "Take local taxi here",
                                            address: min.routeLocation,
                                            toText: "Drop off here",
                                            address2: min2.routeLocation,
                                            price: "R" + self.routes[i].price,
                                            travel: results.travelTime + " | " + results.travelDistance,
                                            mode: "DRIVING",
                                            step: 2
                                          }
                                        }
                                        //push the local
                                        self.directions.push(route2)

                                        //get travel time from drop off to destination 
                                        self.getTravelTime(self.location.destination,min2.routeLocation,"WALKING")
                                          .then(function(results){
                                            //push destination
                                            self.directions.push({
                                              title: "Destination",
                                              icon: "pin_drop",
                                              fromText: "Walk From",
                                              address: min2.routeLocation,
                                              toText: "To",
                                              address2: self.location.destination,
                                              price: "",
                                              travel: results.travelTime + " | " + results.travelDistance,
                                              mode: "WALKING",
                                              step: 3
                                            })

                                            //reset directions
                                            self.directions.shift()

                                            //hide loader
                                            self.load = false;
                                            self.steps = true;
                                            self.noResults = false;

                                          })
                                          .catch(function(status){
                                            console.log(status)
                                            self.$router.push("home")
                                            self.snackbar.show = true
                                            self.snackbar.text = "An error occured while computing your directions, please try again"
                                            self.$store.commit('showSnackBar',this.snackbar);
                                          })
                                      })
                                      .catch(function(status){
                                        console.log(status)
                                        self.$router.push("home")
                                        self.snackbar.show = true
                                        self.snackbar.text = "An error occured while computing your directions, please try again"
                                        self.$store.commit('showSnackBar',this.snackbar);
                                      })
                                    }
                                  }
                                })
                                .catch(function(status){
                                  console.log(status)
                                  self.$router.push("home")
                                  self.snackbar.show = true
                                  self.snackbar.text = "An error occured while computing your directions, please try again"
                                  self.$store.commit('showSnackBar',this.snackbar);
                                })
                              });
                            }
                          );
                        }
                      }
                      if(taxiType == "Town"){
                        self.getTown(min)
                      }
                    }
                  })
                  .catch(function(status){
                    console.log(status)
                    self.$router.push("home")
                    self.snackbar.show = true
                    self.snackbar.text = "An error occured while computing your directions, please try again"
                    self.$store.commit('showSnackBar',this.snackbar);
                  })
                });
              }
            }
          );
    },
    getTown(min){
      var self = this;
      ////////////////////////////////////////////////////////////////////////
      //TOWN TAXI
      ///////////////////////////////////////////////////////////////////////
      //store route address for town taxi
      var routeAddress = min.routeLocation;

      var variables = {
        location: self.location.locationSublocality,
        destination: min.routeLocation
      }
      self.$apollo.queries.routes.refetch(variables)
      .then(
        function(results){
          var data = results.data.fetchRoutes;

          var localMin;
          data.items.forEach(function(item2,index2){
            var address = item2['routeLocation']
            self.getTravelTime(self.location.location,address,"WALKING")
            .then(function(results){
              //if not min, initialize it else get min from all
              if(!localMin || results['time'] < localMin['time']){
                localMin = results
              }
              
              if(index2 === (data.items.length - 1)){
                //set local min
                if(localMin.time < 20){
                  //push the users location
                  self.directions.push({
                    title: "You are here",
                    icon: "person_pin",
                    fromText: "Walk from",
                    address: self.location.location,
                    toText: "To",
                    address2: localMin.routeLocation,
                    price: "",
                    travel: localMin.travelTime + " | " + localMin.travelDistance,
                    mode: "WALKING",
                    step: 1
                  })

                  //get the index from routes which is the same as min route
                  var i = self.routes.findIndex(x => x.routeLocation == localMin.routeLocation)

                  //get local from location to rank 
                  self.getTravelTime(localMin.routeLocation,routeAddress,"DRIVING")
                  .then(function(results){
                    self.directions.push({
                    title: self.routes[i].taxiType + " taxi",
                    icon: "local_taxi",
                    fromText: "Take local taxi here",
                    address: localMin.routeLocation,
                    toText: "Drop off here",
                    address2: routeAddress,
                    price: "R" + self.routes[i].price,
                    travel: results.travelTime + " | " + results.travelDistance,
                    mode: "DRIVING",
                    step: 2
                  })
                                           
                  //get closest route to destination 
                  var variables = {
                    location: self.location.destinationSublocality,
                    destination: self.location.locationSublocality
                  }
                  
                  self.$apollo.queries.routes.refetch(variables)
                  .then(
                    function(results){
                      var data = results.data.fetchRoutes;

                      var min2;
                      data.items.forEach(function(item2,index2){
                        var address = item2['routeLocation']
                        
                        self.getTravelTime(self.location.destination,address,"WALKING")
                        .then(function(results){
                          //if not min, initialize it else get min from all
                          if(!min2 || results['time'] < min2['time']){
                            min2 = results
                          }
                          
                          if(index2 === (data.items.length - 1)){
                            //set Town
                            if(min2.time < 20){
                              //get the index from routes which is the same as min route
                              var i = self.routes.findIndex(x => x.routeLocation == min2.routeLocation)
                              
                              //push Town taxi
                              self.getTravelTime(min.routeLocation,min2.routeLocation,"DRIVING")
                              .then(function(results){
                                var route2 = {
                                  title: self.routes[i].taxiType + " taxi",
                                  icon: "local_taxi",
                                  fromText: "Take Town taxi here",
                                  address: min.routeLocation,
                                  toText: "Drop off here",
                                  address2: min2.routeLocation,
                                  price: "R" + self.routes[i].price,
                                  travel: results.travelTime + " | " + results.travelDistance,
                                  mode: "DRIVING",
                                  step: 3
                                }
                                //push town
                                self.directions.push(route2)

                                //get local taxi from town drop off
                                var variables2 = {
                                  location: self.location.destinationSublocality,
                                  destination: self.location.destinationSublocality
                                }
                                
                                self.$apollo.queries.routes.refetch(variables2)
                                .then(
                                  function(results){
                                    var data = results.data.fetchRoutes;

                                    var localmin2;
                                    var destinationmin2;
                                    data.items.forEach(function(item3,index3){
                                      var address = item3['routeLocation']
                                      //push Town taxi
                                      
                                      self.getTravelTime(min2.routeLocation,address,"WALKING")
                                      .then(function(results){
                                        //if not min, initialize it else get min from all
                                        if(!localmin2 || results['time'] < localmin2['time']){
                                          localmin2 = results
                                        }
                                        if(index3 === (data.items.length - 1)){
                                          //set Town
                                          if(localmin2.time < 20){
                                            //get the index from routes which is the same as min route
                                            var i = self.routes.findIndex(x => x.routeLocation == localmin2.routeLocation)
                                            //push destination
                                            data.items.forEach(function(item4,index4){
                                              var address2 = item4['routeLocation']
                                              //get travel time from drop off to destination 
                                              self.getTravelTime(self.location.destination,address2,"WALKING")
                                              .then(function(results){
                                                //if not min, initialize it else get min from all
                                                if(!destinationmin2 || results['time'] < destinationmin2['time']){
                                                  destinationmin2 = results
                                                }
                                                if(index4 === (data.items.length - 1)){
                                                  //set Town
                                                  if(destinationmin2.time < 20){
                                                    //get the index from routes which is the same as min route
                                                    var i2 = self.routes.findIndex(x => x.routeLocation == destinationmin2.routeLocation)
                                                                                        
                                                    self.directions.push({
                                                      title: self.routes[i].taxiType + " taxi",
                                                      icon: "local_taxi",
                                                      fromText: "Take local taxi here",
                                                      address: localmin2.routeLocation,
                                                      toText: "Drop off here",
                                                      address2: destinationmin2.routeLocation,
                                                      price: "R" + self.routes[i].price,
                                                      travel: localmin2.travelTime + " | " + localmin2.travelDistance,
                                                      mode: "DRIVING",
                                                      step: 4
                                                    })

                                                    //push destination
                                                    self.directions.push({
                                                      title: "Destination",
                                                      icon: "pin_drop",
                                                      fromText: "Walk From",
                                                      address: destinationmin2.routeLocation,
                                                      toText: "To",
                                                      address2: self.location.destination,
                                                      price: "",
                                                      travel: destinationmin2.travelTime + " | " + destinationmin2.travelDistance,
                                                      mode: "WALKING",
                                                      step: 5
                                                    })

                                                    //reset directions
                                                    self.directions.shift()

                                                    //hide loader
                                                    self.load = false;
                                                    self.steps = true;
                                                    self.noResults = false;
                                                  }
                                                }

                                              })
                                              .catch(function(status){
                                                console.log(status)
                                                self.$router.push("home")
                                                self.snackbar.show = true
                                                self.snackbar.text = "An error occured while computing your directions, please try again"
                                                self.$store.commit('showSnackBar',this.snackbar);
                                              })
                                            })
                                          }
                                        }
                                      })
                                      .catch(function(status){
                                        console.log(status)
                                        self.$router.push("home")
                                        self.snackbar.show = true
                                        self.snackbar.text = "An error occured while computing your directions, please try again"
                                        self.$store.commit('showSnackBar',this.snackbar);
                                      })
                                    })
                                  }
                                );
                              })
                              .catch(function(status){
                                console.log(status)
                                self.$router.push("home")
                                self.snackbar.show = true
                                self.snackbar.text = "An error occured while computing your directions, please try again"
                                self.$store.commit('showSnackBar',this.snackbar);
                              })
                            }
                          }
                        })
                        .catch(function(status){
                          console.log(status)
                          self.$router.push("home")
                          self.snackbar.show = true
                          self.snackbar.text = "An error occured while computing your directions, please try again"
                          self.$store.commit('showSnackBar',this.snackbar);
                        })
                      });
                    });
                  })
                  .catch(function(status){
                    console.log(status)
                    self.$router.push("home")
                    self.snackbar.show = true
                    self.snackbar.text = "An error occured while computing your directions, please try again"
                    self.$store.commit('showSnackBar',this.snackbar);
                  })
                }
              }
            })
            .catch(function(status){
              console.log(status)
              self.$router.push("home")
              self.snackbar.show = true
              self.snackbar.text = "An error occured while computing your directions, please try again"
              self.$store.commit('showSnackBar',this.snackbar);
            })
          })
        });         
    },
    getTown2(min, city1, minRank, mins, price){
    var self = this;
      ////////////////////////////////////////////////////////////////////////
      //TOWN TAXI
      ///////////////////////////////////////////////////////////////////////
      //store route address for town taxi
      var routeAddress = min.routeLocation;
      console.log("DOBS DATA",routeAddress)

      var variables = {
        location: self.location.locationSublocality,
        destination: min.routeLocation
      }
      self.$apollo.queries.routes.refetch(variables)
      .then(
        function(results){
          var data = results.data.fetchRoutes;
          var localMin;
          data.items.forEach(function(item2,index2){
            var address = item2['routeLocation']
            self.getTravelTime(self.location.location,address,"WALKING")
            .then(function(results){
              //if not min, initialize it else get min from all
              if(!localMin || results['time'] < localMin['time']){
                localMin = results
              }
              
              if(index2 === (data.items.length - 1)){
                //set local min
                if(localMin.time < 20){
                  //push the users location
                  self.directions.push({
                    title: "You are here",
                    icon: "person_pin",
                    fromText: "Walk from",
                    address: self.location.location,
                    toText: "To",
                    address2: localMin.routeLocation,
                    price: "",
                    travel: localMin.travelTime + " | " + localMin.travelDistance,
                    mode: "WALKING",
                    step: 1
                  })
                  

                  //get the index from routes which is the same as min route
                  var i = self.routes.findIndex(x => x.routeLocation == localMin.routeLocation)

                  //get local from location to rank 
                  self.getTravelTime(localMin.routeLocation,routeAddress,"DRIVING")
                  .then(function(results){
                    self.directions.push({
                    title: self.routes[i].taxiType + " taxi",
                    icon: "local_taxi",
                    fromText: "Take local taxi here",
                    address: localMin.routeLocation,
                    toText: "Drop off here",
                    address2: routeAddress,
                    price: "R" + self.routes[i].price,
                    travel: results.travelTime + " | " + results.travelDistance,
                    mode: "DRIVING",
                    step: 2
                  })
                                           
                  //get closest route to destination 
                  var variables = {
                    location: city1,
                    destination: self.location.locationSublocality
                  }
                  
                  self.$apollo.queries.routes.refetch(variables)
                  .then(
                    function(results){
                      var data = results.data.fetchRoutes;
                      var min2;
                      data.items.forEach(function(item2,index2){
                        var address = item2['routeLocation']
                        
                        self.getTravelTime(self.location.destination,address,"WALKING")
                        .then(function(results){
                          //if not min, initialize it else get min from all
                          if(!min2 || results['time'] < min2['time']){
                            min2 = results
                          }
                          
                          if(index2 === (data.items.length - 1)){
                            //set Town
                            if(min2.time){
                              //get the index from routes which is the same as min route
                              var i = self.routes.findIndex(x => x.routeLocation == min2.routeLocation)
                              
                              //push Town taxi
                              self.getTravelTime(min.routeLocation,min2.routeLocation,"DRIVING")
                              .then(function(results){
                                var route2 = {
                                  title: self.routes[i].taxiType + " taxi",
                                  icon: "local_taxi",
                                  fromText: "Take Town taxi here",
                                  address: min.routeLocation,
                                  toText: "Drop off here",
                                  address2: min2.routeLocation,
                                  price: "R" + self.routes[i].price,
                                  travel: results.travelTime + " | " + results.travelDistance,
                                  mode: "DRIVING",
                                  step: 3
                                }
                                //push town
                                self.directions.push(route2)

                                //get local taxi from town drop off
                                var variables2 = {
                                  location: city1,
                                  destination: city1
                                }
                                
                                self.$apollo.queries.routes.refetch(variables2)
                                .then(
                                  function(results){
                                    var data = results.data.fetchRoutes;
                                    
                                    var localmin2;
                                    var destinationmin2;
                                    data.items.forEach(function(item3,index3){
                                      var address = item3['routeLocation']
                                      //push Town taxi
                                      
                                      self.getTravelTime(min2.routeLocation,address,"WALKING")
                                      .then(function(results){
                                        //if not min, initialize it else get min from all
                                        if(!localmin2 || results['time'] < localmin2['time']){
                                          localmin2 = results
                                        }
                                        if(index3 === (data.items.length - 1)){
                                          //set Town
                                          if(localmin2.time){
                                            //get the index from routes which is the same as min route
                                            var i = self.routes.findIndex(x => x.routeLocation == localmin2.routeLocation)
                                            //push destination
                                            data.items.forEach(function(item4,index4){
                                              var address2 = item4['routeLocation']
                                              //get travel time from drop off to destination 
                                              self.getTravelTime(minRank.routeLocation,address2,"DRIVING")
                                              .then(function(results){
                                                //if not min, initialize it else get min from all
                                                if(!destinationmin2 || results['time'] < destinationmin2['time']){
                                                  destinationmin2 = results
                                                }
                                                if(index4 === (data.items.length - 1)){
                                                  //set Town
                                                  if(destinationmin2.time){
                                                    //get the index from routes which is the same as min route
                                                    var i2 = self.routes.findIndex(x => x.routeLocation == destinationmin2.routeLocation)
                                                                                        
                                                    self.directions.push({
                                                      title: self.routes[i].taxiType + " taxi",
                                                      icon: "local_taxi",
                                                      fromText: "Take local taxi here",
                                                      address: localmin2.routeLocation,
                                                      toText: "Drop off here",
                                                      address2: destinationmin2.routeLocation,
                                                      price: "R" + self.routes[i].price,
                                                      travel: results.travelTime + " | " + results.travelDistance,
                                                      mode: "DRIVING",
                                                      step: 4
                                                    })

                                                    self.getTravelTime(minRank.routeLocation,mins.routeLocation,"DRIVING")
                                                    .then(function(results){
                                                      //push destination
                                                      self.directions.push({
                                                        title: "Town Taxi",
                                                        icon: "local_taxi",
                                                        fromText: "Take Town taxi here",
                                                        address: minRank.routeLocation,
                                                        toText: "Drop off here" ,
                                                        address2: mins.routeLocation,
                                                        price: "R" + price,
                                                        travel: results.travelTime + " | " + results.travelDistance,
                                                        mode: "DRIVING",
                                                        step: 5
                                                      })

                                                      //get a local from tow drop off
                                                      var variables = {
                                                        location: self.location.destinationSublocality,
                                                        destination: self.location.destinationSublocality
                                                      }
                                                      
                                                      self.$apollo.queries.routes.refetch(variables)
                                                      .then(
                                                        function(results){
                                                          var data = results.data.fetchRoutes;
                                                          
                                                          var min3;
                                                          var min4;
                                                          data.items.forEach(function(item2,index2){
                                                            var address = item2['routeLocation']
                                                            //get travel from destination to route

                                                            self.getTravelTime(mins.routeLocation,address,"DRIVING")
                                                            .then(function(results){
                                                              //push destination
                                                              //if not min, initialize it else get min from all
                                                              if(!min3 || results['time'] < min3['time']){
                                                                min3 = results
                                                              }
                                                              if(index2 === (data.items.length - 1)){
                                                                //set Town
                                                                if(min3.time){
                                                                  //get the index from routes which is the same as min route
                                                                  var i = self.routes.findIndex(x => x.routeLocation == min3.routeLocation)

                                                                  data.items.forEach(function(item4,index4){
                                                                    var address = item4['routeLocation']
                                                                    //get travel from destination to route

                                                                    self.getTravelTime(self.location.destination,address,"WALKING")
                                                                    .then(function(results){
                                                                      //push destination
                                                                      //if not min, initialize it else get min from all
                                                                      if(!min4 || results['time'] < min4['time']){
                                                                        min4 = results
                                                                      }
                                                                      if(index4 === (data.items.length - 1)){
                                                                        //set Town
                                                                        if(min4.time){
                                                                          //get the index from routes which is the same as min route
                                                                          var i4 = self.routes.findIndex(x => x.routeLocation == min4.routeLocation)

                                                                          self.directions.push({
                                                                            title: self.routes[i].taxiType + " taxi",
                                                                            icon: "local_taxi",
                                                                            fromText: "Take local taxi here",
                                                                            address: min3.routeLocation,
                                                                            toText: "Drop off here",
                                                                            address2: min4.routeLocation,
                                                                            price: "R" + self.routes[i].price,
                                                                            travel: min3.travelTime + " | " + min3.travelDistance,
                                                                            mode: "DRIVING",
                                                                            step: 6
                                                                          })
                                                                          
                                                                          //push destination
                                                                          self.directions.push({
                                                                            title: "Destination",
                                                                            icon: "pin_drop",
                                                                            fromText: "Walk From",
                                                                            address: min4.routeLocation,
                                                                            toText: "To",
                                                                            address2: self.location.destination,
                                                                            price: "",
                                                                            travel: min4.travelTime + " | " + min4.travelDistance,
                                                                            mode: "WALKING",
                                                                            step: 7
                                                                          })
                                                                          
                                                                          //reset directions
                                                                          self.directions.shift()

                                                                          //hide loader
                                                                          self.load = false;
                                                                          self.steps = true;
                                                                          self.noResults = false;
                                                                        }
                                                                      }
                                                                    })
                                                                    .catch(function(status){
                                                                      console.log(status)
                                                                      self.$router.push("home")
                                                                      self.snackbar.show = true
                                                                      self.snackbar.text = "An error occured while computing your directions, please try again"
                                                                      self.$store.commit('showSnackBar',this.snackbar);
                                                                    })
                                                                  })                           
                                                                  
                                                                }
                                                              }

                                                            })
                                                            .catch(function(status){
                                                              console.log(status)
                                                              self.$router.push("home")
                                                              self.snackbar.show = true
                                                              self.snackbar.text = "An error occured while computing your directions, please try again"
                                                              self.$store.commit('showSnackBar',this.snackbar);
                                                            })
                                                          })
                                                        }
                                                      )

                                                      
                                                    })
                                                    .catch(function(status){
                                                      console.log(status)
                                                      self.$router.push("home")
                                                      self.snackbar.show = true
                                                      self.snackbar.text = "An error occured while computing your directions, please try again"
                                                      self.$store.commit('showSnackBar',this.snackbar);
                                                    })
                                                  }
                                                }

                                              })
                                              .catch(function(status){
                                                console.log(status)
                                                self.$router.push("home")
                                                self.snackbar.show = true
                                                self.snackbar.text = "An error occured while computing your directions, please try again"
                                                self.$store.commit('showSnackBar',this.snackbar);
                                              })
                                            })
                                          }
                                        }
                                      })
                                      .catch(function(status){
                                        console.log(status)
                                        self.$router.push("home")
                                        self.snackbar.show = true
                                        self.snackbar.text = "An error occured while computing your directions, please try again"
                                        self.$store.commit('showSnackBar',this.snackbar);
                                      })
                                    })
                                  }
                                );
                              })
                              .catch(function(status){
                                console.log(status)
                                self.$router.push("home")
                                self.snackbar.show = true
                                self.snackbar.text = "An error occured while computing your directions, please try again"
                                self.$store.commit('showSnackBar',this.snackbar);
                              })
                            }
                          }
                        })
                        .catch(function(status){
                          console.log(status)
                          self.$router.push("home")
                          self.snackbar.show = true
                          self.snackbar.text = "An error occured while computing your directions, please try again"
                          self.$store.commit('showSnackBar',this.snackbar);
                        })
                      });
                    });
                  })
                  .catch(function(status){
                    console.log(status)
                    self.$router.push("home")
                    self.snackbar.show = true
                    self.snackbar.text = "An error occured while computing your directions, please try again"
                    self.$store.commit('showSnackBar',this.snackbar);
                  })
                }
              }
            })
            .catch(function(status){
              console.log(status)
              self.$router.push("home")
              self.snackbar.show = true
              self.snackbar.text = "An error occured while computing your directions, please try again"
              self.$store.commit('showSnackBar',this.snackbar);
            })
          })
        });  
    },
    getLongDistance(){
      var self = this;
      ////////////////////////////////////////////////////////////////////////
      //LONG DISTANCE TAXI
      ///////////////////////////////////////////////////////////////////////

      var variables = {
        location: "Long Distance",
        destination: self.location.destinationCity
      }
      self.$apollo.queries.route.refetch(variables)
      .then(
        function(results){
          var data = results.data.fetchRoute;
          if(data.items.length <=0){
            self.load = false;
            self.steps = false;
            self.noResults = true;
          }
          else{
            var min;
            var cityFrom;
            data.items.forEach(function(item,index){
              var address = item['routeLocation']
              var taxiType = item['taxiType']
              var fromCity = item['from']
              self.getTravelTime(self.location.location,address,"DRIVING")
              .then(function(results){
                //if not min, initialize it else get min from all
                if(!min || results['time'] < min['time']){
                  min = results
                  cityFrom = fromCity
                }
                if(index === (data.items.length - 1)){
                  //check taxi boundry
                  if(taxiType == "Long Distance"){
                    //set local
                    if(min.time){
                      //push the users location
                      self.directions.push({
                        title: "You are here",
                        icon: "person_pin",
                        fromText: "You are here",
                        address: self.location.location,
                        toText: "Travel To",
                        address2: min.routeLocation,
                        price: "",
                        travel: min.travelTime + " | " + min.travelDistance,
                        mode: "DRIVING",
                        step: 1
                      })

                      var variables = {
                        location:  self.location.destinationCity,
                        destination: cityFrom
                      }
                      self.$apollo.queries.routes.refetch(variables)
                      .then(
                        function(results){
                          var data = results.data.fetchRoutes;
                          var min2;
                          data.items.forEach(function(item,index){
                            var address = item['routeLocation']
                            var taxiType = item['taxiType']
                            self.getTravelTime(min.routeLocation,address,"DRIVING")
                            .then(function(results){
                              //if not min, initialize it else get min from all
                              if(!min2 || results['time'] < min2['time']){
                                min2 = results
                              }
                              if(index === (data.items.length - 1)){
                                //check taxi boundry
                                if(taxiType == "Long Distance"){
                                  //set local
                                  if(min2.time){

                                    //get the index from routes which is the same as min route
                                    var i = self.routes.findIndex(x => x.routeLocation == min2.routeLocation)
                                    self.directions.push({
                                      title: self.routes[i].taxiType + " taxi",
                                      icon: "local_taxi",
                                      fromText: "Take " + self.routes[i].taxiType + " taxi here",
                                      address: min.routeLocation,
                                      toText: "Drop off here",
                                      address2: min2.routeLocation,
                                      price: "R" + self.routes[i].price,
                                      travel: min2.travelTime + " | " + min2.travelDistance,
                                      mode: "DRIVING",
                                      step: 2
                                    })

                                    self.getTravelTime(self.location.destination,min2.routeLocation,"DRIVING")
                                    .then(function(results){
                                      //push destination
                                      self.directions.push({
                                        title: "Destination",
                                        icon: "pin_drop",
                                        fromText: "Travel From",
                                        address: min2.routeLocation,
                                        toText: "To",
                                        address2: self.location.destination,
                                        price: "",
                                        travel: results.travelTime + " | " + results.travelDistance,
                                        mode: "DRIVING",
                                        step: 3
                                      })
                                      //reset directions
                                      self.directions.shift()

                                      //hide loader
                                      self.load = false;
                                      self.steps = true;
                                      self.noResults = false;
                                    })
                                    .catch(function(status){
                                      alert(status)
                                    })
                                  }
                                }
                              }
                            })
                            .catch(function(status){
                              alert(status)
                            })
                          })
                        }
                      )
                    }
                  }
                }
              })
              .catch(function(status){
                alert(status)
              })
            })
          }
        }
      )
    },
    getTravelTime(location,destination,mode){
      var self = this;
      return new Promise(
        function(resolve,reject){
          //get travel time from location to destination
          var origin1 = location;
          var destinationA = destination;

          var service = new google.maps.DistanceMatrixService;
          service.getDistanceMatrix({
            origins: [origin1],
            destinations: [destinationA],
            travelMode: mode,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
            }, function(response, status) {
              if (status !== 'OK') {
                reject(status)
                self.$router.push("home")
                self.snackbar.show = true
                self.snackbar.text = "An error occured while computing your directions, please try again"
                self.$store.commit('showSnackBar',this.snackbar);
              }
              else {
                var originList = response.originAddresses;
                var destinationList = response.destinationAddresses;
                for (var i = 0; i < originList.length; i++) {
                  var results = response.rows[i].elements;
                    for (var j = 0; j < results.length; j++) {
                    var travelTime = results[j].duration.text;
                    var time = results[j].duration.value/60;
                    var travelDistance = results[j].distance.text;
                  }
                }
              }
              resolve({
                routeLocation: destinationA,
                time: time,
                travelTime: travelTime,
                travelDistance: travelDistance
              })
          });
        }
      )
    },
    nextBtn(){
      if(this.e1 >= this.directions.length){
        this.e1 = 1
      }
      else{
        this.e1++
      }
      this.details = true;
      this.map = false;
      this.info = false;
    },
    prevBtn(){
      if(this.e1 == 1){
        this.e1 = this.directions.length
      }
      else{
        this.e1--
      }
      this.details = true;
      this.map = false;
      this.info = false;
    },
    cancelBtn(){
      this.e1 = 1;
      this.details = true;
      this.map = false;
      this.info = false;
    },
  },apollo: {
      routes: {
          query() {
            return fetchRoutes
          },
          variables (){
              return {
                  location: this.from,
                  destination: this.to
              }
          },
          update(data){
            console.log("fetchRoutes", data)
            return data.fetchRoutes.items
          }
      },
      route: {
          query() {
            return fetchRoute
          },
          variables (){
              return {
                  location: this.from,
                  destination: this.to
              }
          },
          update(data){
              console.log("fetchRoute", data)
              return data.fetchRoute.items
            }
      }
  },
  computed: {
      auth (){
        return this.$store.getters.getAuth
      },
      getEl(){
        return this.el
      }
      ,
      location(){
        return this.$store.getters.getDirections;
      }
    },
    beforeMount(){
        this.setNav();
        this.setColor();
        if(this.$store.getters.getDirections.location == null || this.$store.getters.getDirections.destination  == null){
          if(!localStorage['journey']){
            //push loading
            this.directions.push({
              title: "loading...",
              icon: "",
              address: "",
              address2: "",
              price: "",
              travel: "",
              step: 1
            })

            this.$router.push("home")
            this.snackbar.show = true;
            this.snackbar.text = "Error loading directions, please try again";
            this.$store.commit('showSnackBar',this.snackbar);
          }
          else{
            this.setDirections();
          } 
        }
        else{
          this.setDirections();
        } 
    }
}
</script>


