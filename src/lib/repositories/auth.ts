import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * 이메일/비밀번호 로그인
 */
export async function signIn(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, error }
}

/**
 * 이메일/비밀번호 회원가입
 */
export async function signUp(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data.user, error }
}

/**
 * 로그아웃
 */
export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * 현재 로그인한 유저 조회
 */
export async function getUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}
