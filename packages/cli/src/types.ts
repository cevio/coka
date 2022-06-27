export interface TConfigs {
  namespace?: {
    window?: string,
    file?: string,
  },
  input?: {
    web?: string,
    client?: string,
    server?: string,
    html?: string,
  },
  output?: {
    web?: string,
    client?: string,
    server?: string,
  },
  rewrites?: Record<string, string>,
}