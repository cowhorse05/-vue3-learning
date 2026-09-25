# 04｜Pinia 与组件通信

## 1. 状态放在哪里

| 状态 | 典型位置 | 为什么 |
| --- | --- | --- |
| 当前页是否打开确认框 | 页面 `ref` | 页面私有，离开就可丢弃 |
| 当前筛选条件 | URL query 或页面状态 | 需要分享/刷新保留时优先 URL |
| 登录用户、展示用角色 | Pinia Store | 多页面都要读取 |
| Sandbox 的最终运行状态 | 服务端 | 客户端是一次观测结果 |
| 登录会话 Cookie | 浏览器的 Cookie 机制 | 按既定 SSO/网关方案处理 |

Pinia Store 是一个可以在多个组件中获取的状态模块。示例：

```ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAdmin = computed(() => user.value?.role === 'Admin')
  async function loadCurrentUser() {
    user.value = await getCurrentUser()
  }
  return { user, isAdmin, loadCurrentUser }
})
```

也可用对象风格写 `state`、`getters`、`actions`。课程的“修改数据三种方式”“订阅”“组合式写法”是在展示 Pinia 不同 API；读业务仓库时更重要的是**谁调用 action、谁订阅状态、服务端信息何时重新拉取**。

```ts
const auth = useAuthStore()
const { user, isAdmin } = storeToRefs(auth) // 取出状态仍保持响应式
await auth.loadCurrentUser()                 // action 可以直接调用
```

`$subscribe` 可观察 Store 变化，例如同步一些非敏感的用户偏好到本地存储；但不要默认把会话凭据或保密信息写入浏览器存储，也不要把订阅事件当可靠消息队列。

## 2. 七种通信方式怎样选

课程 52～60 节逐个展示了这些方式。按数据所属关系来选，比按 API 名称选更直观。

| 方式 | 方向/范围 | 示例 | 注意点 |
| --- | --- | --- | --- |
| `props` | 父 → 子 | 页面给表格 `items` | 子组件不直接修改传入 prop |
| 自定义事件 | 子 → 父 | 表格发 `stop(id)` | 父层处理 API 与刷新 |
| `mitt` | 跨不相关组件 | 通知某块界面刷新 | 注册、解绑、事件来源难追踪 |
| 组件 `v-model` | 父子约定双向值 | 弹窗开关、输入值 | 本质是 prop + 更新事件 |
| `$attrs` | 穿透未声明的属性/监听 | 包装输入组件 | 留意属性落在具体哪个元素上 |
| `$refs` / `$parent` | 实例访问 | 调用子组件公开的聚焦方法 | 耦合强，常规数据流优先 props/emit |
| `provide/inject` | 祖先 → 后代 | 表单上下文、主题配置 | 与组件树绑定，非任意全局共享 |

两段小例子：

```vue
<!-- 子组件：只报告“用户请求停止” -->
<script setup lang="ts">
const emit = defineEmits<{ stop: [sandboxID: string] }>()
</script>
<template><button @click="emit('stop', 'sb-1')">停止</button></template>
```

```vue
<!-- 父组件：决定是否确认、调用哪个 API、何时刷新 -->
<SandboxTable :items="items" @stop="handleStop" />
```

Vue 组件 `v-model` 常见等价关系：父传模型值，子发 `update:modelValue`；新版代码可能使用 `defineModel()`。实际语法随项目 Vue 版本与写法不同，但数据方向仍可按这条线索理解。

## 3. 插槽与数据传递不是一回事

插槽让父组件提供一块**界面内容**，子组件决定把内容显示在哪里：

```vue
<!-- 定义通用卡片 -->
<section class="card">
  <header><slot name="title" /></header>
  <main><slot /></main>
</section>
```

```vue
<!-- 使用 -->
<Card>
  <template #title>网络策略</template>
  <JsonPreview :value="policy" />
</Card>
```

具名插槽指定区域；作用域插槽是子组件把局部数据交给父组件提供的模板：

```vue
<DataTable :rows="rows">
  <template #status="{ row }"><StatusTag :status="row.status" /></template>
</DataTable>
```

它适合做通用表格的“这一列由业务页面自己决定怎么显示”。如果你看到 `#default`、`#header`、`#cell`，找对应组件的 `<slot>` 就能明白内容最终去哪里。

## 4. 常见反模式与定位

1. 子表格直接请求停止 API，父页面又自己刷新：责任分散，较难追操作链路。
2. 页面把每个短期 loading、每个输入框都塞进全局 Store：状态生命周期过长，跨页面相互影响。
3. 用 `mitt` 传递主要业务数据：事件名没有清晰的调用关系，漏解绑会重复触发。
4. 用 `v-if="isAdmin"` 当作安全授权：只能控制显示，API 必须另行鉴权。
5. `const { user } = auth` 直接解构 Pinia 的响应式状态：可能失去预期的响应式连接；可用 `storeToRefs`。

## 5. 阅读流程练习

遇到 `<SandboxTable :items="items" @stop="stop" />`：先看父组件 `items` 从哪里来，再看子组件在哪 `emit('stop', ...)`，最后看父组件 `stop()` 如何确认、调用 API、重新取数。看完这三处，组件通信链路已经闭合。
