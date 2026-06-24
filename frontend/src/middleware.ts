import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const token = request.cookies.get("zilp-auth")?.value
  const isPublic = publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
