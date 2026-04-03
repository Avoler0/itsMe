# MinimalLink

세상에서 가장 군더더기 없는 디지털 명함 서비스.

## 기술 스택

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel

## 시작하기

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. **SQL Editor**에서 `supabase/schema.sql` 전체 실행
3. **Settings > API**에서 URL과 anon key 복사

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
# .env.local 파일에 Supabase URL과 키 입력
```

### 3. 개발 서버 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 확인

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 랜딩 페이지
│   ├── auth/               # 로그인 / 회원가입
│   ├── dashboard/          # 프로필 & 링크 편집
│   └── [username]/         # 공개 프로필 페이지
├── components/             # 재사용 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # 브라우저용 Supabase 클라이언트
│   │   ├── server.ts       # 서버 컴포넌트용 클라이언트
│   │   └── middleware.ts   # 인증 미들웨어
│   ├── vcf.ts              # 연락처(.vcf) 다운로드 유틸
│   └── icons.ts            # URL → 아이콘 자동 매칭
└── types/
    └── index.ts            # 공통 타입 정의
```

## DB 스키마 요약

| 테이블 | 역할 |
|--------|------|
| `profiles` | 사용자 프로필 (username, bio, avatar 등) |
| `links` | 프로필에 연결된 외부 링크 목록 |

Row Level Security 적용 — 본인 데이터만 수정 가능, 조회는 누구나 가능.

## 배포 (Vercel)

```bash
# Vercel CLI
npx vercel

# 환경 변수는 Vercel 대시보드 > Settings > Environment Variables 에서 설정
```
