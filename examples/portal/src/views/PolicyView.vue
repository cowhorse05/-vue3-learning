<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPolicy, savePolicy } from '../api/mock'
import type { Policy } from '../types/domain'

const route = useRoute()
const appID = computed(() => String(route.params.appID))
const form = reactive({ host: '', port: 443, pathsText: '' })
const saved = ref<Policy | null>(null)
const busy = ref(false)
const error = ref('')
const message = ref('')
let version = 0

const preview = computed<Policy>(() => ({
  rules: form.host.trim() ? [{
    host: form.host.trim(),
    port: Number(form.port),
    paths: [...new Set(form.pathsText.split('\n').map(p => p.trim()).filter(Boolean))],
  }] : [],
}))

watch(appID, async id => {
  const current = ++version
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    const policy = await getPolicy(id)
    if (current !== version) return
    saved.value = policy
    const first = policy.rules[0]
    form.host = first?.host ?? ''
    form.port = first?.port ?? 443
    form.pathsText = first?.paths.join('\n') ?? ''
  } catch (e) {
    if (current === version) error.value = String(e)
  } finally {
    if (current === version) busy.value = false
  }
}, { immediate: true })

async function save() {
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    saved.value = await savePolicy(appID.value, preview.value)
    message.value = '模拟保存成功；真实系统仍需确认策略下发生效状态。'
  } catch (e) { error.value = String(e) }
  finally { busy.value = false }
}
</script>

<template>
  <h1>{{ appID }} · 网络策略</h1>
  <RouterLink :to="{ name: 'app-detail', params: { appID } }">返回应用</RouterLink>
  <p>演示一条 host:port 规则；多个 path 按行输入并去重。示例没有实现真实服务端合并策略。</p>
  <label>Host <input v-model="form.host" placeholder="example.org" /></label>
  <label>Port <input v-model.number="form.port" type="number" min="1" max="65535" /></label>
  <label>Paths（每行一个）<textarea v-model="form.pathsText" rows="5" /></label>
  <div class="columns"><section><h2>待提交预览</h2><pre>{{ JSON.stringify(preview, null, 2) }}</pre></section><section><h2>上次保存</h2><pre>{{ JSON.stringify(saved, null, 2) }}</pre></section></div>
  <button :disabled="busy" @click="save">保存模拟配置</button>
  <p v-if="message" role="status">{{ message }}</p><p v-if="error" role="alert">{{ error }}</p>
</template>
