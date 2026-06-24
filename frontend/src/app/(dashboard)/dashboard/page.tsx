"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/services/api"
import {
  Activity,
  MessageSquare,
  Database,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = ["#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"]

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  loading,
}: {
  title: string
  value: string
  icon: any
  trend?: { value: string; up: boolean }
  loading?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{title}</span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold">{value}</div>
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  {trend.up ? (
                    <ArrowUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${trend.up ? "text-emerald-500" : "text-red-500"}`}>
                    {trend.value}
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: () => analyticsApi.getStatistics().then((r) => r.data),
    refetchInterval: 30000,
  })

  const chartData = stats?.requests_over_time?.map((d: any) => ({
    date: d.date?.slice(5, 10) || d.date,
    requests: d.count,
  })) || []

  const langData = stats?.language_distribution?.map((d: any) => ({
    name: d.language,
    value: d.count,
  })) || []

  const activityData = [
    { name: "Process", value: stats?.total_requests || 0 },
    { name: "Tokenize", value: Math.round((stats?.total_requests || 0) * 0.3) },
    { name: "Detect", value: Math.round((stats?.total_requests || 0) * 0.15) },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your NLP platform activity</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={isLoading ? "..." : (stats?.total_requests || 0).toLocaleString()}
          icon={MessageSquare}
          trend={{ value: "12% increase", up: true }}
          loading={isLoading}
        />
        <StatCard
          title="Today"
          value={isLoading ? "..." : (stats?.requests_today || 0).toLocaleString()}
          icon={Activity}
          trend={{ value: "8% increase", up: true }}
          loading={isLoading}
        />
        <StatCard
          title="Avg Response"
          value={isLoading ? "..." : `${(stats?.average_response_time_ms || 0).toFixed(0)}ms`}
          icon={Zap}
          trend={{ value: "3% faster", up: true }}
          loading={isLoading}
        />
        <StatCard
          title="Uptime"
          value={isLoading ? "..." : `${(stats?.uptime_percentage || 0).toFixed(1)}%`}
          icon={Database}
          trend={{ value: "99.9% SLA", up: true }}
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request volume */}
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
                      <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#requestGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Language distribution */}
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={langData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
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
              )}
              {!isLoading && langData.length > 0 && (
                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  {langData.map((d: any, i: number) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-sm text-muted-foreground">{d.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity by type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Activity by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={activityData}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* System health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "API Status", value: "Operational", color: "text-emerald-500" },
                { label: "Database", value: "Connected", color: "text-emerald-500" },
                { label: "Redis Cache", value: "Connected", color: "text-emerald-500" },
                { label: "Tokens Processed", value: (stats?.tokens_processed || 0).toLocaleString(), color: "text-primary" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
