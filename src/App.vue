<template>
  <div id="app">
    <v-app id="inspire">
    <v-navigation-drawer
      temporal
      v-model="drawer"
      app
      disable-resize-watcher
    >
      <v-list class="pa-0">
          <v-list-tile avatar v-show="!auth">
            <v-list-tile-avatar>
              <img src="/static/images/avatar.svg" >
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>Not signed in</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-list class="pa-0">
          <v-list-tile avatar v-show="auth">
            <v-list-tile-avatar>
              <img :src="userInfo.picture" >
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title><router-link to="/profile" tag="span" style="cursor: pointer">{{ userInfo.name }} {{ userInfo.surname }}</router-link></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      <v-list class="pt-0" dense>
        <v-divider></v-divider>
        <v-list-tile 
          v-for="item in navs" 
          :key="item.title"
          router
          :to="item.url">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar v-bind:class="colors" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{ path }}</v-toolbar-title>
      <v-spacer></v-spacer>
        <v-btn class="hidden-xs-only" icon v-for="item in navs" 
          :key="item.title"
          router
          :to="item.url">
          <v-icon>{{item.icon}}</v-icon>
        </v-btn>
    </v-toolbar>
    <v-content>
      <div id="app" v-if="hydrated">
        <router-view/>
        <v-snackbar
            :timeout="timeout"
            :top="y === 'top'"
            :bottom="y === 'bottom'"
            :right="x === 'right'"
            :left="x === 'left'"
            :multi-line="mode === 'multi-line'"
            :vertical="mode === 'vertical'"
            v-model="snackbar.show"
          >
            {{ snackbar.text }}
            <v-btn flat color="primary" @click.native="snackbar.show = false">Close</v-btn>
          </v-snackbar>
      </div>
    </v-content>
  </v-app>
  </div>
</template>

<script>
import {Config, CognitoIdentityCredentials } from 'aws-sdk'
import {CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute} from 'amazon-cognito-identity-js'  

  export default {
    name: "Home",
    data () {
      return {
        disable: true,
        show: false,
        drawer: false,
        navItems: [
        ],
        navClass: 'header' ,
        user: {
            sub: '',
            name: '',
            surname: '',
            phone: '',
            email: '',
            gender: '',
            address: '',
            picture: ''
        },
        y: 'bottom',
        x: null,
        mode: '',
        timeout: 3000,
        hydrated: false
      }
    },
    async mounted() {
      await this.$apollo.provider.defaultClient.hydrated();
      this.hydrated = true
    },
    methods: {
      setNav: function(){
        //this.$store.commit('setPageNav',this.navItems);
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
                        //set auth to facebook
                        self.$store.commit('setAuth','amazon');
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
                              for(var i = 0; i < attributes.length; i++ ){
                                if(attributes[i]['Name'] === 'sub'){
                                  self.user.sub = attributes[i]['Value']
                                }
                                if(attributes[i]['Name'] === 'name'){
                                  self.user.name = attributes[i]['Value']
                                }
                                if(attributes[i]['Name'] === 'family_name'){
                                  self.user.surname = attributes[i]['Value']
                                }
                                if(attributes[i]['Name'] === 'phone_number'){
                                  self.user.phone = attributes[i]['Value']
                                }
                                if(attributes[i]['Name'] === 'gender'){
                                  self.user.gender = attributes[i]['Value']
                                }
                                if(attributes[i]['Name'] === 'address'){
                                  self.user.address = attributes[i]['Value']
                                }
                                if(attributes[i]['Name'] === 'email'){
                                  self.user.email = attributes[i]['Value']
                                }
                                self.user.picture = "/static/images/avatar.svg"
                              }
                              self.$store.commit('setUser',self.user);
                              self.setNav()

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
              else{
                //check google
                      function onSignIn(googleUser){
                        if(googleUser){
                          self.$store.commit('setAuth','google');
                          self.$store.commit('authorizeUser',true);

                          var profile = googleUser.getBasicProfile();
                          self.user.sub = profile.getId()
                          self.user.name = profile.getGivenName()
                          self.user.surname = profile.getFamilyName()
                          self.user.email = profile.getEmail()
                          self.user.address = "Not Provided"
                          self.user.phone = "Not Provided"
                          self.user.picture = profile.getImageUrl()

                          self.$store.commit('setUser',self.user);
                          self.setNav()
                        }
                      }
                      if(gapi){
                        gapi.load('auth2', function(){
                            // Retrieve the singleton for the GoogleAuth library and set up the client.
                            var auth2 = gapi.auth2.init({
                              client_id: '359999308113-dnmkojdqtghq7inubpp9h8439282c7rg.apps.googleusercontent.com',
                              cookiepolicy: 'single_host_origin',
                              // Request scopes in addition to 'profile' and 'email'
                              //scope: 'additional_scope'
                            }).then(function(auth2){
                              if(auth2.isSignedIn.get()){
                                console.log("Signed in")
                                onSignIn(auth2.currentUser.get())
                              }
                              else{
                                if(FB){
                                  //check facebook
                                  FB.getLoginStatus(function(response) {
                                    console.log("facebook Status",response)
                                      if(response.status === 'connected'){
                                        //set auth to facebook
                                        self.$store.commit('setAuth','facebook');
                                        self.$store.commit('authorizeUser',true);

                                        FB.api('/me',{fields: "id,email,picture,first_name,last_name,name,gender,hometown"},function(response){
                                          console.log("fb_user_connected",response)
                                          
                                          if(response.error){
                                            self.snackbar.show = true
                                            self.snackbar.text = "Error signing in with facebook, please try again"
                                            self.$store.commit('showSnackBar',self.snackbar);
                                            self.$store.commit('setAuth',null);
                                            self.$store.commit('authorizeUser',false);
                                          }
                                          else{
                                            self.user.sub = response.id
                                            self.user.name = response.first_name
                                            self.user.surname = response.last_name
                                            self.user.email = response.email
                                            self.user.address = response.hometown.name
                                            self.user.picture = response.picture.data.url
                                            self.user.phone = "Not Provided"
                                            self.$store.commit('setUser',self.user);
                                          }
                                          self.setNav()
                                        })
                                      }
                                      else{
                                        self.setNav()
                                      }
                                  })
                                }
                                }
                            });
                        });
                    }
              }
        }
    },
    beforeMount(){
      this.getUser();
    },
    computed: {
      navs (){
        return this.$store.getters.getNavs
      },
      colors (){
        return this.$store.getters.getColor
      },
      path (){
        return this.$route.name
      },
      auth (){
        return this.$store.getters.getAuth
      },
      authProvider (){
        return this.$store.getters.getAuthProvider
      },
      userInfo (){
        return this.$store.getters.getUser
      },
      snackbar (){
        return this.$store.getters.getSnackBar
      }
    }
  }
</script>

<style>
</style>

