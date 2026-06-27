export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04]" />
      <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 -right-32 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      <div className="relative z-10 w-full max-w-md px-6">
        {children}
      </div>
    </div>
  )
}
