<template>
    <v-content >
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm12 md12 v-show="loader">
            <div class="text-xs-center text-sm-center" v-show="loader">
                <p>signing up</p>
                <v-progress-circular indeterminate :width="3" color="primary"></v-progress-circular>
            </div>
          </v-flex>
          <v-flex xs12 sm12 md6 v-show="!loader" style="margin-top: -110px;">
            <v-card class="elevation-2 pb-3">
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
            <v-toolbar dark color="primary">
                <v-layout justify-center align-center>
                  <v-toolbar-title>Sign up</v-toolbar-title>
                </v-layout>
              </v-toolbar>
            <v-card class="elevation-2">
              <v-card-text>
                <v-alert
                outline 
                color="error" 
                icon="warning"
                :value="alert"
                transition="scale-transition"
                >
                    {{error}}
                </v-alert>
                <h5 class="grey--text text-xs-center text-sm-center">Enter your details below to create an account <br><small>*indicates required field</small></h5>
                
                <v-text-field v-model="name" prepend-icon="person" :rules="[rules.required]" required name="name" label="Firstname" type="text"></v-text-field>
                  <v-text-field v-model="surname" prepend-icon="person" :rules="[rules.required]" required name="surname" label="Lastname" type="text"></v-text-field> 
                  <v-select
                    :items="genders"
                    v-model="gender"
                    label="Gender"
                    single-line
                    auto
                    prepend-icon="person"
                    hide-details
                    class="mb-4"
                    ></v-select>
              </v-card-text>
            </v-card>
            <v-card class="elevation-2 mt-3">
              <v-card-text> 
                  <v-text-field v-model="addressLine1" prepend-icon="location_on" name="address" label="Address" placeholder="Line 1, Line 2, City, Code" type="text"></v-text-field>
                  <v-text-field v-model="phone" prepend-icon="phone" name="phone" hint="Start with country code, for example +27738493874" label="Phone Number" type="text"></v-text-field>
              </v-card-text>
            </v-card>
            <v-card class="elevation-2 mt-3">
              <v-card-text>
                  <v-text-field v-model="email" required prepend-icon="email" name="login" :rules="[rules.required, rules.email]" label="Email" type="text"></v-text-field>
                  <v-text-field v-model="password" prepend-icon="lock" name="password" label="Password" hint="At least 6 characters, uppercase letter, lowercase letter and a number" id="password" type="password"></v-text-field>
                  <v-text-field v-model="password2" prepend-icon="lock" name="password2" label="Confirm Password" type="password"></v-text-field>
              </v-card-text>
              <v-layout justify-center align-center>
                <v-card-actions>
                  <router-link to="/login" tag="span"><v-btn flat color="primary">Sign in</v-btn></router-link>
                  <v-btn color="primary" v-on:click="signup">Sign up</v-btn>
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
      alert: false,
      error: "",
      loader: false,
      genders: ["Male","Female"],
      navItems: [],
      email: null,
      password: null,
      password2: null,
      name: null,
      surname: null,
      gender: null,
      phone: null,
      successEmail: null,
      addressLine1: null,
      tile: true,
      user: {
            sub: '',
            name: '',
            surname: '',
            phone: '',
            email: '',
            gender: '',
            address: ''
        },
      snackbar: {
        show: false,
        text: ""
      },
      rules: {
          required: (value) => !!value || 'Required.',
          email: (value) => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          }
        }
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
        signup: function(){
            //show loader
            this.loader = true;

            var poolData = {
                UserPoolId : 'us-east-1_goFP3BH4F', // Your user pool id here
                ClientId : '6qeame6mco8k9ugefbpord4pdp' // Your client id here
            };
            var userPool = new CognitoUserPool(poolData);

            var attributeList = [];

            var dataName = {
                Name : 'name',
                Value : this.name
            };

            var dataSurname = {
                 Name : 'family_name',
                 Value : this.surname
            };

            var dataGender = {
                 Name : 'gender',
                 Value : this.gender
            };

            var dataAddress = {
                 Name : 'address',
                 Value : this.addressLine1
            };

            var dataEmail = {
                 Name : 'email',
                 Value : this.email
            };

            var dataPhoneNumber = {
                 Name : 'phone_number',
                 Value : this.phone
            };
            
            var attributeName = new CognitoUserAttribute(dataName);
            var attributeSurname = new CognitoUserAttribute(dataSurname);
            var attributeGender = new CognitoUserAttribute(dataGender);
            var attributeAddress = new CognitoUserAttribute(dataAddress);
            var attributeEmail = new CognitoUserAttribute(dataEmail);
            var attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);

            attributeList.push(attributeName);
            attributeList.push(attributeSurname);
            attributeList.push(attributeGender);
            attributeList.push(attributeEmail);
            attributeList.push(attributeAddress);
            attributeList.push(attributePhoneNumber);
            var self = this;
            userPool.signUp(this.email, this.password, attributeList, null, function(err, result){
                if(result){
                  var cognitoUser = result.user;
                  //show login success
                  self.snackbar.show = true;
                  self.snackbar.text = "Registered as " + cognitoUser.getUsername() ;
                  self.$store.commit('showSnackBar',self.snackbar);
                  self.alert = false;
                  console.log(result)
                  //show confirm
                  self.successEmail = cognitoUser.getUsername();
                  //store email in local host
                  localStorage['userEmail'] = self.successEmail;
                  //redirect
                  self.$router.push('verifyEmail');
                }else{
                  self.loader = false;
                  self.alert = true;
                  self.error = err.message;
                  
                }
            });
          }
    },
    computed: {
      auth (){
        return this.$store.getters.getAuth
      }
    },
    beforeMount(){
        this.setColor();
    }
  }
</script>