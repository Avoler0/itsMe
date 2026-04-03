import { ExternalLink, Mail, Phone, Wallet } from 'lucide-react'
import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Link as LinkType } from '@/types'
import VCardButton from './VCardButton'
import LinkIcon from '@/components/LinkIcon'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/lib/repositories/profiles'
import { getTheme, resolveTextColorHex, isDarkColor, buildThemeClasses } from '@/lib/themes'

// ─── 데이터 페칭 (generateMetadata + Page가 각각 호출해도 쿼리는 1번) ──
const fetchProfile = cache(async (username: string) => {
  const supabase = await createClient()
  return getProfileByUsername(supabase, username)
})

// ─── Metadata ──────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const profile = await fetchProfile(username)
  if (!profile) return { title: 'Not Found' }
  return {
    title: `${profile.display_name} (@${username}) — itsMe`,
    description: profile.bio,
  }
}

// ─── Page ──────────────────────────────────────────────────────
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const profile = await fetchProfile(username)
  if (!profile) notFound()

  const theme = getTheme(profile.theme)
  const textHex = resolveTextColorHex(profile.text_color)
  const bgIsLight = !isDarkColor(theme.cardColor)
  const c = buildThemeClasses(bgIsLight)

  // 버튼 스타일 (button_color 지정 시 적용)
  const btnStyle = profile.button_color
    ? { backgroundColor: profile.button_color, borderColor: profile.button_color, color: '#fff' }
    : undefined

  const initials = profile.display_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const hasButtons =
    profile.show_vcard ||
    (profile.show_pay && (profile.bank_name || profile.kakao_pay_url || profile.toss_url))

  return (
    <main
      className={`min-h-screen ${theme.pageBg} flex flex-col items-center sm:justify-center sm:p-4`}
      style={!theme.pageBg ? { backgroundColor: theme.cardColor } : undefined}
    >
      <div className="w-full sm:max-w-sm animate-fade-in">

        {/* ── 카드 ── */}
        <div
          className={`sm:rounded-2xl sm:border ${c.divider} sm:shadow-sm overflow-hidden min-h-screen sm:min-h-0`}
          style={{ backgroundColor: theme.cardColor, color: textHex }}
        >

          {/* 프로필 헤더 */}
          <div className="px-8 pt-8 pb-6 text-center">
            {/* 아바타 */}
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-semibold tracking-tight">
                  {initials}
                </span>
              )}
            </div>

            {/* 이름 */}
            <h1 className={`text-xl font-semibold tracking-tight ${c.name}`}>
              {profile.display_name}
            </h1>
            <p className={`text-xs mt-1 ${c.username}`}>@{profile.username}</p>

            {/* 소개 */}
            {profile.show_bio && profile.bio && (
              <p className={`mt-3 text-sm leading-relaxed whitespace-pre-line ${c.bio}`}>
                {profile.bio}
              </p>
            )}

            {/* 연락처 배지 */}
            {((profile.show_email && profile.email) || (profile.show_phone && profile.phone)) && (
              <div className="mt-4 flex items-center justify-center gap-3">
                {profile.show_email && profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${c.contact}`}
                  >
                    <Mail size={12} />
                    {profile.email}
                  </a>
                )}
                {profile.show_phone && profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${c.contact}`}
                  >
                    <Phone size={12} />
                    {profile.phone}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className={`h-px mx-6 ${c.divider}`} />

          {/* 링크 목록 */}
          {profile.links && profile.links.length > 0 && (
            <div className="px-4 py-4 space-y-1.5">
              {profile.links.map((link: LinkType) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${c.linkHover}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${c.linkIconBg}`}>
                    <LinkIcon icon={link.icon} size={14} />
                  </div>
                  <span className={`flex-1 text-sm font-medium ${c.linkTitle}`}>
                    {link.title}
                  </span>
                  <ExternalLink
                    size={12}
                    className={`transition-colors ${c.linkArrow}`}
                  />
                </a>
              ))}
            </div>
          )}

          {/* 버튼 영역 — 모바일: 하단 고정 / 데스크탑: 인라인 */}
          {hasButtons && (
            <div
              className={`fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 border-t space-y-2 sm:static sm:border-t-0 sm:pt-2 sm:pb-6 ${c.bottomBorder}`}
              style={{ backgroundColor: theme.cardColor }}
            >
              {profile.show_vcard && (
                <VCardButton profile={profile} vcardBtnClass={c.vcardBtn} buttonColor={profile.button_color ?? undefined} />
              )}
              {profile.show_pay && (profile.bank_name || profile.kakao_pay_url || profile.toss_url) && (
                <Link
                  href={`/${profile.username}/pay`}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${btnStyle ? '' : c.vcardBtn}`}
                  style={btnStyle}
                >
                  <Wallet size={14} />
                  송금하기
                </Link>
              )}
            </div>
          )}

          {/* 고정 버튼 영역만큼 하단 여백 확보 (모바일만) */}
          <div className="h-32 sm:hidden" />

          {/* 푸터 (모바일: 카드 안) */}
          <p className={`text-center text-xs pb-8 tracking-widest uppercase sm:hidden ${c.footer}`}>
            itsMe
          </p>
        </div>

        {/* 푸터 (데스크탑: 카드 밖) */}
        <p className={`hidden sm:block text-center text-xs mt-5 tracking-widest uppercase ${c.footer}`}
           style={{ color: textHex }}>
          itsMe
        </p>
      </div>
    </main>
  )
}
