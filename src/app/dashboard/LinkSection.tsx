'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, GripVertical, ExternalLink, ImageIcon } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { detectIcon } from '@/lib/icons'
import { createLink, deleteLink, reorderLinks } from '@/lib/repositories/links'
import { validateImageFile, VALID_IMAGE_MIMES, isValidLinkUrl, MAX_LENGTHS } from '@/lib/validation'
import LinkIcon from '@/components/LinkIcon'
import type { Link, Profile } from '@/types'

interface Props {
  links: Link[]
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>
  profile: Profile
  supabase: SupabaseClient
}

export default function LinkSection({ links, setLinks, profile, supabase }: Props) {
  const [newLink, setNewLink] = useState({ title: '', url: '', iconFile: null as File | null, iconPreview: '' })
  const [addingLink, setAddingLink] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)

  const dragIndexRef = useRef<number | null>(null)
  const [dragVisualIndex, setDragVisualIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  async function handleAddLink() {
    if (!newLink.title || !newLink.url) return

    if (!isValidLinkUrl(newLink.url)) {
      setLinkError('http:// 또는 https://로 시작하는 URL을 입력해주세요')
      return
    }
    if (newLink.title.length > MAX_LENGTHS.link_title) {
      setLinkError(`제목은 ${MAX_LENGTHS.link_title}자 이하여야 해요`)
      return
    }
    if (newLink.url.length > MAX_LENGTHS.link_url) {
      setLinkError('URL이 너무 길어요')
      return
    }
    setLinkError(null)

    let icon = detectIcon(newLink.url)

    if (newLink.iconFile) {
      const err = validateImageFile(newLink.iconFile)
      if (err) { setUploadError(err); return }
      const ext = VALID_IMAGE_MIMES[newLink.iconFile.type]
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

  async function handleDeleteLink(id: string) {
    await deleteLink(supabase, id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

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

  return (
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
                const err = validateImageFile(file)
                if (err) { setUploadError(err); return }
                setUploadError(null)
                setNewLink((v) => ({
                  ...v,
                  iconFile: file,
                  iconPreview: URL.createObjectURL(file),
                }))
              }}
            />

            {(linkError || uploadError) && (
              <p className="px-4 pb-2 text-xs text-red-500">{linkError ?? uploadError}</p>
            )}

            <div className="flex border-t border-neutral-100">
              <button
                onClick={() => {
                  setAddingLink(false)
                  setNewLink({ title: '', url: '', iconFile: null, iconPreview: '' })
                  setLinkError(null)
                  setUploadError(null)
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
  )
}
