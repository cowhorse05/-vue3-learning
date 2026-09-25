import { createRouter, createWebHistory } from 'vue-router'
import AppOverviewView from '../views/AppOverviewView.vue'
import AppDetailView from '../views/AppDetailView.vue'
import PolicyView from '../views/PolicyView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/apps' },
    { path: '/apps', name: 'apps', component: AppOverviewView },
    { path: '/apps/:appID', name: 'app-detail', component: AppDetailView },
    { path: '/apps/:appID/network-policy', name: 'policy', component: PolicyView },
    { path: '/:pathMatch(.*)*', redirect: '/apps' },
  ],
})
