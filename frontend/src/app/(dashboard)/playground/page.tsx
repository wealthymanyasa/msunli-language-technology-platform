"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  RotateCcw,
  Loader2,
  Sparkles,
  Languages,
  Hash,
  FileText,
  Copy,
  Check,
  Terminal,
  AlertCircle,
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { nlpApi } from "@/services/api"
import { SUPPORTED_LANGUAGES } from "@/types"

type ProcessResult = {
  original_text: string
  cleaned_text: string
  language: string
  language_code: string
  detected_language: string
  detection_confidence: number
  tokens: string[]
  tokens_without_stopwords: string[]
  token_count: number
  token_count_without_stopwords: number
  unique_words: number
  word_frequency: Record<string, number>
  execution_time_ms: number
}

type TokenizeResult = {
  cleaned_text: string
  tokens: string[]
  token_count: number
  language: string
  language_code: string
  detected_language: string | null
  detection_confidence: number | null
  execution_time_ms: number
}

type DetectResult = {
  language: string
  language_code: string
  confidence: number
}

export default function PlaygroundPage() {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState<string>("en")
  const [activeTab, setActiveTab] = useState("process")
  const [copied, setCopied] = useState(false)

  const processMutation = useMutation({
    mutationFn: (data: { text: string; language: string }) =>
      nlpApi.process(data).then((r) => r.data),
  })

  const tokenizeMutation = useMutation({
    mutationFn: (data: { text: string; language: string }) =>
      nlpApi.tokenize(data).then((r) => r.data),
  })

  const detectMutation = useMutation({
    mutationFn: (data: { text: string }) =>
      nlpApi.detectLanguage(data).then((r) => r.data),
  })

  const handleRun = () => {
    if (!text.trim()) return
    switch (activeTab) {
      case "process":
        processMutation.mutate({ text, language })
        break
      case "tokenize":
        tokenizeMutation.mutate({ text, language })
        break
      case "detect":
        detectMutation.mutate({ text })
        break
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isProcessing =
    processMutation.isPending ||
    tokenizeMutation.isPending ||
    detectMutation.isPending

  const isError =
    processMutation.isError ||
    tokenizeMutation.isError ||
    detectMutation.isError

  const errorMessage =
    processMutation.error?.message ||
    tokenizeMutation.error?.message ||
    detectMutation.error?.message ||
    "Request failed"

  const processResult = processMutation.data as ProcessResult | undefined
  const tokenizeResult = tokenizeMutation.data as TokenizeResult | undefined
  const detectResult = detectMutation.data as DetectResult | undefined

  const hasResult = !!(processResult || tokenizeResult || detectResult)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Playground</h1>
        <p className="text-muted-foreground mt-1">
          Experiment with NLP models in real time
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Input</CardTitle>
                <Badge
                  variant="outline"
                  className="text-xs font-mono"
                >
                  {text.length} chars
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select
                  value={language}
                  onValueChange={(v) => v && setLanguage(v)}
                >
                  <SelectTrigger className="w-[160px]">
                    <Languages className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1"
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="process">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Process
                    </TabsTrigger>
                    <TabsTrigger value="tokenize">
                      <Hash className="h-3.5 w-3.5 mr-1.5" />
                      Tokens
                    </TabsTrigger>
                    <TabsTrigger value="detect">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      Detect
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Textarea
                placeholder="Enter text to process..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-none font-mono text-sm"
              />

              {activeTab === "detect" && (
                <p className="text-xs text-muted-foreground">
                  Language detection ignores the language selector
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleRun}
                  disabled={!text.trim() || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? "Processing..." : "Run"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setText("")
                    processMutation.reset()
                    tokenizeMutation.reset()
                    detectMutation.reset()
                  }}
                  disabled={!text && !hasResult}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Results</CardTitle>
                {hasResult && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        activeTab === "tokenize"
                          ? JSON.stringify(tokenizeResult?.tokens, null, 2)
                          : JSON.stringify(
                              processResult || detectResult,
                              null,
                              2
                            )
                      )
                    }
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {!hasResult && !isProcessing && !isError && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[300px] text-muted-foreground"
                  >
                    <Terminal className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-sm">Run a query to see results</p>
                  </motion.div>
                )}

                {isError && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[300px] text-red-500"
                  >
                    <AlertCircle className="h-10 w-10 mb-3 opacity-70" />
                    <p className="text-sm font-medium">Request Failed</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[250px] text-center">
                      {errorMessage}
                    </p>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[300px]"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Processing...</p>
                  </motion.div>
                )}

                {hasResult && !isProcessing && !isError && activeTab === "tokenize" && tokenizeResult && (
                  <motion.div
                    key="tokens"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span>{tokenizeResult.token_count} tokens</span>
                      <span className="text-border">|</span>
                      <span>{tokenizeResult.language}</span>
                      {tokenizeResult.execution_time_ms && (
                        <>
                          <span className="text-border">|</span>
                          <span>{tokenizeResult.execution_time_ms.toFixed(1)}ms</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tokenizeResult.tokens.map((token: string, i: number) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="px-2 py-0.5 rounded-md bg-secondary/70 text-xs font-mono border border-border/30"
                        >
                          {token}
                        </motion.span>
                      ))}
                    </div>
                    {tokenizeResult.cleaned_text && (
                      <div className="pt-3 border-t border-border/30">
                        <p className="text-xs text-muted-foreground mb-1">Cleaned text</p>
                        <p className="text-sm">{tokenizeResult.cleaned_text}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {hasResult && !isProcessing && !isError && activeTab === "process" && processResult && (
                  <motion.div
                    key="process"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs font-mono">
                        {processResult.detected_language}
                      </Badge>
                      <span className="text-xs">
                        {(processResult.detection_confidence * 100).toFixed(1)}% confidence
                      </span>
                      <span className="text-border">|</span>
                      <span className="text-xs">{processResult.execution_time_ms.toFixed(1)}ms</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-secondary/30 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">{processResult.token_count}</p>
                        <p className="text-xs text-muted-foreground">Tokens</p>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">{processResult.unique_words}</p>
                        <p className="text-xs text-muted-foreground">Unique Words</p>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">
                          {processResult.token_count_without_stopwords}
                        </p>
                        <p className="text-xs text-muted-foreground">No Stopwords</p>
                      </div>
                    </div>

                    <div className="bg-secondary/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Cleaned text</p>
                      <p className="text-sm">{processResult.cleaned_text}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tokens ({processResult.tokens.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {processResult.tokens.map((token: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-secondary/50 text-xs font-mono border border-border/20"
                          >
                            {token}
                          </span>
                        ))}
                      </div>
                    </div>

                    {Object.keys(processResult.word_frequency).length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Word frequency (top 10)</p>
                        <div className="space-y-1">
                          {Object.entries(processResult.word_frequency)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 10)
                            .map(([word, count]) => (
                              <div key={word} className="flex items-center gap-2 text-sm">
                                <span className="font-mono text-xs flex-1">{word}</span>
                                <div className="h-4 bg-primary/20 rounded-sm" style={{ width: `${Math.min(count * 20, 200)}px` }} />
                                <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {hasResult && !isProcessing && !isError && activeTab === "detect" && detectResult && (
                  <motion.div
                    key="detect"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[300px]"
                  >
                    <div className="relative mb-6">
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <Languages className="h-10 w-10 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <p className="text-xl font-bold">{detectResult.language}</p>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {detectResult.language_code}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(detectResult.confidence * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {(detectResult.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
