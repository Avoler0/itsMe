'use client'

import { Wallet } from 'lucide-react'
import { MAX_LENGTHS } from '@/lib/validation'
import type { Profile } from '@/types'

interface Props {
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
}

export default function PaymentSection({ profile, setProfile }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-50 flex items-center gap-2">
        <Wallet size={14} className="text-neutral-400" />
        <h2 className="text-sm font-semibold text-neutral-800">계좌 / 송금</h2>
      </div>

      <div className="px-6 py-6 space-y-4">
        <p className="text-xs text-neutral-400">
          입력한 정보는{' '}
          <span className="font-medium text-neutral-600">/{profile.username}/pay</span>{' '}
          페이지에서만 보여요.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">은행명</label>
            <input
              value={profile.bank_name ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, bank_name: e.target.value }))}
              maxLength={MAX_LENGTHS.bank_name}
              placeholder="카카오뱅크"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">예금주</label>
            <input
              value={profile.account_holder ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, account_holder: e.target.value }))}
              maxLength={MAX_LENGTHS.account_holder}
              placeholder="홍길동"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">계좌번호</label>
          <input
            value={profile.account_number ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, account_number: e.target.value }))}
            maxLength={MAX_LENGTHS.account_number}
            placeholder="0000-00-0000000"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 font-mono placeholder:text-neutral-300 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">카카오페이 URL</label>
            <input
              value={profile.kakao_pay_url ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, kakao_pay_url: e.target.value }))}
              maxLength={MAX_LENGTHS.kakao_pay_url}
              placeholder="https://qr.kakaopay.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">토스 URL</label>
            <input
              value={profile.toss_url ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, toss_url: e.target.value }))}
              maxLength={MAX_LENGTHS.toss_url}
              placeholder="https://toss.me/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
