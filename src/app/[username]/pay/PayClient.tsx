'use client'

import { useState } from 'react'
import { Copy, Check, ChevronLeft, Wallet } from 'lucide-react'
import Link from 'next/link'

interface PaymentProfile {
  username: string
  display_name: string
  bank_name: string | null
  account_number: string | null
  account_holder: string | null
  kakao_pay_url: string | null
  toss_url: string | null
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        copied
          ? 'bg-green-50 text-green-600'
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? '복사됨' : '복사'}
    </button>
  )
}

export default function PayClient({ profile }: { profile: PaymentProfile }) {
  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">

        {/* 뒤로가기 */}
        <Link
          href={`/${profile.username}`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors mb-6"
        >
          <ChevronLeft size={13} />
          {profile.display_name}의 명함으로
        </Link>

        {/* 카드 */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">

          {/* 헤더 */}
          <div className="px-6 pt-6 pb-5 text-center border-b border-neutral-50">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <Wallet size={16} className="text-neutral-500" />
            </div>
            <h1 className="text-sm font-semibold text-neutral-800">
              {profile.display_name}에게 송금
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              계좌번호를 복사하거나 앱으로 바로 송금하세요
            </p>
          </div>

          {/* 계좌 정보 */}
          <div className="px-6 py-5 space-y-4">

            {/* 은행 + 계좌번호 + 예금주 */}
            {(profile.bank_name || profile.account_number) && (
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-4 space-y-3">
                {profile.bank_name && (
                  <div>
                    <p className="text-xs text-neutral-400 mb-0.5">은행</p>
                    <p className="text-sm font-medium text-neutral-800">{profile.bank_name}</p>
                  </div>
                )}
                {profile.account_number && (
                  <>
                    <div className="h-px bg-neutral-100" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-400 mb-0.5">계좌번호</p>
                        <p className="text-sm font-medium text-neutral-800 font-mono tracking-wide">
                          {profile.account_number}
                        </p>
                      </div>
                      <CopyButton text={profile.account_number} />
                    </div>
                  </>
                )}
                {profile.account_holder && (
                  <>
                    <div className="h-px bg-neutral-100" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-400 mb-0.5">예금주</p>
                        <p className="text-sm font-medium text-neutral-800">{profile.account_holder}</p>
                      </div>
                      {profile.bank_name && profile.account_number && (
                        <CopyButton
                          text={`${profile.bank_name} ${profile.account_number} ${profile.account_holder}`}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 간편 송금 */}
            {(profile.kakao_pay_url || profile.toss_url) && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-400 px-1">간편 송금</p>
                <div className="grid grid-cols-2 gap-2">
                  {profile.kakao_pay_url && (
                    <a
                      href={profile.kakao_pay_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2C6.48 2 2 5.82 2 10.5c0 2.93 1.76 5.5 4.44 7.05L5.5 22l4.88-2.6c.52.07 1.07.1 1.62.1 5.52 0 10-3.82 10-8.5S17.52 2 12 2z"
                          fill="#3A1D1D"
                        />
                      </svg>
                      <span className="text-xs font-medium text-neutral-700">카카오페이</span>
                    </a>
                  )}
                  {profile.toss_url && (
                    <a
                      href={profile.toss_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="6" fill="#0064FF" />
                        <path
                          d="M7 12.5C7 10.015 9.015 8 11.5 8H13v2h-1.5C10.12 10 9 11.12 9 12.5S10.12 15 11.5 15H13v2h-1.5C9.015 17 7 14.985 7 12.5z"
                          fill="white"
                        />
                        <path
                          d="M13 8h1.5C16.985 8 19 10.015 19 12.5S16.985 17 14.5 17H13v-2h1.5c1.38 0 2.5-1.12 2.5-2.5S15.88 10 14.5 10H13V8z"
                          fill="white"
                        />
                      </svg>
                      <span className="text-xs font-medium text-neutral-700">토스</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <p className="text-center text-xs text-neutral-300 mt-5 tracking-widest uppercase">
          itsMe
        </p>
      </div>
    </main>
  )
}
