# 01｜浏览器、Vue 和项目全貌

## 1. 五个进程/角色先分开

打开 `https://portal.example.com/apps/team-a`，不要把整个过程理解成“后端渲染一个详情页”。常见的 Vue 单页应用会发生：浏览器请求 HTML 和 JS/CSS → 执行 JS → Vue 启动 → Router 匹配 `/apps/team-a` → 页面组件请求 API → 收到 JSON → Vue 更新 DOM。Web 静态服务和业务 API 甚至可以是两个不同服务。

| 名字 | 所在位置 | 做什么 | 不负责什么 |
| --- | --- | --- | --- |
| 浏览器 | 用户机器 | 执行 JS、保存 Cookie、实施同源策略、显示 DOM | 决定业务权限 |
| Vue | 浏览器里的 JS | 把状态映射为界面、更新界面 | 替代业务数据库 |
| Vue Router | 浏览器里的 JS | 把页面 URL 映射到组件 | 把 HTTP API 路由给 Go 服务 |
| Pinia | 浏览器里的 JS | 多组件共享会话内状态 | 服务端持久化与授权 |
| Vite | 开发/构建环境 | 开发服务器、编译打包 | 生产业务 API |

一次列表请求的两个 URL 别混淆：`/apps/team-a` 是前端页面地址；`GET /api/v1/apps/team-a/sandboxes` 是后端业务接口。二者可以共享域名，由网关按路径转发。

## 2. 一个文件怎样成为屏幕上的内容

```text
index.html           # 有 <div id="app"></div>，加载 /src/main.ts
src/main.ts          # createApp(App)，注册 router 与 pinia，再 mount('#app')
src/App.vue          # 应用根组件，常放 RouterView 或布局
src/router/index.ts  # /apps/:appID 对应 AppDetailView
src/views/*.vue      # 页面：取数、处理用户动作、组合小组件
src/components/*.vue # 表格、弹窗、输入框等
src/api/*.ts         # HTTP 方法与数据契约
src/stores/*.ts      # 多页面共享的状态
```

`main.ts` 的典型结构：

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

createApp(App).use(createPinia()).use(router).mount('#app')
```

读陌生仓库时，先按 `package.json` → `main.ts` → `App.vue` → `router/` → 目标 `views/` → `api/` 的顺序走。避免一上来搜索某个按钮文案，结果只看到了叶子组件。

## 3. 单文件组件 `.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue'
const title = ref('Sandbox 列表')
function rename() { title.value = '应用沙箱' }
</script>

<template>
  <h1>{{ title }}</h1>
  <button @click="rename">重命名</button>
</template>

<style scoped>
h1 { font-size: 20px; }
</style>
```

`script` 是状态和逻辑；`template` 是声明式结构；`style` 是样式。`@click` 绑定事件，`{{ title }}` 插值展示数据，`:disabled="busy"` 这种冒号表示把表达式结果绑定到属性。`scoped` 限定样式作用范围，但不能充当安全或严格隔离边界。

模板不是随意执行后端代码的地方；它在浏览器里根据当前状态构造界面。TypeScript 类型用于编辑和构建期检查，运行期 HTTP JSON 仍需合理处理缺失字段和错误响应。

## 4. Options API 与 Composition API

旧风格按 `data`、`methods`、`computed` 分类；课程采用 `<script setup>`，把一个功能相关的状态、计算、请求与操作放在一起。例如“Sandbox 列表”功能可在一段逻辑里拥有 `items`、`loading`、`load()`。代码仍然要适当拆分；组合式 API 不是把所有业务塞进一个 `.vue` 文件。

`setup` 阶段建立当前组件使用的状态和逻辑。`<script setup>` 顶层绑定可直接用于模板；这不是全局变量。每次组件实例建立时会运行对应逻辑。

## 5. JavaScript 异步读法

前端的请求通常通过 Promise 和 `async/await` 完成：

```ts
const items = ref<Sandbox[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    items.value = await listSandboxes()
  } catch (error) {
    console.error('加载失败', error)
  } finally {
    loading.value = false
  }
}
```

`await` 等待的是当前异步函数中的结果；浏览器主线程并没有像同步 I/O 一样被整体堵住。界面会经历空列表 → 加载中 → 成功或错误，设计时应给这些状态明确展示。

## 6. 术语对照

| 前端词 | 读代码时的实际问题 |
| --- | --- |
| component | 这个界面块接收什么、显示什么、向外报告什么？ |
| view/page | 哪个 URL 会显示这个页面？ |
| state | 当前展示所依据的值归谁维护？ |
| composable / hook | 哪段带状态的逻辑被多处复用？ |
| store | 哪些状态被多个页面共同读取？ |
| render | 当前状态如何变成 DOM？ |
| build | 哪些源码被编译打包成生产静态资源？ |

**检查自己是否理解**：打开一个项目，能从 `main.ts` 找到 `/apps/:appID` 对应页面，再从页面找出 `GET` 请求，就已经掌握了最重要的主干。
