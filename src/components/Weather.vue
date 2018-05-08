<template>
  <v-container class="">
      <v-flex xs12 sm12 md12 class="pa-2">
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
            <v-btn color="secondary" v-show="auth" flat @click.native="show = !show">{{ show ? 'forecast' : 'forecast' }}</v-btn>
            <router-link to="/login" tag="span"><v-btn color="secondary" v-show="!auth" flat>Sign in</v-btn></router-link>
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
  </v-container>
</template>

<script>
import moment from 'moment'
export default {
  name: 'HelloWorld',
  data () {
    return {
            moment: moment,
            show: false,
            progressDone: false,
            arrayEvents: [],
            local: '',
            temp_c: '',
            min_temp: '',
            max_temp: '',
            img: '',
            wind_string: '',
            forecast: [],
            navItems: [
              {icon:"home", title:"Home", url:"/home"},
              {icon:"directions", title:"Directions", url:"/directions"},
              {icon:"wb_sunny", title:"Weather", url:"/weather"}
            ],
            snackbar: {
        show: false,
        text: ""
      },
            picker: null,
        }
  },
  methods : {
        getToday : function(){
            var self = this;
            //check if destination city has been initialized
            if(self.city != null){
              $.ajax({
                url : "https://api.openweathermap.org/data/2.5/weather?q=" + self.city + ",za&units=metric&APPID=7e8537fa47f4fceb54f70ec7753b91d9",
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
                  console.log(e);
                  //show error message
                      self.snackbar.show = true
                      self.snackbar.text = 'Failed to load weather details'
                      self.$store.commit('showSnackBar',self.snackbar);
                      self.progressDone = true
                });
            }
            else{
              self.$router.push("home")
              self.snackbar.show = true;
              self.snackbar.text = "Enter your destination to view weather information";
              self.$store.commit('showSnackBar',this.snackbar);
            }
        },
        getForecast : function(){
            var self = this;
            $.ajax({
                url : "https://api.openweathermap.org/data/2.5/forecast?q=" + self.city + ",za&cnt=11&units=metric&APPID=7e8537fa47f4fceb54f70ec7753b91d9",
                dataType : "jsonp",
                success : function(response) {
                    for(var i = 0 ; i < response['list'].length ; i++){
                        self.forecast.push(response['list'][i]);
                    }
                }
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
        setColor: function(){
          this.$store.commit('setNavColor','orange darken-4 elevation-4')
        },
        getUser: function(){
            var self = this;
            //get user session
              var poolData = {
                UserPoolId : 'us-east-1_goFP3BH4F', // Your user pool id here
                ClientId : '6qeame6mco8k9ugefbpord4pdp' // Your client id here
              };
              var userPool = new CognitoUserPool(poolData);
              var cognitoUser = userPool.getCurrentUser();

              if (cognitoUser != null) {
                  cognitoUser.getSession(function(err, session) {
                    if(session){
                      console.log('session validity: ' + session.isValid());
                      if(session.isValid() === true){
                        self.$store.commit('authorizeUser',true);
                      }
                      
                    }
                    else{
                      alert(err.message);
                    }
                      
                      // NOTE: getSession must be called to authenticate user before calling getUserAttributes
                      cognitoUser.getUserAttributes(function(err, attributes) {
                          // if (err) {
                          //     // Handle error
                          // } else {
                              // Do something with attributes
                              console.log("user attributes: " + attributes)
                              self.$store.commit('setUser',attributes);

                          //}
                      });

                      // AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                      //     IdentityPoolId : '...', // your identity pool id here
                      //     Logins : {
                      //         // Change the key below according to the specific region your user pool is in.
                      //         'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>' : session.getIdToken().getJwtToken()
                      //     }
                      // });

                      // Instantiate aws sdk service objects now that the credentials have been updated.
                      // example: var s3 = new AWS.S3();

                  });
              }
        }
    },
    computed: {
      auth (){
        return this.$store.getters.getAuth
      },
      city (){
        return this.$store.getters.getDirections.destinationCity
      },
      todayDate(){
        var date = new Date();
        return moment(date).format('YYYY-MM-DD');
      }
    },
    beforeMount(){
        this.getToday();
        this.getForecast();
        this.setNav();
        this.setColor();
    }
}
</script>

