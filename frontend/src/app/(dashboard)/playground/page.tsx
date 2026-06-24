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
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { api } from "@/services/api"
import { cn } from "@/lib/utils"

type Language = "en" | "es" | "fr" | "de" | "zh" | "ja" | "ar" | "hi" | "pt" | "ru"

type Token = {
  text: string
  pos: string
  entity: string
  lemma: string
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
]

const POS_COLORS: Record<string, string> = {
  NOUN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  VERB: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ADJ: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ADV: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ADP: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  DET: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  PRON: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  CONJ: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  NUM: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  PRT: "bg-red-500/20 text-red-400 border-red-500/30",
  X: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  PUNCT: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
}

export default function PlaygroundPage() {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState<string>("en")
  const [activeTab, setActiveTab] = useState("process")
  const [copied, setCopied] = useState(false)

  const processMutation = useMutation({
    mutationFn: (data: { text: string; language: string }) =>
      api.post("/api/v1/process", data).then((r) => r.data),
  })

  const tokenizeMutation = useMutation({
    mutationFn: (data: { text: string; language: string }) =>
      api.post("/api/v1/tokenize", data).then((r) => r.data),
  })

  const detectMutation = useMutation({
    mutationFn: (data: { text: string }) =>
      api.post("/api/v1/detect-language", data).then((r) => r.data),
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

  const result =
    processMutation.data ||
    tokenizeMutation.data ||
    detectMutation.data

  const tokens: Token[] = tokenizeMutation.data?.tokens || []

  const getResultContent = () => {
    if (detectMutation.data) {
      return JSON.stringify(detectMutation.data, null, 2)
    }
    if (processMutation.data) {
      return JSON.stringify(processMutation.data, null, 2)
    }
    return ""
  }

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
                  onValueChange={setLanguage}
                >
                  <SelectTrigger className="w-[160px]">
                    <Languages className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
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
                  disabled={!text && !result}
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
                {result && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        activeTab === "tokenize"
                          ? JSON.stringify(tokens, null, 2)
                          : getResultContent()
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
                {!result && !isProcessing && (
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

                {result && !isProcessing && activeTab === "tokenize" && (
                  <motion.div
                    key="tokens"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-wrap gap-2">
                      {tokens.map((token: Token, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className={cn(
                            "group relative px-2.5 py-1 rounded-md border text-xs font-mono cursor-default",
                            POS_COLORS[token.pos] || "bg-secondary/50 text-foreground border-border/50"
                          )}
                        >
                          <span>{token.text}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                            <div className="bg-popover border border-border rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                              <div>POS: {token.pos}</div>
                              {token.lemma && <div>Lemma: {token.lemma}</div>}
                              {token.entity && token.entity !== "O" && (
                                <div>Entity: {token.entity}</div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex gap-3 flex-wrap text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500" /> NOUN
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> VERB
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500" /> ADJ
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-purple-500" /> ADV
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-rose-500" /> ADP
                      </span>
                    </div>
                  </motion.div>
                )}

                {result && !isProcessing && activeTab !== "tokenize" && (
                  <motion.div
                    key="json"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    <pre className="bg-secondary/30 rounded-lg p-4 overflow-auto max-h-[300px] text-sm font-mono">
                      {getResultContent()}
                    </pre>
                  </motion.div>
                )}

                {result && !isProcessing && activeTab === "process" && processMutation.data?.sentences && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Sentences</p>
                    {processMutation.data.sentences.map((s: any, i: number) => (
                      <div
                        key={i}
                        className="bg-secondary/30 rounded-lg px-3 py-2 text-sm"
                      >
                        {s.text}
                      </div>
                    ))}
                  </div>
                )}

                {result && !isProcessing && detectMutation.data?.detected_language && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 flex items-center gap-3 p-4 rounded-lg bg-secondary/30"
                  >
                    <Languages className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {detectMutation.data.detected_language}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {((detectMutation.data.confidence || 0) * 100).toFixed(1)}%
                      </p>
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
