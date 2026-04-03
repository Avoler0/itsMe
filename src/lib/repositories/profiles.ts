import type { SupabaseClient } from '@supabase/supabase-js'
import type { Profile, ProfileWithLinks } from '@/types'

/**
 * username으로 공개 프로필 + 링크 조회 (공개 명함 페이지용)
 */
export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<ProfileWithLinks | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, links(*)')
    .eq('username', username)
    .order('order_index', { referencedTable: 'links', ascending: true })
    .single()

  if (error) return null
  return data as ProfileWithLinks
}

/**
 * username으로 계좌/송금 정보만 조회 (/pay 페이지용)
 */
export async function getPaymentProfile(
  supabase: SupabaseClient,
  username: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, display_name, bank_name, account_number, account_holder, kakao_pay_url, toss_url')
    .eq('username', username)
    .single()

  if (error) return null
  return data
}

/**
 * 로그인한 유저의 프로필 + 링크 조회 (대시보드용)
 */
export async function getProfileWithLinksByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileWithLinks | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, links(*)')
    .eq('user_id', userId)
    .order('order_index', { referencedTable: 'links', ascending: true })
    .single()

  if (error) return null
  return data as ProfileWithLinks
}

/**
 * 프로필 생성 (회원가입 시)
 */
export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  username: string,
  displayName: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ user_id: userId, username, display_name: displayName })
    .select()
    .single()

  if (error) return null
  return data as Profile
}

/**
 * 프로필 수정 (대시보드 저장)
 */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  fields: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return null
  return data as Profile
}

/**
 * username 중복 확인
 */
export async function isUsernameTaken(
  supabase: SupabaseClient,
  username: string
): Promise<boolean> {
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('username', username)

  return (count ?? 0) > 0
}
