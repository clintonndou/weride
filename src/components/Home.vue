<template>
<v-container>
    <v-layout row wrap>
        <v-flex xs12 md12 v-show="false">
            <div id="map" style="height: 300px" width="300px;"></div>
        </v-flex>
        <v-flex xs12 sm12 md4 class="pa-2">
            <v-card color="blue-grey darken-2" class="white--text">
              <v-card-title primary-title>
                <v-flex xs12 sm12>
                    <v-text-field
                        placeholder="Enter your destination"
                        v-model="destinationInput"
                        :rules="[() => destinationInput.length > 0 || 'Enter your destination']"
                        required
                        dark
                        color="grey"
                        id="destinationInput"
                        >
                    </v-text-field>
                </v-flex>
                    <v-btn block color="teal" class="white--text" @click="createDestination()">Find a taxi</v-btn>
              </v-card-title>
            </v-card>
        </v-flex>
        <v-flex xs12 sm12 md4 class="pa-2">
            <v-card v-show="auth">
                <v-toolbar color="primary" dark class="elevation-0">
                <v-toolbar-title>Recent Destinations</v-toolbar-title>
                </v-toolbar>
                <v-list two-line subheader>
                <v-flex xs12 sm12 md12 class="text-xs-center text-sm-center my-5" v-if="$apollo.loading">
                    <v-progress-circular indeterminate :width="3" color="primary"></v-progress-circular>
                </v-flex>
                <v-flex xs12 sm12 md12 class="text-xs-center text-sm-center my-3" v-else-if="none === true">
                    <p>No recent destinations</p>
                </v-flex>
                <v-list-tile avatar v-for="(destination,index) in destinations" :key="index" v-else >
                    <v-list-tile-avatar style="cursor: pointer" :ripple="{ class: 'error--text' }" @click="loadDirections(destination)">
                        <v-icon class="secondary white--text">directions</v-icon>
                    </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-tooltip bottom>
                                <v-list-tile-title slot="activator">{{ destination.to }}</v-list-tile-title>
                                <span>{{ destination.to }}<br>{{ destination.date }}</span>
                            </v-tooltip>
                                <v-list-tile-sub-title>{{ destination.date }}</v-list-tile-sub-title>
                        </v-list-tile-content>
                    <v-list-tile-action>
                    <v-btn icon ripple @click="deleteDestination(destination)">
                        <v-icon color="secondary">delete</v-icon>
                    </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
                </v-list>
            </v-card>
            <v-card v-show="!auth">
                <v-card-media
                class="grey--text text--darken-3"
                height="230px"
                src="/static/images/map.jpg"
                >
                </v-card-media>
                <v-card-title>
                <div>
                    <p class="subheading">create an account now and get more...</p>
                    <p class="grey--text"><v-icon color="secondary">wb_sunny</v-icon> View full weather forecast</p>
                    <p class="grey--text"><v-icon color="secondary">history</v-icon> View your recent destinations</p>
                    <p><router-link to="/register" tag="span"><v-btn flat color="secondary">Sign up</v-btn></router-link></p>
                </div>
                </v-card-title>
            </v-card>
        </v-flex>
        <v-flex xs12 sm12 md4 class="pa-2">
            <v-card>
          <v-card-media
            src="/static/images/light-1282314_1280.jpg"
            height="350px"
          >
            <v-flex xs12 sm12 class="text-sm-center text-xs-center mt-4">
              <v-flex xs12 sm12 class="text-sm-center text-xs-center mt-5">
                <div class="text-sm-center text-xs-center display-2 grey--text">
                  Today
                  <br>
                  <span class="text-xs-center elevation-5 mt-3" style="display: inline-block;height: 150px; width: 150px; border: 3px solid #e65100 ; border-radius: 50%; background-color: rgba(0,0,0,0.1)">
                    <div v-if="progressDone === false" class="mt-5">
                      <v-progress-circular indeterminate :width="3" color="primary"></v-progress-circular>
                    </div>
                    <div v-else>
                      <h1 class="display-1 mt-4" style="color: #e65100;">{{ temp_c }} <span style="font-size: 18px">&#8451;</span></h1>
                      <img v-bind:src="img" alt="image" style="z-index: 2; height: 80px; width: 80px; margin-top: -20px;">
                    </div>
                  </span>
                </div>
              </v-flex>
            </v-flex>
          </v-card-media>
          <v-card-actions>
            <v-card-text><b>Location:</b> {{ local }}</v-card-text>
            <v-divider></v-divider>
          </v-card-actions>
          <v-slide-y-transition>
            <v-card-text v-show="show">
              <v-list two-line subheader>
                <v-subheader inset>Current weather conditions</v-subheader>
                <v-list-tile avatar>
                  <v-list-tile-avatar>
                    <img v-bind:src="img" alt="image">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>{{temp_c}} &#8451;</v-list-tile-title>
                    <v-list-tile-sub-title>Min: {{ min_temp}} &#8451; | Max: {{ max_temp}} &#8451; <br> Cloudiness: {{ wind_string }}</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                      <v-list-tile-sub-title>just now</v-list-tile-sub-title>
                  </v-list-tile-action>
                </v-list-tile>
                <v-divider inset></v-divider>
                <v-subheader inset>today &amp; tommorow: 3 hour time interval</v-subheader>
                <v-list-tile avatar v-for="item in forecast" :key="item.title">
                  <v-list-tile-avatar>
                    <img v-bind:src="'https://openweathermap.org/img/w/' + item['weather'][0]['icon'] + '.png'" alt="" class="circle">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ moment(item['dt_txt']).format("DD MMMM YYYY")}}</v-list-tile-title>
                    <v-list-tile-sub-title>{{ parseInt(item['main']['temp']) }} &#8451;</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-list-tile-sub-title>{{ moment(item['dt_txt']).format("h:mm a")}}</v-list-tile-sub-title>
                  </v-list-tile-action>
                  
                </v-list-tile>
              </v-list>
            </v-card-text>
          </v-slide-y-transition>
        </v-card>
        </v-flex>
        
    </v-layout>
</v-container>
</template>

<script>
import moment from 'moment'
import gql from 'graphql-tag'
import mapsapi from 'google-maps-api'
import listTravels from '../queries/listTravels'
import fetchTravels from '../queries/fetchTravels'
import fetchEmptyTravels from '../queries/fetchEmptyTravels'
import deleteTravel from '../mutations/deleteTravel'
import createTravel from '../mutations/createTravel';
import uuidV4 from 'uuid/v4'
//geocode
const googleMapsClient = require("@google/maps").createClient({
    key: 'AIzaSyC1Py5xUxnNh3qdXnAQSgwsLJHEJlOY0is',
    Promise: Promise
})

export default {
  name: 'Home',
  data () {
    return {
      moment: moment,
      name: 'default',
      destinationInput: '',
      none: false,
      location: {
            location: null,
            destination: null,
            locationCity: null,
            destinationCity: null,
            locationSublocality: null,
            destinationSublocality: null,
            locationProvince: null,
            destinationProvince: null
      },
      progressDone: false,
            arrayEvents: [],
            local: '',
            temp_c: '',
            min_temp: '',
            max_temp: '',
            img: '',
            wind_string: '',
            forecast: [],
            show: false,
      date: '',
      sub: '',
      destinations: [],
      recentDestinations : [],
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
    methods : {
        getToday : function(){
            var self = this;
            $.ajax({
                url : "https://api.openweathermap.org/data/2.5/weather?q=" + self.location.locationCity + ",za&units=metric&APPID=7e8537fa47f4fceb54f70ec7753b91d9",
                dataType : "jsonp",
                beforeSend: function(){
                  self.progressDone = false
                }
                }).done(function(parsed_json) {
                  self.local = parsed_json['name'];
                  self.temp_c = parseInt(parsed_json['main']['temp']);
                  self.min_temp = parseInt(parsed_json['main']['temp_min']);
                  self.max_temp = parseInt(parsed_json['main']['temp_max']);
                  self.wind_string = parsed_json['weather'][0]['description'];
                  self.img = "https://openweathermap.org/img/w/" + parsed_json['weather'][0]['icon'] + ".png";
                  self.progressDone = true
                }).fail(function(e){
                  self.snackbar.show = true
                  self.snackbar.text = 'Failed to load weather details'
                  self.$store.commit('showSnackBar',self.snackbar);
                  self.progressDone = true
                });
        },
        setNav: function(){
          if(this.auth === false){
            this.navItems.push({icon:"account_circle", title:"Sign in | Sign up", url:"/login"})
            }
            else{
            this.navItems.push({icon:"account_circle", title:"Profile", url:"/profile"},{icon:"exit_to_app", title:"Sign out", url:"/logout"})
            }
          this.$store.commit('setPageNav',this.navItems);
        },
        setPage: function(){
          this.$store.commit('setNavColor','orange darken-4 elevation-4')
        },
        createDestination(){
            if(this.auth === true){
                //get current location of the user
                const destinationInput = this.destinationInput;
                const locationInput = this.location.location;
                const datetime = new Date()
                const date = moment(datetime).format('llll');
                var sub = '';
                if(this.auth == true){
                    sub = this.userInfo.sub;
                }
                else{
                    sub = "unAuthenticated";
                }
                
                const id = uuidV4()
                const destination = {
                    to: destinationInput,
                    from: locationInput,
                    id,
                    sub: sub,
                    date: date
                }
                this.$apollo.mutate({
                    mutation: createTravel,
                    variables: destination,
                    optimisticResponse: {
                    __typename: 'Mutation',
                    createTravel: {
                        __typename: 'Travel',
                        ...destination
                    }
                    },
                    update: (store,{data: {createTravel}}) => {
                        const query = fetchTravels
                        const data = store.readQuery({query,variables: {
                        sub: this.userInfo.sub
                    }})
                        data.fetchTravel.items.push(createTravel)
                        store.writeQuery({query,variables: {
                        sub: this.userInfo.sub
                    },data})
                    },
                }).then(data => {
                    this.$router.push('directions');
                }).catch(error => {
                    console.error("error: ", error)
                    //show error message
                    this.snackbar.show = true
                    this.snackbar.text = error.message
                    this.$store.commit('showSnackBar',this.snackbar);
                })
            }
            else{
                this.$router.push('directions');
            }
        },
        deleteDestination(destination) {
            this.$apollo.mutate({
                mutation: deleteTravel,
                variables: {
                    id: destination.id
                },
                update: (store, { data: { deleteTravel } }) => {
                const data = store.readQuery({ query: fetchTravels, variables: {
                    sub: this.userInfo.sub
                } })
                data.fetchTravel.items = data.fetchTravel.items.filter(destination => destination.id !== deleteTravel.id)
                store.writeQuery({ query: fetchTravels,variables: {
                    sub: this.userInfo.sub
                }, data })
                console.log("delete: ",data)
                },
                optimisticResponse: {
                __typename: 'Mutation',
                deleteTravel: {
                    __typename: 'Travel',
                    ...destination
                }
                }
            }).then(data => {
                console.log("new: ",data)
                //show error message
                this.snackbar.show = true
                this.snackbar.text = "Deleted"
                this.$store.commit('showSnackBar',this.snackbar);
            })
            .catch(error => {
                console.error(error)
                //show error message
                this.snackbar.show = true
                this.snackbar.text = error.message
                this.$store.commit('showSnackBar',this.snackbar);
            })
            }
        ,
        locateUser(type,position,recentDestination){
            //simulated position
            var pos = {
                lat: -25.832807,
                lng: 28.204840
            }

            var latlng = position;
            var result = googleMapsClient.reverseGeocode({latlng: latlng})
                    .asPromise()
                    .then((response) => {
                        var self = this;
                        var placeSearch, autocomplete;
                        var componentForm = {
                            locality: 'long_name',
                            sublocality_level_1: 'short_name',
                            administrative_area_level_1: 'long_name',
                            neighbourhood: 'long_name',
                            sublocality_level_2: 'long_name'
                        };
                        var results = response.json.results;
                        //store the address of the user
                        self.location.location = results[0].formatted_address;
                        console.log("address location",results[0].formatted_address)
                        for(var i = 0; i < results[0].address_components.length ;i++){
                            for(var j = 0; j < results[0].address_components[i].types.length ; j++){
                                if(results[0].address_components[i].types[j] === "locality"){
                                    var val = results[0].address_components[i].short_name;
                                    //store the city of the user
                                    self.location.locationCity = val;
                                }
                                
                                if(results[0].address_components[i].types[j] == "administrative_area_level_1"){
                                    var val = results[0].address_components[i].long_name;
                                    self.location.locationProvince = val
                                }
                                                    
                                if(results[0].address_components[i].types[j] == "locality"){
                                    var val = results[0].address_components[i].long_name;
                                    self.location.locationCity = val
                                }
                                
                                if(results[0].address_components[i].types[j] == "sublocality_level_2"){
                                    var val = results[0].address_components[i].long_name;
                                    self.location.locationSublocality = val
                                }
                                
                                if(results[0].address_components[i].types[j] == "neighbourhood"){
                                    var val = results[0].address_components[i].long_name;
                                    self.location.locationSublocality = val
                                }
                                
                                if(results[0].address_components[i].types[j] == "sublocality"){
                                    var val = results[0].address_components[i].long_name;
                                    self.location.locationSublocality = val
                                }
                                                    
                                if(results[0].address_components[i].types[j] == "sublocality_level_1"){
                                    var val = results[0].address_components[i].long_name;
                                    self.location.locationSublocality = val
                                }
                                
                                if(self.location.locationSublocality == null){
                                    if(results[0].address_components[i].types[j] == "locality"){
                                    self.location.locationSublocality = val
                                }
                            }
                        }
                        if(i == results[0].address_components.length - 1){
                            if(type == "input"){
                                self.getAutocomplete();
                                self.getToday()
                            }
                            if(type == "recent"){
                                self.getAutocomplete2(recentDestination);
                                self.getToday()
                            }

                        }
                    }
                    })
                    .catch((err) => {
                        if(err){
                            console.error(err)
                            //show error message
                            this.snackbar.show = true
                            this.snackbar.text = "failed to get your current location, try refreshing the page and make sure your gps is switched on"
                            this.$store.commit('showSnackBar',this.snackbar);
                        }
                    })
        },
        getAutocomplete(){
            var self = this;
            var placeSearch, autocomplete;
            var componentForm = {
                locality: 'long_name',
                sublocality_level_1: 'short_name',
                administrative_area_level_1: 'long_name',
                neighbourhood: 'long_name',
                sublocality_level_2: 'long_name'
            };     
            
            
            // Create the autocomplete object, restricting the search to geographical
            // location types.
            autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('destinationInput')));

            // Set initial restrict to the greater list of countries.
            autocomplete.setComponentRestrictions(
            {'country': ['za']});

            // When the user selects an address from the dropdown, populate the address
            // fields in the form.
            autocomplete.addListener('place_changed', fillInAddress);

            function fillInAddress() {
                // Get the place details from the autocomplete object.
                var place = autocomplete.getPlace();
                self.destinationInput = place.name + ", " + place.formatted_address;
                //store the destination of the user
                self.location.destination = place.name + ", " + place.formatted_address;
                // Get each component of the address from the place details
                // and fill the corresponding field on the form.
                console.log("Address destination", place.name + ", " + place.formatted_address)
                for (var i = 0; i < place.address_components.length; i++) {
                    for(var j = 0; j < place.address_components[i].types.length ; j++){
                        var addressType = place.address_components[i].types[j];
                        if (addressType) {
                            var val = place.address_components[i].long_name;
                            if(addressType == "administrative_area_level_1"){
                                self.location.destinationProvince = val
                            }
                            if(addressType == "locality"){
                                self.location.destinationCity = val
                            }
                            if(addressType == "sublocality_level_2"){
                                self.location.destinationSublocality = val
                            }
                            if(addressType == "neighbourhood"){
                                self.location.destinationSublocality = val
                            }
                            if(addressType == "sublocality"){
                                self.location.destinationSublocality = val
                            }
                            if(addressType == "sublocality_level_1"){
                                self.location.destinationSublocality = val
                            }
                            if(self.location.destinationSublocality == null){
                                if(addressType == "locality"){
                                    self.location.destinationSublocality = val
                                }
                            }
                        }
                        if(i == place.address_components.length - 1){
                            //commit journey to storage
                            self.$store.commit('setLocation',self.location);
                            localStorage['journey'] = JSON.stringify(self.location);
                        }
                    }
                }
            }
        },
        getAutocomplete2(address){
            var self = this;
            googleMapsClient.geocode({address: address})
                    .asPromise()
                    .then((response) => {
                        var results = response.json.results;
                        //store the address of the user
                        var latlng = results[0].geometry.location;
                        console.log(latlng)

                        googleMapsClient.reverseGeocode({latlng: latlng})
                        .asPromise()
                        .then((response) => {
                            var results = response.json.results;
                            //store the address of the user
                            self.location.destination = results[0].formatted_address;
                            console.log("new geo location",results[0].formatted_address)
                            for(var i = 0; i < results[0].address_components.length ;i++){
                                for(var j = 0; j < results[0].address_components[i].types.length ; j++){
                                    if(results[0].address_components[i].types[j] === "locality"){
                                        var val = results[0].address_components[i].short_name;
                                        //store the city of the user
                                        self.location.destinationCity = val;
                                    }
                                    
                                    if(results[0].address_components[i].types[j] == "administrative_area_level_1"){
                                        var val = results[0].address_components[i].long_name;
                                        self.location.destinationProvince = val
                                    }
                                                        
                                    if(results[0].address_components[i].types[j] == "locality"){
                                        var val = results[0].address_components[i].long_name;
                                        self.location.destinationCity = val
                                    }
                                    
                                    if(results[0].address_components[i].types[j] == "sublocality_level_2"){
                                        var val = results[0].address_components[i].long_name;
                                        self.location.destinationSublocality = val
                                    }
                                    
                                    if(results[0].address_components[i].types[j] == "neighbourhood"){
                                        var val = results[0].address_components[i].long_name;
                                        self.location.destinationSublocality = val
                                    }
                                    
                                    if(results[0].address_components[i].types[j] == "sublocality"){
                                        var val = results[0].address_components[i].long_name;
                                        self.location.destinationSublocality = val
                                    }
                                                        
                                    if(results[0].address_components[i].types[j] == "sublocality_level_1"){
                                        var val = results[0].address_components[i].long_name;
                                        self.location.destinationSublocality = val
                                    }
                                    
                                    if(self.location.locationSublocality == null){
                                        if(results[0].address_components[i].types[j] == "locality"){
                                        self.location.destinationSublocality = val
                                    }
                                }
                            }
                            if(i == results[0].address_components.length - 1){
                                //commit journey to storage
                                self.$store.commit('setLocation',self.location);
                                localStorage['journey'] = JSON.stringify(self.location);
                                //create destination
                                self.$router.push('directions')
                            }
                        }
                        })
                        .catch((err) => {
                            console.log(err)
                            //show error message
                            this.snackbar.show = true
                            this.snackbar.text = "failed to get your current location, try refreshing the page and make sure your gps is switched on"
                            this.$store.commit('showSnackBar',this.snackbar);
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                        //show error message
                        this.snackbar.show = true
                        this.snackbar.text = "failed to get your current location, try refreshing the page and make sure your gps is switched on"
                        this.$store.commit('showSnackBar',this.snackbar);
                    })
        },
        getUserLocation(type,destination){
            var self = this;
            //get current location with HTML5 geolocation API.
            if (navigator.geolocation) {
               navigator.geolocation.getCurrentPosition(function(position) {
                   var latlng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    self.locateUser(type,latlng,destination)
                })
            }
        },
        loadDirections(destination){
            var self = this;
            this.getUserLocation("recent",destination.to)
        }
    },
    apollo: {
      destinations: {
          query() {
            if(this.auth === true){
              return fetchTravels
            }
            else{
                return fetchEmptyTravels
            }
          },
          variables (){
              return {
                  sub: this.userInfo.sub
              }
          },
          update(data){
            if(data){
                if(data.fetchTravel.items.length > 0){
                    var newDest = [];
                    $.each(data.fetchTravel.items,function(i,el){
                        if($.inArray(el,newDest)=== -1){
                            newDest.push(el)
                        }
                    })
                    newDest.sort(function(a,b){
                        return new Date(b.date) - new Date(a.date)
                    })
                return newDest.slice(0,3)
                }
                else{
                    this.none = true
                    return data.fetchTravel.items
                }
            }
          }
      }
  },
    computed: {
      auth (){
        return this.$store.getters.getAuth
      },
      userInfo (){
        return this.$store.getters.getUser
      },
      city (){
        return this.$store.getters.getDirections.locationCity
      }
    },
    mounted: function(){
        //this.getUserLocation("input","")
    },
    beforeMount(){
        this.setNav();
        this.setPage();
        this.getUserLocation("input","")
    }
}
</script>


