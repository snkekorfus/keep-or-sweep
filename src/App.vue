<template>
  <ion-app>
    <loading-view :isLoading="isLoading" @finished-loading="() => isLoading = false" />
    <ion-router-outlet v-if="!isLoading" />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import LoadingView from './views/LoadingView.vue';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    LoadingView
  },
  data() {
    return { isLoading: true };
  }
});
</script>