<template>
  <ion-app>
    <Transition name="fade">
      <loading-view v-if="isLoading" @finished-loading="isLoading = false" />
    </Transition>
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>