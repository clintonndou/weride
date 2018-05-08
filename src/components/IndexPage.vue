<template>
  <div>
    <div class="">
            <div class="landing-image" style="background-image: url('/static/images/image2.jpg'); height: 820px; background-color: rgba(0,0,0,0.4)">
                <div class="content">
                        <div class="container">
                            <h2 class="center-align" style="color: rgba(255,255,255,0.8)">Going Somewhere?</h2>
                            <div class="center-align">
                              <div id="map" style="display: none;"></div>
                              <div class="" style="display: block;">
                                <input v-model="destinationInput" type="search" id="destinationInput" name="destination" style="color: rgba(255,255,255,0.6); text-align: center" class="form-control form-put" required placeholder="enter your destination" />
                                <button  class="btn waves-effect waves-light center-align orange darken-4" style="color: white;" @click="createDestination()">Find a taxi
                                        <i class="material-icons right">send</i>
                                </button>
                                <div style="display: none;text-align: center; margin-top: 50px; color: rgba(255,255,255,0.7)">
                                    <p>Have an account, or need one? <br><span style="cursor:pointer; color: #FF6E40; font-weight: bold">Sign-in</span> | <span style="cursor:pointer; color: #FF6E40;">Sign-up</span></p>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
            </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import gql from 'graphql-tag'
import mapsapi from 'google-maps-api'
import listTravels from '../queries/listTravels'
import fetchTravels from '../queries/fetchTravels'
import fetchEmptyTravels from '../queries/fetchEmptyTravels'
import deleteTravel from '../mutations/deleteTravel'
import createTravel from '../mutations/createTravel'
import uuidV4 from 'uuid/v4'
//geocode
const googleMapsClient = require("@google/maps").createClient({
    key: 'AIzaSyC1Py5xUxnNh3qdXnAQSgwsLJHEJlOY0is',
    Promise: Promise
})
export default {
  name: 'HelloWorld',
  data () {
      return {
        moment: moment,
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
        date: '',
        sub: '',
        destinations: [],
        recentDestinations : [],
        snackbar: {
            show: false,
            text: ""
          },
        show: false,
        navItems: []
      }
    },
    methods: {
      setNav: function(){
      },
      setColor: function(){
        this.$store.commit('setNavColor','header elevation-0')
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
        getUserLocation(){
            var self = this;
            var placeSearch, autocomplete;
            var componentForm = {
                locality: 'long_name',
                sublocality_level_1: 'short_name',
                administrative_area_level_1: 'long_name',
                neighbourhood: 'long_name',
                sublocality_level_2: 'long_name'
            };

            // get current location with HTML5 geolocation API.
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var userPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    //simulated position
                    var pos = {
                        lat: -25.832807,
                        lng: 28.204840
                    }
                    var latlng = userPosition;

                    googleMapsClient.reverseGeocode({latlng: latlng})
                    .asPromise()
                    .then((response) => {
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
                    }
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                })
            }
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
                    }
                }
                //commit journey to storage
                self.$store.commit('setLocation',self.location);
                localStorage['journey'] = JSON.stringify(self.location);
            }
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
        if(this.$store.getters.getAuth === false){
          this.navItems = [];
          this.navItems.push({icon:"account_circle", title:"Sign in | Sign up", url:"/login"})
          this.$store.commit('setPageNav',this.navItems);
        }
        if(this.$store.getters.getAuth === true){
          this.navItems = [];
          this.navItems.push({icon:"home", title:"Home", url:"/home"},{icon:"exit_to_app", title:"Sign out", url:"/logout"})
          this.$store.commit('setPageNav',this.navItems);
        }
        return this.$store.getters.getAuth
      },
      userInfo (){
        return this.$store.getters.getUser
      }
    },
    mounted: function(){
        this.getUserLocation();
        this.getAutocomplete();
    },
    beforeMount(){
        this.setColor();
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped src="materialize-css/dist/css/materialize.min.css">

</style>
