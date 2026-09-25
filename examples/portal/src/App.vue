<script setup lang="ts">
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
</script>

<template>
  <header class="top"><RouterLink to="/apps">Sandbox Portal · 阅读示例</RouterLink><span>{{ auth.user.name }}（{{ auth.user.role }}）</span></header>
  <main><RouterView /></main>
</template>
