<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listApps } from '../api/mock'
const apps = ref<string[]>([])
const error = ref('')
onMounted(async () => {
  try { apps.value = await listApps() }
  catch (e) { error.value = String(e) }
})
</script>

<template>
  <h1>应用总览</h1>
  <p>选择一个 AppID，跟踪 Router 如何进入详情页。</p>
  <p v-if="error" role="alert">{{ error }}</p>
  <ul><li v-for="appID in apps" :key="appID"><RouterLink :to="{ name: 'app-detail', params: { appID } }">{{ appID }}</RouterLink></li></ul>
</template>
