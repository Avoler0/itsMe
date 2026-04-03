'use client'

import { useRef } from 'react'
import { Camera } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { updateProfile } from '@/lib/repositories/profiles'
import { validateImageFile, VALID_IMAGE_MIMES, MAX_LENGTHS } from '@/lib/validation'
import type { Profile } from '@/types'

interface Props {
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
  supabase: SupabaseClient
  onUploadError: (err: string | null) => void
}

export default function ProfileSection({ profile, setProfile, supabase, onUploadError }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = profile.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <section className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-50">
        <h2 className="text-sm font-semibold text-neutral-800">프로필</h2>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* 아바타 */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center cursor-pointer group overflow-hidden flex-shrink-0"
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-base font-semibold">{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} className="text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const err = validateImageFile(file)
              if (err) { onUploadError(err); return }
              onUploadError(null)
              const ext = VALID_IMAGE_MIMES[file.type]
              const path = `${profile.user_id}/avatar.${ext}`
              const { data, error } = await supabase.storage
                .from('avatars')
                .upload(path, file, { upsert: true })
              if (error || !data) return
              const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path)
              const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`
              await updateProfile(supabase, profile.user_id, { avatar_url: avatarUrl })
              setProfile((p) => ({ ...p, avatar_url: avatarUrl }))
            }}
          />
          <div>
            <p className="text-sm font-medium text-neutral-700">프로필 사진</p>
            <p className="text-xs text-neutral-400 mt-0.5">클릭해서 변경</p>
          </div>
        </div>

        {/* 이름 / 사용자명 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">이름</label>
            <input
              value={profile.display_name}
              onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
              maxLength={MAX_LENGTHS.display_name}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">사용자명</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none">@</span>
              <input
                value={profile.username}
                onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                maxLength={MAX_LENGTHS.username}
                className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* 소개 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">소개</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            rows={2}
            maxLength={MAX_LENGTHS.bio}
            placeholder="간단한 소개를 적어보세요"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition resize-none"
          />
        </div>

        {/* 이메일 / 전화 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">이메일</label>
            <input
              type="email"
              value={profile.email ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              maxLength={MAX_LENGTHS.email}
              placeholder="jisoo@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">전화번호</label>
            <input
              type="tel"
              value={profile.phone ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              maxLength={MAX_LENGTHS.phone}
              placeholder="+82-10-0000-0000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
