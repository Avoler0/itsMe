import type { SupabaseClient } from '@supabase/supabase-js'

export async function logPageView(
  supabase: SupabaseClient,
  path: string,
  referrer?: string,
  userAgent?: string,
) {
  await supabase.from('page_views').insert({
    path,
    referrer: referrer ?? null,
    user_agent: userAgent ?? null,
  })
}
