import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Swipe from '../views/SwipePage.vue';
import Info from '../views/InfoView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/swipe'
  },
  {
    path: '/swipe',
    name: 'Keep or Sweep',
    component: Swipe
  },
  {
    path: '/info',
    name: 'Info',
    component: Info
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
