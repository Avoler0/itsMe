import type { SupabaseClient } from '@supabase/supabase-js'
import type { Link } from '@/types'

/**
 * 링크 추가
 */
export async function createLink(
  supabase: SupabaseClient,
  profileId: string,
  fields: Pick<Link, 'title' | 'url' | 'icon' | 'order_index'>
): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .insert({ profile_id: profileId, ...fields })
    .select()
    .single()

  if (error) return null
  return data as Link
}

/**
 * 링크 수정
 */
export async function updateLink(
  supabase: SupabaseClient,
  id: string,
  fields: Partial<Pick<Link, 'title' | 'url' | 'icon'>>
): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return data as Link
}

/**
 * 링크 삭제
 */
export async function deleteLink(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from('links').delete().eq('id', id)
  return !error
}

/**
 * 링크 순서 일괄 변경 (드래그 앤 드롭 후 저장)
 */
export async function reorderLinks(
  supabase: SupabaseClient,
  updates: { id: string; order_index: number }[]
): Promise<boolean> {
  const results = await Promise.all(
    updates.map(({ id, order_index }) =>
      supabase.from('links').update({ order_index }).eq('id', id)
    )
  )
  return results.every(({ error }) => !error)
}
