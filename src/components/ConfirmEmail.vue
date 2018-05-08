<template>
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 class="text-xs-center text-sm-center" v-show="loader">
                <p>{{loaderText}}</p>
                <v-progress-circular indeterminate :width="3" color="red"></v-progress-circular>
          </v-flex>
          <v-flex xs12 sm8 md4 v-show="!loader">
            <v-card class="elevation-2">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Email verification</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-alert outline color="success" icon="check_circle" :value="true">
                    a verification code has been sent to {{ userEmail }}
                  </v-alert>  
                  <v-text-field v-model="verificationCode" prepend-icon="verified_user" name="code" label="Enter verification code" type="number"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" v-on:click="resendVerification">Resend code</v-btn>
                <v-btn color="primary" v-on:click="verifyAccount">verify</v-btn>
              </v-card-actions>
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
    data () {
      return {
        verificationCode: null,
        verificationEmail: null,
        navItems: [],
        snackbar: {
          show: false,
          text: ""
        },
        loader: false,
        loaderText: '',
        alert: false,
        error: ""
      }
    },
    methods: {
      setNav: function(){
        this.$store.commit('setPageNav',this.navItems);
      },
      setColor: function(){
        this.$store.commit('setNavColor','hide')
      },
      verifyAccount: function(){
            var self = this;
            self.loader = true;
            self.loaderText = 'verifying';
            var poolData = {
                UserPoolId : 'us-east-1_goFP3BH4F', // Your user pool id here
                ClientId : '6qeame6mco8k9ugefbpord4pdp' // Your client id here
            };

            var userPool = new CognitoUserPool(poolData);
            var userData = {
                Username : self.verificationEmail,
                Pool : userPool
            };

            var cognitoUser = new CognitoUser(userData);
            cognitoUser.confirmRegistration(self.verificationCode, true, function(err, result) {
                if (err) {
                    console.log(err);
                    self.snackbar.text = err.message;
                    self.snackbar.show = true;
                    self.$store.commit('showSnackBar',self.snackbar);
                    self.loader = false;
                }
                else{
                    console.log('call result: ' + result);
                    self.snackbar.text = "email verified";
                    self.snackbar.show = true;
                    self.$store.commit('showSnackBar',self.snackbar);
                    //signin user
                    self.signin();
                }
                
            });
        },
        resendVerification: function(){
            var self = this;
            self.loader = true;
            self.loaderText = 'sending verification code';
            var poolData = {
                UserPoolId : 'us-east-1_goFP3BH4F', // Your user pool id here
                ClientId : '6qeame6mco8k9ugefbpord4pdp' // Your client id here
            };

            var userPool = new CognitoUserPool(poolData);
            var userData = {
                Username : self.verificationEmail,
                Pool : userPool
            };

            var cognitoUser = new CognitoUser(userData);
            cognitoUser.resendConfirmationCode(function(err, result) {
              if(result){
                self.snackbar.text = "verification code sent";
                self.snackbar.show = true;
                self.$store.commit('showSnackBar',self.snackbar);
                self.loader = false;
              }else{
                self.snackbar.text = err.message
                self.snackbar.show = true
                self.$store.commit('showSnackBar',self.snackbar);
              }
                    
            });
        },
        signin: function(){
            var self = this;
            self.loader = true;
            self.loaderText = 'loading';
            self.$router.push('login');
        }
    },
    computed: {
      userEmail(){
        this.verificationEmail = localStorage['userEmail']
        return this.verificationEmail
      }
    },
    beforeMount(){
        this.setNav();
        this.setColor();
    }
  }
</script>