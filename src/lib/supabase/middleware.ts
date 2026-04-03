// @/lib/supabase/middleware.ts

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 1. 기본 응답 객체 생성
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!, // 환경변수명 확인 필요
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          // 요청(request)과 응답(response) 모두에 쿠키 반영
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 디버깅을 위한 로그 (터미널에서 확인 가능)
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // [보안 로직 1] 로그인이 안 된 상태에서 대시보드 접근 시
  if (!user && pathname.startsWith("/dashboard")) {
    const url = new URL("/auth", request.url); // clone()보다 안전한 방식
    return NextResponse.redirect(url);
  }

  // [보안 로직 2] 로그인된 상태에서 로그인/가입 페이지(/auth) 접근 시
  if (user && pathname === "/auth") {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}