import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import IndexPage from '@/components/IndexPage'
import Directions from '@/components/Directions'
import Weather from '@/components/Weather'
import Profile from '@/components/Profile'
import Login from '@/components/Login'
import Register from '@/components/Register'
import Logout from '@/components/Logout'
import ConfirmEmail from '@/components/ConfirmEmail'
import NotFound from '@/components/NotFound'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'weride',
      component: IndexPage
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/directions',
      name: 'Directions',
      component: Directions
    },
    {
      path: '/weather',
      name: 'Weather',
      component: Weather
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '*',
      name: '404 - Not found',
      component: NotFound
    },
    {
      path: '/login',
      name: 'Sign in',
      component: Login
    },
    {
      path: '/register',
      name: 'Sign up',
      component: Register
    },
    {
      path: '/logout',
      name: 'Sign out',
      component: Logout
    },
    {
      path: '/verifyEmail',
      name: 'Account Verification',
      component: ConfirmEmail
    }
  ],
  mode: 'history'
})
