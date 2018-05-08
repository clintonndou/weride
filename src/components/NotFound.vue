<template>
    <v-content style="margin-top: -100px;">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 class="text-xs-center text-sm-center">
                <p>404 - Not Found</p>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
</template>

<script>
  export default {
    data: () => ({
      navItems: [],
    }),
    methods: {
        setColor: function(){
          this.$store.commit('setNavColor','hide')
        }
    },
    beforeMount(){
        this.setColor();
    }
  }
</script>