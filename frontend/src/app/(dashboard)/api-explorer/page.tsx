"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  Play,
  Copy,
  Check,
  Clock,
  Loader2,
  BookOpen,
  Search,
  Code2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface Endpoint {
  method: Method
  path: string
  summary: string
  description: string
  tags: string[]
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  requestBody?: { type: string; properties: Record<string, { type: string; description: string }> }
  responses: Record<string, { description: string }>
}

const METHOD_COLORS: Record<Method, string> = {
  GET: "text-emerald-500",
  POST: "text-blue-500",
  PUT: "text-amber-500",
  DELETE: "text-red-500",
  PATCH: "text-purple-500",
}

const METHOD_BG: Record<Method, string> = {
  GET: "bg-emerald-500/10",
  POST: "bg-blue-500/10",
  PUT: "bg-amber-500/10",
  DELETE: "bg-red-500/10",
  PATCH: "bg-purple-500/10",
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "POST",
    path: "/api/v1/process",
    summary: "Process text with full NLP pipeline",
    description: "Runs the complete NLP pipeline on the input text.",
    tags: ["NLP"],
    requestBody: {
      type: "object",
      properties: {
        text: { type: "string", description: "Input text to process" },
        language: { type: "string", description: "Language code (default: en)" },
      },
    },
    responses: {
      "200": { description: "Processed text result" },
      "400": { description: "Invalid input" },
    },
  },
  {
    method: "POST",
    path: "/api/v1/tokenize",
    summary: "Tokenize text into tokens",
    description: "Splits text into tokens with POS tagging and named entity recognition.",
    tags: ["NLP"],
    requestBody: {
      type: "object",
      properties: {
        text: { type: "string", description: "Input text to tokenize" },
        language: { type: "string", description: "Language code (default: en)" },
      },
    },
    responses: {
      "200": { description: "Tokenized result with POS and entities" },
    },
  },
  {
    method: "POST",
    path: "/api/v1/detect-language",
    summary: "Detect language of text",
    description: "Detects the language of the input text and returns confidence scores.",
    tags: ["NLP"],
    requestBody: {
      type: "object",
      properties: {
        text: { type: "string", description: "Input text to analyze" },
      },
    },
    responses: {
      "200": { description: "Detected language and confidence" },
    },
  },
  {
    method: "POST",
    path: "/auth/register",
    summary: "Register a new user",
    description: "Creates a new user account with email and password.",
    tags: ["Auth"],
    requestBody: {
      type: "object",
      properties: {
        email: { type: "string", description: "User email address" },
        password: { type: "string", description: "User password (min 6 chars)" },
      },
    },
    responses: {
      "201": { description: "User created successfully" },
      "400": { description: "Invalid input" },
    },
  },
  {
    method: "POST",
    path: "/auth/token",
    summary: "Obtain access token",
    description: "Authenticates user and returns JWT access token.",
    tags: ["Auth"],
    requestBody: {
      type: "object",
      properties: {
        username: { type: "string", description: "Registered email" },
        password: { type: "string", description: "Account password" },
      },
    },
    responses: {
      "200": { description: "Access token returned" },
      "401": { description: "Invalid credentials" },
    },
  },
  {
    method: "GET",
    path: "/auth/me",
    summary: "Get current user profile",
    description: "Returns the authenticated user's profile information.",
    tags: ["Auth"],
    responses: {
      "200": { description: "User profile data" },
      "401": { description: "Not authenticated" },
    },
  },
  {
    method: "GET",
    path: "/api/v1/statistics",
    summary: "Get platform statistics",
    description: "Returns aggregate usage statistics for the authenticated user.",
    tags: ["Stats"],
    responses: {
      "200": { description: "Usage statistics" },
    },
  },
]

function EndpointCard({
  endpoint,
  index,
}: {
  endpoint: Endpoint
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [bodyInput, setBodyInput] = useState(
    endpoint.requestBody
      ? JSON.stringify(
          Object.fromEntries(
            Object.entries(endpoint.requestBody.properties).map(([k, v]) => [
              k,
              v.type === "string" ? "" : 0,
            ])
          ),
          null,
          2
        )
      : ""
  )

  const handleSend = async () => {
    setLoading(true)
    setResponse(null)
    setLatency(null)
    const start = performance.now()
    try {
      let body = undefined
      if (endpoint.requestBody) {
        try {
          body = JSON.parse(bodyInput)
        } catch {
          body = bodyInput
        }
      }
      const opts: RequestInit = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
      if (body) opts.body = JSON.stringify(body)
      const res = await fetch(endpoint.path, opts)
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (err: any) {
      setResponse(JSON.stringify({ error: err.message }, null, 2))
    }
    setLatency(Math.round(performance.now() - start))
    setLoading(false)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "bg-card/50 border-border/50 backdrop-blur-sm cursor-pointer transition-all hover:bg-card/80",
          expanded && "border-primary/30"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "font-mono text-xs",
                METHOD_BG[endpoint.method],
                METHOD_COLORS[endpoint.method]
              )}
            >
              {endpoint.method}
            </Badge>
            <span className="font-mono text-sm flex-1">{endpoint.path}</span>
            <span className="text-sm text-muted-foreground hidden md:block">
              {endpoint.summary}
            </span>
            <div className="flex gap-1">
              {endpoint.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4 border-t border-border/50 mt-4">
                  <p className="text-sm text-muted-foreground">
                    {endpoint.description}
                  </p>

                  {endpoint.requestBody && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Request Body</h4>
                      <div className="bg-secondary/30 rounded-lg p-3">
                        <div className="space-y-2 mb-3">
                          {Object.entries(endpoint.requestBody.properties).map(
                            ([name, prop]) => (
                              <div
                                key={name}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="font-mono font-medium">{name}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {prop.type}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {prop.description}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                        <textarea
                          value={bodyInput}
                          onChange={(e) => setBodyInput(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-background border border-border rounded-md p-2 text-xs font-mono resize-none h-24"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">Responses</h4>
                    <div className="space-y-1">
                      {Object.entries(endpoint.responses).map(([code, resp]) => (
                        <div
                          key={code}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-mono",
                              code.startsWith("2")
                                ? "text-emerald-500"
                                : code.startsWith("4")
                                ? "text-amber-500"
                                : "text-red-500"
                            )}
                          >
                            {code}
                          </Badge>
                          <span className="text-muted-foreground">
                            {resp.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSend()
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Send Request
                    </Button>
                    {endpoint.path && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(endpoint.path)
                        }}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>

                  {response && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Response</h4>
                        <div className="flex items-center gap-2">
                          {latency !== null && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {latency}ms
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopy(response!)
                            }}
                          >
                            {copied ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <pre className="bg-secondary/30 rounded-lg p-3 text-xs font-mono overflow-auto max-h-48">
                        {response}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ApiExplorerPage() {
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState<Method | "ALL">("ALL")
  const [tagFilter, setTagFilter] = useState<string>("ALL")

  const tags = Array.from(new Set(ENDPOINTS.flatMap((e) => e.tags)))

  const filtered = ENDPOINTS.filter((e) => {
    if (methodFilter !== "ALL" && e.method !== methodFilter) return false
    if (tagFilter !== "ALL" && !e.tags.includes(tagFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        e.path.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Explorer</h1>
            <p className="text-muted-foreground mt-1">
              Browse and test API endpoints
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Code2 className="h-3 w-3 mr-1" />
            {ENDPOINTS.length} endpoints
          </Badge>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search endpoints..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1">
                {(["ALL", "GET", "POST", "PUT", "DELETE", "PATCH"] as const).map(
                  (m) => (
                    <Button
                      key={m}
                      variant={methodFilter === m ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMethodFilter(m)}
                      className={cn(
                        "text-xs font-mono",
                        methodFilter === m
                          ? ""
                          : m !== "ALL" && METHOD_COLORS[m as Method]
                      )}
                    >
                      {m}
                    </Button>
                  )
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant={tagFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTagFilter("ALL")}
                  className="text-xs"
                >
                  All
                </Button>
                {tags.map((tag) => (
                  <Button
                    key={tag}
                    variant={tagFilter === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTagFilter(tag)}
                    className="text-xs"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Endpoint list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm">No endpoints match your filters</p>
          </div>
        ) : (
          filtered.map((endpoint, i) => (
            <EndpointCard key={endpoint.path} endpoint={endpoint} index={i} />
          ))
        )}
      </div>
    </div>
  )
}
