<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { listSandboxes, stopSandbox } from '../api/mock'
import type { Sandbox } from '../types/domain'
import SandboxTable from '../components/SandboxTable.vue'

const route = useRoute()
const appID = computed(() => String(route.params.appID))
const items = ref<Sandbox[]>([])
const busy = ref(false)
const error = ref('')
let version = 0

async function reload() {
  const current = ++version
  busy.value = true
  error.value = ''
  items.value = []
  try {
    const result = await listSandboxes(appID.value)
    if (current === version) items.value = result
  } catch (e) {
    if (current === version) error.value = String(e)
  } finally {
    if (current === version) busy.value = false
  }
}

watch(appID, () => { void reload() }, { immediate: true })

async function handleStop(id: string) {
  if (!window.confirm(`停止 ${id}？`)) return
  busy.value = true
  error.value = ''
  try {
    await stopSandbox(appID.value, id)
    await reload() // 从“服务端”重新读取权威状态
  } catch (e) {
    error.value = String(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <h1>应用 {{ appID }}</h1>
  <nav><RouterLink to="/apps">返回总览</RouterLink> · <RouterLink :to="{ name: 'policy', params: { appID } }">网络策略</RouterLink></nav>
  <p v-if="error" role="alert">{{ error }}</p>
  <p v-if="busy">处理中……</p>
  <SandboxTable :items="items" :busy="busy" @stop="handleStop" />
</template>
