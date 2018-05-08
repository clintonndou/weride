<template>
    <v-content style="margin-top: -100px;">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 class="text-xs-center text-sm-center" v-show="loader">
                <p>signing in</p>
                <v-progress-circular indeterminate :width="3" color="primary"></v-progress-circular>
          </v-flex>
          <v-flex xs12 sm8 md4 v-show="!loader">
            <v-card class="elevation-12 pb-3">
              <v-card-text> 
                <h5 class="grey--text text-xs-center text-sm-center">Sign in with facebook or Google</h5>
              </v-card-text>
              <v-layout wrap justify-space-around align-center>
                <v-card-actions>
                  <v-avatar size="90" :tile="tile" style="cursor:pointer" v-on:click="facebookSignIn">
                    <img src="/static/images/facebook-2048127_640.png" alt="facebook">
                  </v-avatar>
                  <v-avatar size="90" :tile="tile" style="cursor:pointer" id="customBtn" v-on:click="googleSignIn">
                    <img src="/static/images/google-2151048_640.png" alt="google">
                  </v-avatar>
                </v-card-actions>
              </v-layout>
            </v-card>
            <v-card class="elevation-12" style="margin-top: -10px;">
              <v-toolbar dark color="primary" class="elevation-0">
                <v-layout justify-center align-center>
                  <v-toolbar-title>Sign in</v-toolbar-title>
                </v-layout>
              </v-toolbar>
              <v-card-text>
                <h5 class="grey--text text-xs-center text-sm-center">Have an account? <br><small>Enter your email address and password to continue</small></h5>
                <v-alert
                outline 
                color="error" 
                icon="warning"
                :value="alert"
                transition="scale-transition"
                >
                    {{error}}
                </v-alert>
                <v-form>
                  <v-text-field v-model="username" prepend-icon="person" name="login" label="email" type="text"></v-text-field>
                  <v-text-field v-model="password" prepend-icon="lock" name="password" label="Password" id="password" type="password"></v-text-field>
                </v-form>
              </v-card-text>
              <v-layout justify-center align-center>
                <v-card-actions>
                  <router-link to="/register" tag="span"><v-btn flat color="primary">Sign up</v-btn></router-link>
                  <v-btn color="primary" v-on:click="signIn">Sign in</v-btn>
                </v-card-actions>
              </v-layout>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
</template>

<script>
import {Config, CognitoIdentityCredentials } from 'aws-sdk'
import {CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute} from 'amazon-cognito-identity-js'  

  export default {
    data: () => ({
      navItems: [],
      username: null,
      password: null,
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
      snackbar: {
        show: false,
        text: ""
      },
      loader: false,
      alert: false,
      error: "",
      tile: true
    }),
    methods: {
        setColor: function(){
          this.$store.commit('setNavColor','hide')
        },
        facebookSignIn: function(){
          var self = this;
          self.loader = true;
          console.log("facebook login started")

          function onSignIn(){
            FB.api('/me',{fields: "id,email,picture,first_name,last_name,name,gender,hometown"},function(response){
              console.log("fb_user_connected",response)
              if(response.error){
                self.snackbar.show = true
                self.snackbar.text = "Error signing in with facebook, please try again"
                self.$store.commit('showSnackBar',self.snackbar);
                self.loader = false;
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
                //show login success
                self.snackbar.show = true
                self.snackbar.text = "signed in"
                self.$store.commit('showSnackBar',self.snackbar);
                self.$router.push('home')
              }
            })
          }

          function login(){
            FB.login(function(response){
              console.log("facebook Login",response)
              //set auth to facebook
              if(response.authResponse){
                self.$store.commit('setAuth','facebook');
                self.$store.commit('authorizeUser',true);
                onSignIn()
              }
              else if(response.error){
                self.snackbar.show = true
                self.snackbar.text = "Error signing in with facebook, please try again"
                self.$store.commit('showSnackBar',self.snackbar);
                self.loader = false;
              }
              else{
                self.snackbar.show = true
                self.snackbar.text = "Error signing in with facebook, please try again"
                self.$store.commit('showSnackBar',self.snackbar);
                self.loader = false;
              }
            },{scope: 'public_profile,email,user_hometown'})
          }

          if(typeof(FB) != 'undefined'){
            console.log("FB defined and loading")
            FB.getLoginStatus(function(response) {
            console.log("facebook Status",response)
              if(response.status === 'connected'){
                //set auth to facebook
                self.$store.commit('setAuth','facebook');
                self.$store.commit('authorizeUser',true);
                onSignIn()
              }
              else if(response.status === 'not_authorized'){
                login()
              }
              else{
                login()
              }
          });
          }
          else{
            self.snackbar.show = true
            self.snackbar.text = "Error signing in with facebook, please try again"
            self.$store.commit('showSnackBar',self.snackbar);
            self.loader = false;
          }
        },
        googleSignIn: function(){
          var self = this;
          self.loader = true;

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
              //show login success
              self.snackbar.show = true
              self.snackbar.text = "signed in"
              self.$store.commit('showSnackBar',self.snackbar);
              self.$router.push('home')
            }
          }
          if(typeof(gapi) != 'undefined'){
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
                  auth2.signIn().then(function(e){
                    onSignIn(e);
                  })
                  .catch(function(err){
                    self.snackbar.show = true
                    self.snackbar.text = "Error signing in with google, please try again"
                    self.$store.commit('showSnackBar',self.snackbar);
                    self.loader = false;
                  })
                }
              })
              .catch(function(err){
                self.snackbar.show = true
                self.snackbar.text = "Error signing in with google, please try again"
                self.$store.commit('showSnackBar',self.snackbar);
                self.loader = false;
              })
            });
          }
          else{
            self.snackbar.show = true
            self.snackbar.text = "Error signing in with google, please try again"
            self.$store.commit('showSnackBar',self.snackbar);
            self.loader = false;
          }
        },
        signIn: function(){
            var self = this;
            self.loader = true;

            var authenticationData = {
                Username : this.username,
                Password : this.password,
            };

            var authenticationDetails = new AuthenticationDetails(authenticationData);
            var poolData = {
                UserPoolId : 'us-east-1_goFP3BH4F', // Your user pool id here
                ClientId : '6qeame6mco8k9ugefbpord4pdp' // Your client id here
            };
            var userPool = new CognitoUserPool(poolData);
            var userData = {
                Username : this.username,
                Pool : userPool
            };
            var cognitoUser = new CognitoUser(userData);
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                    console.log('access token + ' + result.getAccessToken().getJwtToken());
                    self.getUser();
                    // //POTENTIAL: Region needs to be set if not already set previously elsewhere.
                    // AWS.config.region = 'us-east-1';


                    // AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    //      IdentityPoolId : 'us-east-1_goFP3BH4F', // your identity pool id here
                    //      Logins : {
                    //          // Change the key below according to the specific region your user pool is in.
                    //          'cognito-idp.us-east-1.amazonaws.com/us-east-1_goFP3BH4F' : result.getIdToken().getJwtToken()
                    //      }
                    //  });

                    //  //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
                    //  AWS.config.credentials.refresh((error) => {
                    //      if (error) {
                    //          console.error(error);
                    //      } else {
                    //          // Instantiate aws sdk service objects now that the credentials have been updated.
                    //          // example: var s3 = new AWS.S3();
                    //          console.log('Successfully logged!');
                    //      }
                    //  });
                },
                onFailure: function(err) {
                    self.loader = false;
                    console.log(err);
                    self.error = err.message;
                    self.alert = true;
                    if(err.code == 'UserNotConfirmedException'){
                      self.$router.push('verifyEmail')
                    }
                    else{
                      self.snackbar.show = true
                      self.snackbar.text = "Error signing in, please try again"
                      self.$store.commit('showSnackBar',self.snackbar);
                      self.loader = false;
                    }

                },

            });
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
                      //show error message
                      self.snackbar.show = true
                      self.snackbar.text = err.message
                      self.$store.commit('showSnackBar',self.snackbar);
                    }
                      
                      // NOTE: getSession must be called to authenticate user before calling getUserAttributes
                      cognitoUser.getUserAttributes(function(err, attributes) {
                        if(attributes != null){
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
                              //show login success
                              self.snackbar.show = true
                              self.snackbar.text = "signed in"
                              self.$store.commit('showSnackBar',self.snackbar);
                              self.$router.push('home')
                        }else{
                          //show error
                          self.snackbar.show = true
                          self.snackbar.text = err.message
                          self.$store.commit('showSnackBar',self.snackbar);
                        }
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
    },
    beforeMount(){
        this.setColor();
    }
  }
</script>