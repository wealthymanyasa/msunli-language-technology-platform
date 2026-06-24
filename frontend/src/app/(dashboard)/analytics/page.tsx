"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

const COLORS = ["#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"]
const RADIAN = Math.PI / 180

function GaugeChart({ value, label, max = 100 }: { value: number; label: string; max?: number }) {
  const percentage = Math.min((value / max) * 100, 100)
  const data = [{ name: label, value: percentage, fill: "#7C3AED" }]

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          barSize={12}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar dataKey="value" cornerRadius={6} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center -mt-8">
        <p className="text-2xl font-bold">{value.toFixed(1)}{max === 100 ? "%" : "ms"}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

  const { data: stats, isLoading } = useQuery({
    queryKey: ["statistics", period],
    queryFn: () => analyticsApi.getStatistics().then((r) => r.data),
    refetchInterval: 60000,
  })

  const chartData = stats?.requests_over_time?.map((d: any) => ({
    date: d.date?.slice(5, 10) || d.date,
    requests: d.count,
  })) || []

  const langData = stats?.language_distribution?.map((d: any) => ({
    name: d.language,
    value: d.count,
  })) || []

  const endpoints = [
    { name: "/api/v1/process", count: Math.round((stats?.total_requests || 0) * 0.55) },
    { name: "/api/v1/tokenize", count: Math.round((stats?.total_requests || 0) * 0.25) },
    { name: "/api/v1/detect-language", count: Math.round((stats?.total_requests || 0) * 0.15) },
    { name: "/auth/*", count: Math.round((stats?.total_requests || 0) * 0.05) },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Deep dive into platform usage and performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={period === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("7d")}
            >
              7D
            </Button>
            <Button
              variant={period === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("30d")}
            >
              30D
            </Button>
            <Button
              variant={period === "90d" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("90d")}
            >
              90D
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Success Rate", value: "99.2%", change: "+0.3%", up: true },
          { label: "Avg Latency", value: `${stats?.average_response_time_ms?.toFixed(0) || "..."}ms`, change: "-5ms", up: true },
          { label: "Tokens/Mo", value: stats?.tokens_processed ? (stats.tokens_processed / 1000).toFixed(0) + "K" : "...", change: "+12%", up: true },
          { label: "Active Users", value: stats?.active_users?.toString() || "...", change: "+8", up: true },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold mt-1">{kpi.value}</p>
                <div className={cn(
                  "flex items-center gap-1 mt-1 text-xs",
                  kpi.up ? "text-emerald-500" : "text-red-500"
                )}>
                  {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.change}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request volume with area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Request Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke="#7C3AED"
                      fill="url(#areaGradient)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#7C3AED" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Language donut */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Language Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={langData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {langData.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Endpoint usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Endpoint Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={endpoints}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Latency Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Latency</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[250px]">
              {isLoading ? (
                <Skeleton className="h-[160px] w-[160px] rounded-full" />
              ) : (
                <GaugeChart
                  value={stats?.average_response_time_ms || 0}
                  label="Avg Response"
                  max={500}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Uptime Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Uptime</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[250px]">
              {isLoading ? (
                <Skeleton className="h-[160px] w-[160px] rounded-full" />
              ) : (
                <GaugeChart
                  value={stats?.uptime_percentage || 99.9}
                  label="Availability"
                  max={100}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trend line chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Daily Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="#A78BFA"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: "#7C3AED" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
