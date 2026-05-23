'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Category = 'ide' | 'task' | 'pending' | 'parking' | 'done'

export interface ScrambleItem {
  id: string
  text: string
  category: Category
  aiNote: string
  createdAt: string
  updatedAt: string
  isExpanded: boolean
}

export interface DigestData {
  summary: string
  priorities: string[]
  mood: string
  generatedAt: string
}

export interface VisionData {
  headline: string
  themes: string[]
  wordCloud: string[]
  affirmations: string[]
  dailyMantra: string
  generatedAt: string
}

export interface MoodImage {
  id: string
  scene: string
  imageUrl: string
  caption: string
  hashtags: string
  generatedAt: string
}

interface ScrambleState {
  items: ScrambleItem[]
  digests: DigestData[]
  visions: VisionData[]
  moodImages: MoodImage[]
  activeTab: 'dump' | 'search' | 'vision' | 'mood'
  searchQuery: string
  isListening: boolean
  isAiLoading: boolean
  digestLoading: boolean
  visionLoading: boolean
  moodLoading: boolean

  // Actions
  setActiveTab: (tab: 'dump' | 'search' | 'vision' | 'mood') => void
  setSearchQuery: (query: string) => void
  setIsListening: (val: boolean) => void
  setIsAiLoading: (val: boolean) => void
  setDigestLoading: (val: boolean) => void
  setVisionLoading: (val: boolean) => void
  setMoodLoading: (val: boolean) => void

  addItem: (text: string, category: Category, aiNote: string) => void
  updateItemText: (id: string, text: string) => void
  updateItemCategory: (id: string, category: Category) => void
  deleteItem: (id: string) => void
  bulkDelete: (ids: string[]) => void
  bulkUpdateCategory: (ids: string[], category: Category) => void
  restoreItem: (item: ScrambleItem) => void
  reorderItems: (ids: string[]) => void
  toggleExpand: (id: string) => void
  addDigest: (digest: DigestData) => void
  addVision: (vision: VisionData) => void
  addMoodImage: (moodImage: MoodImage) => void
  importStore: (data: { items: ScrambleItem[]; digests: DigestData[]; visions: VisionData[]; moodImages: MoodImage[] }) => void
  getFilteredItems: () => ScrambleItem[]
  getItemsByCategory: (category: Category) => ScrambleItem[]
}

export const useScrambleStore = create<ScrambleState>()(
  persist(
    (set, get) => ({
      items: [],
      digests: [],
      visions: [],
      moodImages: [],
      activeTab: 'dump',
      searchQuery: '',
      isListening: false,
      isAiLoading: false,
      digestLoading: false,
      visionLoading: false,
      moodLoading: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setIsListening: (val) => set({ isListening: val }),
      setIsAiLoading: (val) => set({ isAiLoading: val }),
      setDigestLoading: (val) => set({ digestLoading: val }),
      setVisionLoading: (val) => set({ visionLoading: val }),
      setMoodLoading: (val) => set({ moodLoading: val }),

      addItem: (text, category, aiNote) => {
        const now = new Date().toISOString()
        const item: ScrambleItem = {
          id: crypto.randomUUID(),
          text,
          category,
          aiNote,
          createdAt: now,
          updatedAt: now,
          isExpanded: false,
        }
        set((state) => ({ items: [item, ...state.items] }))
      },

      updateItemText: (id, text) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, text, updatedAt: new Date().toISOString() } : item
          ),
        }))
      },

      updateItemCategory: (id, category) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, category, updatedAt: new Date().toISOString() }
              : item
          ),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      bulkDelete: (ids) => {
        set((state) => ({
          items: state.items.filter((item) => !ids.includes(item.id)),
        }))
      },

      bulkUpdateCategory: (ids, category) => {
        set((state) => ({
          items: state.items.map((item) =>
            ids.includes(item.id) ? { ...item, category, updatedAt: new Date().toISOString() } : item
          ),
        }))
      },

      restoreItem: (item) => {
        set((state) => ({
          items: [item, ...state.items],
        }))
      },

      reorderItems: (ids) => {
        set((state) => {
          const map = new Map(state.items.map((i) => [i.id, i]))
          const reordered = ids.map((id) => map.get(id)).filter(Boolean) as ScrambleItem[]
          const remaining = state.items.filter((i) => !ids.includes(i.id))
          return { items: [...reordered, ...remaining] }
        })
      },

      toggleExpand: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
          ),
        }))
      },

      addDigest: (digest) => {
        set((state) => ({ digests: [digest, ...state.digests] }))
      },

      addVision: (vision) => {
        set((state) => ({ visions: [vision, ...state.visions] }))
      },

      addMoodImage: (moodImage) => {
        set((state) => ({ moodImages: [moodImage, ...state.moodImages] }))
      },

      importStore: (data) => {
        set({
          items: data.items.map((item) => ({ ...item, isExpanded: false })),
          digests: data.digests,
          visions: data.visions,
          moodImages: data.moodImages,
        })
      },

      getFilteredItems: () => {
        const { items, searchQuery } = get()
        if (!searchQuery.trim()) return items
        const q = searchQuery.toLowerCase()
        return items.filter(
          (item) =>
            item.text.toLowerCase().includes(q) ||
            item.aiNote.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        )
      },

      getItemsByCategory: (category) => {
        return get().items.filter((item) => item.category === category)
      },
    }),
    {
      name: 'scramble-egg-storage',
      partialize: (state) => ({
        items: state.items.map((item) => ({ ...item, isExpanded: false })),
        digests: state.digests,
        visions: state.visions,
        moodImages: state.moodImages,
      }),
    }
  )
)
