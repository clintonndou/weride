<template>
    <v-content style="margin-top: 100px;">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 class="text-xs-center text-sm-center">
                <p>signing out</p>
                <v-progress-circular indeterminate :width="3" color="primary"></v-progress-circular>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
</template>

<script>
import {Config, CognitoIdentityCredentials } from 'aws-sdk'
import {CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute} from 'amazon-cognito-identity-js'  

  export default {
    data () {
      return {
        navItems: [],
        snackbar: {
          show: false,
          text: ""
        }
      }
    },
    methods: {
      signOut: function(){
        //set nav color
        this.$store.commit('setNavColor','orange darken-4 elevation-4')
        var self = this;
        
        if(self.authProvider === 'facebook'){
          FB.logout(function(response){
            console.log("facebook",response)
            //if logout successful set auth to false
            self.$store.commit('authorizeUser',false);

            //show login success
            self.snackbar.show = true;
            self.snackbar.text = "signed out";
            self.$store.commit('showSnackBar',self.snackbar);
            self.routeIndex();
          })
        }
        if(self.authProvider === 'google'){
          var auth2 = gapi.auth2.getAuthInstance();
          auth2.signOut()
          .then(function(){
            console.log("Signed out")
            //if logout successful set auth to false
            self.$store.commit('authorizeUser',false);

            //show login success
            self.snackbar.show = true;
            self.snackbar.text = "signed out";
            self.$store.commit('showSnackBar',self.snackbar);
            self.routeIndex();
          })
        }
        if(self.authProvider === 'amazon'){
          //sign out user
          var poolData = {
            UserPoolId : 'us-east-1_goFP3BH4F', // Your user pool id here
            ClientId : '6qeame6mco8k9ugefbpord4pdp' // Your client id here
          };
          var userPool = new CognitoUserPool(poolData);
          var cognitoUser = userPool.getCurrentUser();

          if (cognitoUser != null) {
            cognitoUser.getSession(function(err, session) {
              if(session){
                cognitoUser.signOut();
                //if logout successful set auth to false
                self.$store.commit('authorizeUser',false);

                //show login success
                self.snackbar.show = true;
                self.snackbar.text = "signed out";
                self.$store.commit('showSnackBar',self.snackbar);
                self.routeIndex();
              }
              else{
                //show error
                self.snackbar.show = true
                self.snackbar.text = err.message
                self.$store.commit('showSnackBar',self.snackbar);
              }
            })
          }
        }
      },
      routeIndex: function(){
        this.$router.push('/')
      }
    },
    computed: {
      authProvider (){
        return this.$store.getters.getAuthProvider
      },
    },
    beforeMount(){
        this.signOut();
    }
  }
</script>