import Link from 'next/link'
import { Zap, Link2, Palette } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* ── 헤더 ── */}
      <header className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-neutral-900">itsMe</span>
        <Link
          href="/auth"
          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          로그인
        </Link>
      </header>

      {/* ── 히어로 ── */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          나를 소개하는<br />가장 단순한 방법
        </h1>
        <p className="mt-5 text-base sm:text-lg text-neutral-400 leading-relaxed">
          링크, 연락처, 계좌까지 — 하나의 명함으로.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center mt-8 px-6 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          지금 시작하기 →
        </Link>
      </section>

      {/* ── 명함 미리보기 ── */}
      <section className="max-w-sm mx-auto px-6 pb-20">
        <div className="w-full aspect-[9/16] sm:aspect-[3/4] rounded-2xl border border-neutral-100 shadow-lg bg-neutral-50 flex items-center justify-center overflow-hidden">
          {/* 실제 스크린샷으로 교체 예정 */}
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-8">
            <div className="w-16 h-16 rounded-full bg-neutral-200" />
            <div className="w-24 h-3 rounded-full bg-neutral-200" />
            <div className="w-32 h-2.5 rounded-full bg-neutral-100 mt-1" />
            <div className="mt-4 w-full space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-100 bg-white">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 flex-shrink-0" />
                  <div className="h-2.5 rounded-full bg-neutral-100 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-neutral-300 mt-4">실제 명함 화면</p>
      </section>

      {/* ── 피처 ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Zap,     title: '1분 만에 완성',    desc: '이름, 링크, 연락처만 입력하면 바로 공유 가능한 명함이 완성됩니다.' },
            { icon: Link2,   title: '모든 링크 한 곳에', desc: 'SNS, 포트폴리오, 유튜브 — 내 모든 링크를 하나의 URL로 공유하세요.' },
            { icon: Palette, title: '내 스타일로',       desc: '배경색, 텍스트 색상, 버튼 색상까지 자유롭게 꾸밀 수 있어요.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-neutral-100 p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center">
                <Icon size={16} className="text-neutral-600" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-neutral-100 py-8 text-center">
        <p className="text-xs text-neutral-300 tracking-widest uppercase">itsMe</p>
      </footer>

    </main>
  )
}
