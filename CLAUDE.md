# MinimalLink — Claude 작업 가이드

## 프로젝트 개요
미니멀 디지털 명함 서비스. Next.js App Router + Supabase.

## 기술 스택
- **Framework**: Next.js (App Router)
- **DB / Auth / Storage**: Supabase (`@supabase/ssr`)
- **Styling**: Tailwind CSS (mobile-first)
- **Language**: TypeScript

---

## 아키텍처 규칙

### Repository 패턴 (필수)
모든 Supabase 쿼리는 `src/lib/repositories/`에서만 작성한다.
페이지나 컴포넌트에서 `supabase.from(...)` 직접 호출 금지.
함수 시그니처: `fn(supabase: SupabaseClient, ...args)`
→ 나중에 Go 백엔드로 교체 시 이 파일들만 수정하면 됨.

```
src/lib/repositories/
  auth.ts       signIn, signUp, signOut, getUser
  profiles.ts   getProfileByUsername, getPaymentProfile,
                getProfileWithLinksByUserId, createProfile,
                updateProfile, isUsernameTaken
  links.ts      createLink, updateLink, deleteLink, reorderLinks
```

### Server vs Client 컴포넌트
- 데이터 페칭 → Server Component (또는 server action)
- UI 상태 / 이벤트 핸들러 → Client Component
- 대시보드 패턴: `page.tsx`(server, 데이터 페칭) → `DashboardClient.tsx`(client, UI)

### Supabase 클라이언트
- Server Component: `createClient()` from `@/lib/supabase/server`
- Client Component: `createClient()` from `@/lib/supabase/client`

### 중복 쿼리 방지
`generateMetadata`와 페이지 컴포넌트가 같은 데이터를 쓸 때 `cache()` 사용.

```ts
const fetchProfile = cache(async (username: string) => { ... })
```

---

## 디자인 규칙

### 모바일 퍼스트
- 모바일: 카드가 전체 화면 (`min-h-screen`)
- 데스크탑: 중앙 정렬 카드 (`sm:max-w-sm sm:rounded-2xl`)
- 모바일 전용 클래스 → base, 데스크탑 전용 → `sm:` prefix

### 버튼 고정 (명함 페이지)
연락처 저장 / 송금하기 버튼:
- 모바일: `fixed bottom-0` + `bg` inline style (테마 색상 맞춤)
- 데스크탑: `sm:static sm:border-t-0 sm:bg-transparent`

### 테마 시스템
`src/lib/themes.ts`에 정의.
- `THEMES`: 배경 색상 팔레트 (`ThemeKey`)
- `TEXT_COLORS`: 텍스트 색상 팔레트 (`TextColorKey`)
- `buildThemeClasses(textColorKey)`: 텍스트 컬러에 따른 전체 UI 클래스 세트 반환
- `getTheme(key)` / `getTextColor(key)`: null-safe 조회 헬퍼

---

## DB 스키마 주요 컬럼 (profiles)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `show_bio` ~ `show_pay` | boolean | 명함 표시 토글 |
| `theme` | text | 배경 테마 키 (default: `'default'`) |
| `text_color` | text | 텍스트 색상 키 (default: `'black'`) |
| `bank_name` ~ `toss_url` | text | 송금 정보 (`/pay` 페이지 전용) |

스키마 변경 시 `supabase/schema.sql` + `src/types/index.ts` 동시 업데이트.

---

## 파일 구조 요약

```
src/
  app/
    [username]/
      page.tsx          공개 명함 페이지 (server)
      VCardButton.tsx   연락처 저장 버튼 (client)
      pay/              송금 페이지
    auth/page.tsx       로그인/회원가입
    dashboard/
      page.tsx          대시보드 서버 래퍼
      DashboardClient.tsx  대시보드 UI (client)
  components/
    LinkIcon.tsx        아이콘 렌더러 (URL이면 img, 아니면 Lucide)
  lib/
    repositories/       모든 Supabase 쿼리
    supabase/           client.ts / server.ts
    themes.ts           테마 + 텍스트 색상 정의
    icons.ts            URL → 아이콘 자동감지
    vcf.ts              vCard 생성
  types/index.ts        Profile, Link, ProfileWithLinks
```

---

## 향후 예정 작업 (미구현)
- 자유 RGB 색상 피커 + 실시간 명함 미리보기 (대시보드 2열 레이아웃 필요)
  - 구현 시 `theme` / `text_color` 컬럼을 hex string으로 교체
