import Link from "next/link"
import { ArrowRight, Globe, Languages, Shield, Zap, BarChart3, Code2 } from "lucide-react"

const features = [
  {
    icon: Languages,
    title: "5 Languages",
    desc: "Shona, Ndebele, Tonga, Nambya, and English — full NLP pipeline for each.",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    desc: "Tokenize, POS-tag, detect entities, and analyze morphology in milliseconds.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track usage, monitor latency, and visualize language distribution.",
  },
  {
    icon: Code2,
    title: "REST API",
    desc: "Integrate via a clean RESTful API with JWT authentication and API keys.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "Rate-limited, CORS-protected, with refresh tokens and account management.",
  },
  {
    icon: Globe,
    title: "Open Source",
    desc: "Built for Zimbabwe, by Zimbabweans. MIT-licensed and community-driven.",
  },
]

const languages = [
  { code: "sn", name: "Shona", native: "chiShona", speakers: "14M+" },
  { code: "nd", name: "Ndebele", native: "isiNdebele", speakers: "5M+" },
  { code: "tn", name: "Tonga", native: "chiTonga", speakers: "1.5M+" },
  { code: "nx", name: "Nambya", native: "chiNambya", speakers: "100K+" },
  { code: "en", name: "English", native: "English", speakers: "Global" },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-sm font-bold text-white">Z</span>
            </div>
            <span className="font-semibold text-lg">ZILP</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-secondary/30 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            Zimbabwean Indigenous Language Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            NLP for{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Zimbabwe&apos;s Languages
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A production-grade text processing platform for Shona, Ndebele, Tonga, Nambya, and English.
            Tokenize, analyze, and detect language with millisecond latency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-base"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-secondary/30 text-foreground font-medium hover:bg-secondary/50 transition-colors text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-16 px-4 sm:px-6 border-y border-border/40 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Supported Languages</h2>
            <p className="text-muted-foreground mt-2">Indigenous and official languages of Zimbabwe</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className="flex flex-col items-center gap-2 p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{lang.code.toUpperCase()}</span>
                </div>
                <span className="font-semibold">{lang.name}</span>
                <span className="text-xs text-muted-foreground">{lang.native}</span>
                <span className="text-xs text-muted-foreground">{lang.speakers} speakers</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Everything you need</h2>
            <p className="text-muted-foreground mt-2">
              A modern NLP platform built for production
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-border/40 bg-secondary/20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to build?</h2>
          <p className="text-muted-foreground">
            Start processing Zimbabwean languages in minutes. Free tier included.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Create your free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">Z</span>
            </div>
            ZILP &mdash; Zimbabwean Indigenous Language Platform
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MSUNLI Language Technology Platform. MIT License.
          </p>
        </div>
      </footer>
    </div>
  )
}
