'use client'

import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { THEMES, TEXT_COLORS, type ThemeKey, type TextColorKey } from '@/lib/themes'
import { isValidHexColor } from '@/lib/validation'
import { updateProfile } from '@/lib/repositories/profiles'
import type { Profile } from '@/types'

interface Props {
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
  supabase: SupabaseClient
}

export default function VisibilitySection({ profile, setProfile, supabase }: Props) {
  const [colorPickerOpen, setColorPickerOpen] = useState<'bg' | 'text' | 'btn' | null>(null)
  const bgColorInputRef = useRef<HTMLInputElement>(null)
  const textColorInputRef = useRef<HTMLInputElement>(null)
  const btnColorInputRef = useRef<HTMLInputElement>(null)

  async function saveColor(field: 'theme' | 'text_color' | 'button_color', value: string) {
    if (value.startsWith('#') && !isValidHexColor(value)) return
    setProfile((p) => ({ ...p, [field]: value }))
    await updateProfile(supabase, profile.user_id, { [field]: value })
  }

  return (
    <section className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-50">
        <h2 className="text-sm font-semibold text-neutral-800">명함 표시 설정</h2>
        <p className="text-xs text-neutral-400 mt-1">명함에 보여줄 항목을 선택하세요</p>
      </div>

      <div className="px-6 py-5 space-y-3">
        {/* 색상 설정 */}
        <div className="pb-3 border-b border-neutral-50 space-y-4">

          {/* 배경 색상 */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-3">배경 색상</p>
            <div className="flex gap-3 items-center flex-wrap">
              {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, t]) => (
                <button
                  key={key}
                  title={t.label}
                  onClick={() => saveColor('theme', key)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    (profile.theme ?? 'default') === key
                      ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
                      : 'hover:scale-105'
                  } ${t.swatchBorder ? 'border border-neutral-200' : ''}`}
                  style={{ backgroundColor: t.swatchColor }}
                />
              ))}
              <div className="relative">
                <button
                  title="직접 선택"
                  onClick={() => setColorPickerOpen(colorPickerOpen === 'bg' ? null : 'bg')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    (profile.theme ?? '').startsWith('#')
                      ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
                      : 'border-2 border-dashed border-neutral-300 hover:border-neutral-500 hover:scale-105'
                  }`}
                  style={(profile.theme ?? '').startsWith('#') ? { backgroundColor: profile.theme! } : undefined}
                >
                  {!(profile.theme ?? '').startsWith('#') && (
                    <Plus size={12} className="text-neutral-400" />
                  )}
                </button>
                {colorPickerOpen === 'bg' && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-lg border border-neutral-100 p-3">
                    <p className="text-xs text-neutral-400 mb-2 text-center">배경 색상</p>
                    <input
                      ref={bgColorInputRef}
                      type="color"
                      className="w-24 h-8 rounded cursor-pointer border-0"
                      value={(profile.theme ?? '').startsWith('#') ? (profile.theme ?? '#ffffff') : '#ffffff'}
                      onChange={(e) => saveColor('theme', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 텍스트 색상 */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-3">텍스트 색상</p>
            <div className="flex gap-3 items-center flex-wrap">
              {(Object.entries(TEXT_COLORS) as [TextColorKey, typeof TEXT_COLORS[TextColorKey]][]).map(([key, t]) => (
                <button
                  key={key}
                  title={t.label}
                  onClick={() => saveColor('text_color', key)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    (profile.text_color ?? 'black') === key
                      ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
                      : 'hover:scale-105'
                  } ${t.swatchBorder ? 'border border-neutral-200' : ''}`}
                  style={{ backgroundColor: t.swatchColor }}
                />
              ))}
              <div className="relative">
                <button
                  title="직접 선택"
                  onClick={() => setColorPickerOpen(colorPickerOpen === 'text' ? null : 'text')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    (profile.text_color ?? '').startsWith('#')
                      ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
                      : 'border-2 border-dashed border-neutral-300 hover:border-neutral-500 hover:scale-105'
                  }`}
                  style={(profile.text_color ?? '').startsWith('#') ? { backgroundColor: profile.text_color! } : undefined}
                >
                  {!(profile.text_color ?? '').startsWith('#') && (
                    <Plus size={12} className="text-neutral-400" />
                  )}
                </button>
                {colorPickerOpen === 'text' && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-lg border border-neutral-100 p-3">
                    <p className="text-xs text-neutral-400 mb-2 text-center">텍스트 색상</p>
                    <input
                      ref={textColorInputRef}
                      type="color"
                      className="w-24 h-8 rounded cursor-pointer border-0"
                      value={(profile.text_color ?? '').startsWith('#') ? (profile.text_color ?? '#000000') : '#000000'}
                      onChange={(e) => saveColor('text_color', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 버튼 색상 */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-3">버튼 색상</p>
            <div className="flex gap-3 items-center flex-wrap">
              <button
                title="기본"
                onClick={() => saveColor('button_color', '')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  !profile.button_color
                    ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110 bg-neutral-900'
                    : 'bg-neutral-900 hover:scale-105'
                }`}
              >
                <span className="text-white text-[9px] font-bold">기본</span>
              </button>
              <div className="relative">
                <button
                  title="직접 선택"
                  onClick={() => setColorPickerOpen(colorPickerOpen === 'btn' ? null : 'btn')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    profile.button_color
                      ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
                      : 'border-2 border-dashed border-neutral-300 hover:border-neutral-500 hover:scale-105'
                  }`}
                  style={profile.button_color ? { backgroundColor: profile.button_color } : undefined}
                >
                  {!profile.button_color && (
                    <Plus size={12} className="text-neutral-400" />
                  )}
                </button>
                {colorPickerOpen === 'btn' && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-lg border border-neutral-100 p-3">
                    <p className="text-xs text-neutral-400 mb-2 text-center">버튼 색상</p>
                    <input
                      ref={btnColorInputRef}
                      type="color"
                      className="w-24 h-8 rounded cursor-pointer border-0"
                      value={profile.button_color ?? '#111111'}
                      onChange={(e) => saveColor('button_color', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 표시 토글 */}
        {([
          { key: 'show_bio',   label: '소개 (Bio)' },
          { key: 'show_email', label: '이메일' },
          { key: 'show_phone', label: '전화번호' },
          { key: 'show_vcard', label: '연락처 저장 버튼' },
          { key: 'show_pay',   label: '송금하기 버튼' },
        ] as { key: keyof Pick<Profile, 'show_bio' | 'show_email' | 'show_phone' | 'show_vcard' | 'show_pay'>; label: string }[]).map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-neutral-700">{label}</span>
            <div
              onClick={() => setProfile((p) => ({ ...p, [key]: !p[key] }))}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                profile[key] ? 'bg-neutral-900' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform translate-y-0.5 ${
                  profile[key] ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </label>
        ))}
      </div>
    </section>
  )
}
