'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signIn, signUp } from '@/lib/repositories/auth'
import { createProfile } from '@/lib/repositories/profiles'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', password: '', username: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await signIn(supabase, form.email, form.password)
      if (error) {
        setError('이메일 또는 비밀번호가 올바르지 않아요.')
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()

    } else {
      const { user, error: signUpError } = await signUp(supabase, form.email, form.password)
      if (signUpError || !user) {
        setError('가입 중 오류가 발생했어요. 다시 시도해주세요.')
        setLoading(false)
        return
      }

      const profile = await createProfile(supabase, user.id, form.username, form.username)
      if (!profile) {
        setError('이미 사용 중인 사용자명이에요.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">

        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
            itsMe
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {mode === 'login' ? '다시 만나서 반가워요' : '지금 바로 시작하세요'}
          </p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">

          {/* 탭 */}
          <div className="flex border-b border-neutral-100">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  mode === m
                    ? 'text-neutral-900 border-b-2 border-neutral-900 -mb-px'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {m === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">

            {/* 사용자명 (회원가입만) */}
            {mode === 'signup' && (
              <div className="space-y-1.5 animate-slide-up">
                <label className="text-xs font-medium text-neutral-500">
                  사용자명
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400 pointer-events-none">
                    itsme.app/
                  </span>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="jisoo"
                    required={mode === 'signup'}
                    className="w-full pl-[7.5rem] pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            {/* 이메일 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                이메일
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jisoo@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                비밀번호
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-xs text-red-500 animate-slide-up">{error}</p>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 active:bg-neutral-950 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : mode === 'login' ? (
                '로그인'
              ) : (
                '가입하기'
              )}
            </button>
          </form>
        </div>

        {/* 하단 브랜딩 */}
        <p className="text-center text-xs text-neutral-300 mt-5 tracking-widest uppercase">
          It's Me
        </p>
      </div>
    </main>
  )
}
