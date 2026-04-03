'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  LogOut,
  Camera,
  Loader2,
  Check,
  Wallet,
  ImageIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { detectIcon } from '@/lib/icons'
import { THEMES, TEXT_COLORS, type ThemeKey, type TextColorKey } from '@/lib/themes'
import { updateProfile } from '@/lib/repositories/profiles'
import { createLink, deleteLink, reorderLinks } from '@/lib/repositories/links'
import { signOut } from '@/lib/repositories/auth'
import LinkIcon from '@/components/LinkIcon'
import type { Link, Profile, ProfileWithLinks } from '@/types'

// ─── Props ─────────────────────────────────────────────────────
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
  const [newLink, setNewLink] = useState({ title: '', url: '', iconFile: null as File | null, iconPreview: '' })
  const [addingLink, setAddingLink] = useState(false)

  // 드래그 상태 (ref: 드롭 로직용, state: 시각 피드백용)
  const dragIndexRef = useRef<number | null>(null)
  const [dragVisualIndex, setDragVisualIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // 색상 피커 팝오버
  const [colorPickerOpen, setColorPickerOpen] = useState<'bg' | 'text' | 'btn' | null>(null)
  const bgPickerRef = useRef<HTMLDivElement>(null)
  const textPickerRef = useRef<HTMLDivElement>(null)
  const btnPickerRef = useRef<HTMLDivElement>(null)
  const bgColorInputRef = useRef<HTMLInputElement>(null)
  const textColorInputRef = useRef<HTMLInputElement>(null)
  const btnColorInputRef = useRef<HTMLInputElement>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const initials = profile.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // ── 전체 저장 (프로필 + 계좌 + 표시 설정) ──────────────────
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

  // ── 링크 추가 ────────────────────────────────────────────────
  async function handleAddLink() {
    if (!newLink.title || !newLink.url) return

    let icon = detectIcon(newLink.url)

    if (newLink.iconFile) {
      const ext = newLink.iconFile.name.split('.').pop()
      const path = `${profile.user_id}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('link-icons')
        .upload(path, newLink.iconFile, { upsert: true })
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('link-icons').getPublicUrl(data.path)
        icon = urlData.publicUrl
      }
    }

    const link = await createLink(supabase, profile.id, {
      title: newLink.title,
      url: newLink.url,
      icon,
      order_index: links.length,
    })
    if (link) setLinks((prev) => [...prev, link])
    setNewLink({ title: '', url: '', iconFile: null, iconPreview: '' })
    setAddingLink(false)
  }

  // ── 링크 삭제 ────────────────────────────────────────────────
  async function handleDeleteLink(id: string) {
    await deleteLink(supabase, id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  // ── 드래그 앤 드롭 ──────────────────────────────────────────
  function handleDragStart(index: number) {
    dragIndexRef.current = index
    setDragVisualIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  async function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault()
    const dragIndex = dragIndexRef.current
    if (dragIndex === null || dragIndex === dropIndex) {
      dragIndexRef.current = null
      setDragOverIndex(null)
      return
    }

    const reordered = [...links]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    const withNewIndex = reordered.map((l, i) => ({ ...l, order_index: i }))
    setLinks(withNewIndex)
    dragIndexRef.current = null
    setDragVisualIndex(null)
    setDragOverIndex(null)

    await reorderLinks(supabase, withNewIndex.map(({ id, order_index }) => ({ id, order_index })))
  }

  function handleDragEnd() {
    dragIndexRef.current = null
    setDragVisualIndex(null)
    setDragOverIndex(null)
  }

  // ── 로그아웃 ─────────────────────────────────────────────────
  async function handleLogout() {
    await signOut(supabase)
    router.push('/auth')
    router.refresh()
  }

  // ── 색상 즉시 저장 헬퍼 ──────────────────────────────────────
  async function saveColor(field: 'theme' | 'text_color' | 'button_color', value: string) {
    setProfile((p) => ({ ...p, [field]: value }))
    await updateProfile(supabase, profile.user_id, { [field]: value })
  }

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── 헤더 ── */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            itsMe
          </span>
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

        {/* ── 프로필 섹션 ── */}
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
                  const ext = file.name.split('.').pop()
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
                  placeholder="+82-10-0000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 링크 섹션 ── */}
        <section className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-800">링크</h2>
            <button
              onClick={() => setAddingLink(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              <Plus size={13} />
              추가
            </button>
          </div>

          <div className="divide-y divide-neutral-50">
            {links.map((link, index) => (
              <div
                key={link.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 px-4 py-3.5 group transition-colors ${
                  dragOverIndex === index && dragVisualIndex !== index
                    ? 'bg-neutral-100'
                    : 'hover:bg-neutral-50/50'
                } ${dragVisualIndex === index ? 'opacity-40' : ''}`}
              >
                <GripVertical size={14} className="text-neutral-300 cursor-grab flex-shrink-0" />
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <LinkIcon icon={link.icon} size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700 truncate">{link.title}</p>
                  <p className="text-xs text-neutral-400 truncate">{link.url}</p>
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {links.length === 0 && !addingLink && (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-neutral-400">아직 링크가 없어요</p>
                <button onClick={() => setAddingLink(true)} className="mt-3 text-sm text-neutral-900 font-medium hover:underline">
                  첫 링크 추가하기
                </button>
              </div>
            )}

            {addingLink && (
              <div className="mx-4 my-3 rounded-2xl border border-neutral-200 bg-white overflow-hidden animate-slide-up">

                {/* 입력 영역 */}
                <div className="p-4 space-y-2">
                  <input
                    value={newLink.url}
                    onChange={(e) => setNewLink((v) => ({ ...v, url: e.target.value, iconFile: null, iconPreview: '' }))}
                    placeholder="https://..."
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:bg-white focus:border-neutral-300 transition"
                  />
                  <input
                    value={newLink.title}
                    onChange={(e) => setNewLink((v) => ({ ...v, title: e.target.value }))}
                    placeholder="링크 제목"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:bg-white focus:border-neutral-300 transition"
                  />
                </div>

                {/* 미리보기 */}
                {(newLink.url || newLink.title) && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-neutral-400 mb-1.5">미리보기</p>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-50">
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        className="relative w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0 overflow-hidden group hover:border-neutral-400 transition-colors"
                        title="클릭해서 아이콘 직접 등록"
                      >
                        {newLink.iconPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={newLink.iconPreview} alt="preview" className="w-full h-full object-contain" />
                        ) : (
                          <LinkIcon icon={newLink.url ? detectIcon(newLink.url) : 'link'} size={13} />
                        )}
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon size={10} className="text-white" />
                        </div>
                      </button>
                      <span className="flex-1 text-sm font-medium text-neutral-600 truncate">
                        {newLink.title || '링크 제목'}
                      </span>
                      <ExternalLink size={11} className="text-neutral-300 flex-shrink-0" />
                    </div>
                    {newLink.iconPreview && (
                      <button
                        type="button"
                        onClick={() => setNewLink((v) => ({ ...v, iconFile: null, iconPreview: '' }))}
                        className="mt-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        자동감지로 돌아가기
                      </button>
                    )}
                  </div>
                )}

                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setNewLink((v) => ({
                      ...v,
                      iconFile: file,
                      iconPreview: URL.createObjectURL(file),
                    }))
                  }}
                />

                {/* 버튼 */}
                <div className="flex border-t border-neutral-100">
                  <button
                    onClick={() => {
                      setAddingLink(false)
                      setNewLink({ title: '', url: '', iconFile: null, iconPreview: '' })
                    }}
                    className="flex-1 py-3 text-sm text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    취소
                  </button>
                  <div className="w-px bg-neutral-100" />
                  <button
                    onClick={handleAddLink}
                    className="flex-1 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── 계좌 / 송금 섹션 ── */}
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
                  placeholder="카카오뱅크"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">예금주</label>
                <input
                  value={profile.account_holder ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, account_holder: e.target.value }))}
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
                  placeholder="https://qr.kakaopay.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">토스 URL</label>
                <input
                  value={profile.toss_url ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, toss_url: e.target.value }))}
                  placeholder="https://toss.me/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 표시 설정 섹션 ── */}
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
                  {/* 커스텀 배경 색상 */}
                  <div className="relative" ref={bgPickerRef}>
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
                  {/* 커스텀 텍스트 색상 */}
                  <div className="relative" ref={textPickerRef}>
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
                  {/* 기본 (테마 따라감) */}
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
                  {/* 커스텀 버튼 색상 */}
                  <div className="relative" ref={btnPickerRef}>
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

        {/* ── 저장 버튼 (하단 단일) ── */}
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
