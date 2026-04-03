'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, LogOut, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/lib/repositories/profiles'
import { signOut } from '@/lib/repositories/auth'
import ProfileSection from './ProfileSection'
import LinkSection from './LinkSection'
import PaymentSection from './PaymentSection'
import VisibilitySection from './VisibilitySection'
import type { Link, Profile, ProfileWithLinks } from '@/types'

interface Props {
  initialProfile: ProfileWithLinks
}

export default function DashboardClient({ initialProfile }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [links, setLinks] = useState<Link[]>(initialProfile.links)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    await updateProfile(supabase, profile.user_id, {
      display_name: profile.display_name,
      username: profile.username,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      bank_name: profile.bank_name,
      account_number: profile.account_number,
      account_holder: profile.account_holder,
      kakao_pay_url: profile.kakao_pay_url,
      toss_url: profile.toss_url,
      show_bio: profile.show_bio,
      show_email: profile.show_email,
      show_phone: profile.show_phone,
      show_vcard: profile.show_vcard,
      show_pay: profile.show_pay,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  async function handleLogout() {
    await signOut(supabase)
    router.push('/auth')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── 헤더 ── */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-neutral-900">itsMe</span>
          <div className="flex items-center gap-3">
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              <ExternalLink size={12} />
              내 명함 보기
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <LogOut size={12} />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* ── 본문 ── */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">

        {uploadError && (
          <p className="text-xs text-red-500 px-1">{uploadError}</p>
        )}

        <ProfileSection
          profile={profile}
          setProfile={setProfile}
          supabase={supabase}
          onUploadError={setUploadError}
        />

        <LinkSection
          links={links}
          setLinks={setLinks}
          profile={profile}
          supabase={supabase}
        />

        <PaymentSection
          profile={profile}
          setProfile={setProfile}
        />

        <VisibilitySection
          profile={profile}
          setProfile={setProfile}
          supabase={supabase}
        />

        {/* ── 저장 버튼 ── */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}
            {saved ? '저장됨' : '저장'}
          </button>
        </div>

      </main>
    </div>
  )
}
