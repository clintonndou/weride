import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        navItems: [],
        activePage: 'index',
        color: 'header',
        isAuth: false,
        authProvider: null,
        email: null,
        user: {
            sub: null,
            name: null,
            surname: null,
            phone: null,
            email: null,
            gender: null,
            address: null,
            picture: null
        },
        snakbar: {
            show: false,
            text: ""
        },
        location: {
            location: null,
            destination: null,
            locationCity: null,
            destinationCity: null,
            locationSublocality: null,
            destinationSublocality: null,
            locationProvince: null,
            destinationProvince: null
        }
    },
     mutations: {
         setUser(state,user){
             state.user.sub = user.sub
             state.user.name = user.name
             state.user.surname = user.surname
             state.user.phone = user.phone
             state.user.gender = user.gender
             state.user.email = user.email
             state.user.address = user.address
             state.user.picture = user.picture
         },
         setLocation(state,props){
            state.location.location = props.location
            state.location.destination = props.destination
            state.location.locationCity = props.locationCity
            state.location.destinationCity = props.destinationCity
            state.location.locationSublocality = props.locationSublocality
            state.location.destinationSublocality = props.destinationSublocality
            state.location.locationProvince = props.locationProvince
            state.location.destinationProvince = props.destinationProvince
         },
         setPageNav(state,navs){
            state.navItems = navs
         },
         setNavColor(state,color){
            state.color = color
        },
        storeEmail(state,email){
            state.email = email
        },
        authorizeUser(state,auth){
            state.isAuth = auth
        },
        setAuth(state,provider){
            state.authProvider = provider
        },
        showSnackBar(state,data){
            state.snakbar.show = data.show
            state.snakbar.text = data.text
        }
     },
     getters: {
         getUser: state => state.user,
         getEmail: state => state.email,
         getNavs: state => state.navItems,
         getPage: state => state.activePage,
         getColor: state => state.color,
         getAuth: state => state.isAuth,
         getSnackBar: state => state.snakbar,
         getDirections: state => state.location,
         getAuthProvider: state => state.authProvider
     }
})