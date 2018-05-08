import Vue from 'vue'
import App from './App'
import router from './router'
import Materialize from 'materialize-css'
import Moment from 'moment'
import Vuetify from 'vuetify'
import { store } from './store'
import cors from 'cors'
import AWSAppSyncClient from 'aws-appsync'
import VueApollo from 'vue-apollo'
import appSyncConfig from './AppSync'

// index.js or main.js
import 'jquery/dist/jquery.min.js'
import 'vuetify/dist/vuetify.min.css'

const client = new AWSAppSyncClient({
  url: appSyncConfig.graphqlEndpoint,
  region: appSyncConfig.region,
  auth: {
    type: appSyncConfig.authenticationType,
    apiKey: appSyncConfig.apiKey
  }
},{
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    }
  }
})

const appsyncProvider = new VueApollo({
  defaultClient: client
})
 
Vue.use(Vuetify,{theme: {
  primary: "#E64A19",
  secondary: "#FF6E40",
  accent: "#2E7D32",
  error: "#f44336",
  warning: "#ffeb3b",
  info: "#2196f3",
  success: "#4caf50"
}})

Vue.config.productionTip = false
Vue.use(VueApollo)
Vue.use(cors)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  provide: appsyncProvider.provide(),
  render: h => h(App)
})
