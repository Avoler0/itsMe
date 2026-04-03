import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// 함수 이름을 proxy로 유지하되, 
// Next.js가 인식할 수 있도록 export default 혹은 명시적 호출 확인
export async function proxy(request: NextRequest) {
  // 세션 업데이트 및 리다이렉트 로직 수행
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청 경로에 대해 실행:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     * - 이미지 확장자들 (svg, png, jpg 등)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};