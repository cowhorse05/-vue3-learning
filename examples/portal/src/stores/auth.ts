import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 教学用的界面状态，不代表真实的 SSO 或后端授权。
export const useAuthStore = defineStore('auth', () => {
  const user = ref({ name: '示例管理员', role: 'Admin' as const })
  const isAdmin = computed(() => user.value.role === 'Admin')
  return { user, isAdmin }
})
