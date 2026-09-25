# 教学示例：小型 Sandbox Portal

纯本地演示，不访问任何真实公司接口。使用 Vue 3、TypeScript、Vue Router、Pinia 和 Vite；模拟 API 层加入短暂延时，方便观察“点击 → 请求 → 更新”的过程。源码默认不包含敏感信息。

## 可选运行

需要 Node 与 npm：

```bash
npm install
npm run dev
```

从输出地址打开页面；`npm run build` 会先用 `vue-tsc` 检查类型，再生成 `dist/`。本笔记的理解不依赖实际运行。

## 推荐阅读顺序

1. `src/main.ts`：注册 Router 与 Pinia。
2. `src/router/index.ts`：URL 选择页面。
3. `src/views/AppOverviewView.vue`：总览页如何导航。
4. `src/views/AppDetailView.vue`：如何读 appID、watch、加载列表。
5. `src/components/SandboxTable.vue`：如何通过 props/emit 通信。
6. `src/api/mock.ts`：模拟的后端数据和状态改变。
7. `src/views/PolicyView.vue`：表单与 JSON 预览的区别。

这个示例在内存里保存数据，刷新页面后恢复初始数据；真实项目的 API 模块应该调用服务端，后端独立完成认证、授权、状态机和持久化。`src/stores/auth.ts` 只演示 UI 的共享状态，不能当作真实 SSO 或后端鉴权。
