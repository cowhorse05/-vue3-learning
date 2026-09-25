export type SandboxStatus = 'Running' | 'Stopped'
export interface Sandbox { id: string; appID: string; status: SandboxStatus }
export interface PolicyRule { host: string; port: number; paths: string[] }
export interface Policy { rules: PolicyRule[] }
