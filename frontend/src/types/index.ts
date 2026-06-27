export interface User {
  id: string
  email: string
  username: string
  role: "user" | "admin"
  created_at: string
}

export interface AuthTokens {
  access_token: string
  token_type: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ProcessRequest {
  text: string
  language: string
  clean: boolean
  tokenize: boolean
  pos: boolean
  ner: boolean
  morphology: boolean
}

export interface Token {
  text: string
  pos?: string
  entity?: string
  lemma?: string
  confidence?: number
  start?: number
  end?: number
}

export interface ProcessResponse {
  cleaned_text?: string
  tokens?: Token[]
  detected_language?: string
  confidence?: number
  pos_tags?: Array<{ token: string; tag: string; confidence: number }>
  entities?: Array<{ text: string; label: string; confidence: number }>
  morphology?: Array<{ token: string; lemma: string; features: Record<string, string> }>
  processing_time_ms?: number
}

export interface TokenizeRequest {
  text: string
  language: string
}

export interface TokenizeResponse {
  tokens: Token[]
  processing_time_ms?: number
}

export interface DetectLanguageRequest {
  text: string
}

export interface DetectLanguageResponse {
  language: string
  confidence: number
  alternatives?: Array<{ language: string; confidence: number }>
}

export interface SystemStatistics {
  total_requests: number
  requests_today: number
  average_response_time_ms: number
  uptime_percentage: number
  requests_by_language: Record<string, number>
  requests_over_time: Array<{ date: string; count: number }>
  language_distribution: Array<{ language: string; count: number }>
  tokens_processed: number
}

export interface ApiEndpoint {
  path: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  summary: string
  description?: string
  tags: string[]
  parameters?: Array<{
    name: string
    in: string
    required: boolean
    schema: { type: string }
  }>
  requestBody?: {
    content: Record<string, { schema: { properties?: Record<string, unknown> } }>
  }
  responses: Record<string, { description: string }>
}

export interface Language {
  code: string
  name: string
  native: string
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "sn", name: "Shona", native: "chiShona" },
  { code: "nd", name: "Ndebele", native: "isiNdebele" },
  { code: "tn", name: "Tonga", native: "chiTonga" },
  { code: "nx", name: "Nambya", native: "chiNambya" },
  { code: "en", name: "English", native: "English" },
]

export interface ApiHistoryItem {
  id: string
  endpoint: string
  method: string
  status: number
  latency_ms: number
  timestamp: string
  request_body?: string
  response_body?: string
}
