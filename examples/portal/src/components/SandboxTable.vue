<script setup lang="ts">
import type { Sandbox } from '../types/domain'
defineProps<{ items: Sandbox[]; busy: boolean }>()
const emit = defineEmits<{ stop: [id: string] }>()
</script>

<template>
  <table>
    <thead><tr><th>Sandbox ID</th><th>AppID</th><th>状态</th><th>操作</th></tr></thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.id }}</td><td>{{ item.appID }}</td><td>{{ item.status }}</td>
        <td><button :disabled="busy || item.status !== 'Running'" @click="emit('stop', item.id)">停止</button></td>
      </tr>
    </tbody>
  </table>
</template>
