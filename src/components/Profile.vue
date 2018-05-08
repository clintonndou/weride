<template>
  <v-layout row class="mt-0 mb-5">
    <v-flex xs12 sm12 md12 class="mt-4" v-show="loader">
      <div class="text-xs-center text-sm-center">
        <p>updating profile</p>
        <v-progress-circular indeterminate :width="3" color="primary"></v-progress-circular>
      </div>
    </v-flex>
    <v-flex xs12 sm6 offset-sm3 v-show="!loader">
      <v-card>
        <v-card-media src="/static/images/background.png" class="primary" height="120px" v-show="!auth">
          <v-layout column class="media">
          </v-layout>
        </v-card-media>
        <v-card-media src="/static/images/background.png" class="primary" height="120px" v-show="auth">
          <v-layout column class="media">
            <v-layout center-align justify-center>
              <v-avatar
                :size="avatarSize"
                class="grey lighten-4 mt-3"
              >
                <img :src="picture" alt="avatar">
              </v-avatar>
            </v-layout>
          <v-layout center-align justify-center>
            <p class="grey--text lighten-1" style="margin-top: 70px;">{{user.name}} {{user.surname}}</p>
          </v-layout>
            <v-spacer></v-spacer>
            <v-card-title class="white--text pl-5 pt-5">
              <div class="display-1 pl-5 pt-5"></div>
            </v-card-title>
          </v-layout>
        </v-card-media>
        <v-list two-line v-show="auth && !edit">
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="secondary">account_circle</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{user.name}} {{user.surname}}</v-list-tile-title>
              <v-list-tile-sub-title>Account holder</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider inset></v-divider>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="secondary">phone</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{user.phone}}</v-list-tile-title>
              <v-list-tile-sub-title>Mobile</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider inset></v-divider>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="secondary">mail</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{user.email}}</v-list-tile-title>
              <v-list-tile-sub-title>Email</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider inset></v-divider>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="secondary">location_on</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{user.address}}</v-list-tile-title>
              <v-list-tile-sub-title>Address</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-list two-line v-show="edit">
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="secondary">person</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-text-field v-model="name" name="name" label="Firstname" type="text"></v-text-field>
              <v-list-tile-sub-title></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="secondary">person</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-text-field v-model="surname" name="surname" label="Lastname" type="text"></v-text-field>
              <v-list-tile-sub-title></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="secondary">phone</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-text-field v-model="phone" name="phone" placeholder="+27738493874" label="Phone Number" type="text"></v-text-field>
              <v-list-tile-sub-title></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="secondary">location_on</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-text-field v-model="address" name="address" label="Address" placeholder="Line 1, Line 2, City, Code" type="text"></v-text-field>
              <v-list-tile-sub-title></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-btn @click="updateProfile()" block flat color="secondary">Save changes</v-btn>
        </v-list>
        <v-card-actions v-show="!auth">
          <v-btn block flat color="secondary">Sign in</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-flex xs12 sm12 md12 style="position: fixed; bottom: 30px; right: 25px" v-show="!edit && authProvider == 'amazon'">
        <v-btn
              dark
              fab
              top
              color="pink"
               class="mb-3"
              @click="editProfile()"
        >
        <v-icon>edit</v-icon>
        </v-btn>
    </v-flex>
    <v-flex xs12 sm12 md12 style="position: fixed; bottom: 30px; right: 25px" v-show="edit">
        <v-btn
              dark
              fab
              top
              color="pink"
               class="mb-3"
              @click="edit = false"
        >
        <v-icon>arrow_back</v-icon>
        </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
import {Config, CognitoIdentityCredentials } from 'aws-sdk'
import {CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute} from 'amazon-cognito-identity-js'  

export default {
  name: 'HelloWorld',
  data () {
    return {
      edit: false,
      name: null,
      surname: null,
      phone: null,
      address: null,
      email: null,
      picture: null,
      facebook: false,
      amazon: false,
      google: false,
      loader: false,
      avatarSize: 60,
      navItems: [
          {icon:"home", title:"Home", url:"/home"},
          {icon:"directions", title:"Directions", url:"/directions"},
          {icon:"wb_sunny", title:"Weather", url:"/weather"}
        ],
        snackbar: {
        show: false,
        text: ""
      }
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
      editProfile(){
        this.edit = true
      },
      profile(){
        this.edit = false
      },
      updateProfile(){
        var self = this;
        //show loader
        this.loader = true;

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
            }
            else{
              console.log(err)
            }
            cognitoUser.getUserAttributes(function(err,attribute){
          if(attribute){
            console.log(attribute)
          }
          else{
            console.log(err)
          }
        })

        var attributeList = [];

        var dataName = {
                Name : 'name',
                Value : self.name
            };

            var dataSurname = {
                 Name : 'family_name',
                 Value : self.surname
            };

            var dataAddress = {
                 Name : 'address',
                 Value : self.address
            };

            var dataPhoneNumber = {
                 Name : 'phone_number',
                 Value : self.phone
            };
            
            var attributeName = new CognitoUserAttribute(dataName);
            var attributeSurname = new CognitoUserAttribute(dataSurname);
            var attributeAddress = new CognitoUserAttribute(dataAddress);
            var attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);

            attributeList.push(attributeName);
            attributeList.push(attributeSurname);
            attributeList.push(attributeAddress);
            attributeList.push(attributePhoneNumber);
            
            cognitoUser.updateAttributes(attributeList, function(err, result){
                if(result){
                  self.loader = false
                  self.edit = false
                  //show login success
                  self.snackbar.show = true;
                  self.snackbar.text = "Profile updated" ;
                  self.$store.commit('showSnackBar',self.snackbar);
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
                              }
                              self.$store.commit('setUser',self.user);


                          //}
                      });
                }else{
                  self.loader = false;
                  self.snackbar.show = true;
                  self.snackbar.text = err.message ;
                  self.$store.commit('showSnackBar',self.snackbar);
                }
            });
          })
        }
      }
    },
    computed: {
      auth (){
        return this.$store.getters.getAuth
      },
      authProvider (){
        return this.$store.getters.getAuthProvider
      },
      user (){
        var user = this.$store.getters.getUser
        this.name = user.name
        this.surname = user.surname
        this.phone = user.phone
        this.address = user.address
        this.email = user.email
        this.picture = user.picture
        return user
      }
    },
    beforeMount(){
        this.setNav();
        this.setColor();
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
