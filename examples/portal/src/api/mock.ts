import type { Policy, Sandbox } from '../types/domain'

const sandboxes: Sandbox[] = [
  { id: 'sb-101', appID: 'team-a', status: 'Running' },
  { id: 'sb-102', appID: 'team-a', status: 'Stopped' },
  { id: 'sb-201', appID: 'team-b', status: 'Running' },
]
const policies: Record<string, Policy> = {
  'team-a': { rules: [{ host: 'example.org', port: 443, paths: ['/api'] }] },
  'team-b': { rules: [] },
}
const pause = () => new Promise<void>(resolve => setTimeout(resolve, 250))

export async function listApps(): Promise<string[]> {
  await pause()
  return ['team-a', 'team-b']
}

export async function listSandboxes(appID: string): Promise<Sandbox[]> {
  await pause()
  return sandboxes.filter(item => item.appID === appID).map(item => ({ ...item }))
}

export async function stopSandbox(appID: string, id: string): Promise<void> {
  await pause()
  const item = sandboxes.find(item => item.appID === appID && item.id === id)
  if (!item) throw new Error('Sandbox 不存在或不属于当前应用')
  if (item.status !== 'Running') throw new Error('仅运行中的 Sandbox 可以停止')
  item.status = 'Stopped'
}

export async function getPolicy(appID: string): Promise<Policy> {
  await pause()
  return structuredClone(policies[appID] ?? { rules: [] })
}

export async function savePolicy(appID: string, policy: Policy): Promise<Policy> {
  await pause()
  if (policy.rules.some(rule => !rule.host || rule.port < 1 || rule.port > 65535)) {
    throw new Error('host 与端口必须有效')
  }
  policies[appID] = structuredClone(policy)
  return structuredClone(policies[appID])
}
