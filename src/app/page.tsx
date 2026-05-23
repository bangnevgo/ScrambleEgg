'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrambleStore, type Category, type ScrambleItem } from '@/store/useScrambleStore'
import { toast } from 'sonner'
import {
  Zap, Search, Eye, SmilePlus, Mic, MicOff, Trash2, CheckCircle2,
  ParkingCircle, Lightbulb, Clock, ChevronDown, Sparkles,
  Sun, Moon, Copy, Share2, RefreshCw, Brain, Target, Flame,
  PartyPopper, Car, Coffee, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

// Category config
const CATEGORY_CONFIG: Record<Category, { emoji: string; label: string; color: string; bgClass: string; icon: React.ElementType }> = {
  ide: { emoji: '💡', label: 'Ide', color: 'text-amber-500', bgClass: 'bg-amber-500/10 border-amber-500/20', icon: Lightbulb },
  task: { emoji: '⚡', label: 'Task', color: 'text-orange-500', bgClass: 'bg-orange-500/10 border-orange-500/20', icon: Zap },
  pending: { emoji: '⏳', label: 'Pending', color: 'text-yellow-500', bgClass: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  parking: { emoji: '🅿️', label: 'Parking Lot', color: 'text-blue-400', bgClass: 'bg-blue-400/10 border-blue-400/20', icon: ParkingCircle },
  done: { emoji: '✅', label: 'Done', color: 'text-emerald-500', bgClass: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
}

const MOOD_SCENES = [
  { id: 'me-today', label: 'Me Today', emoji: '😵', desc: 'Snapshot kondisi hari ini' },
  { id: 'me-this-week', label: 'Me This Week', emoji: '📅', desc: 'Recap chaos minggu ini' },
  { id: 'my-brain', label: 'My Brain RN', emoji: '🧠', desc: 'Visualisasi isi kepala' },
  { id: 'my-parking-lot', label: 'My Parking Lot', emoji: '🅿️', desc: 'Mimpi yang diparkir' },
  { id: 'done-party', label: 'Done! Party', emoji: '🎉', desc: 'Celebration art' },
]

// Helper: format relative time
function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin}m lalu`
  if (diffHr < 24) return `${diffHr}j lalu`
  if (diffDay < 7) return `${diffDay}h lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// Helper: highlight search
function highlightText(text: string, query: string) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  )
}

// ==================== DUMP BOX ====================
function DumpBox() {
  const [text, setText] = useState('')
  const { addItem, isAiLoading, setIsAiLoading, isListening, setIsListening } = useScrambleStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  const handleDump = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    if (isAiLoading) return

    setIsAiLoading(true)
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })
      const data = await res.json()
      addItem(trimmed, data.category || 'pending', data.note || 'Tercatat! 🍳')
      setText('')
      toast.success('Ter-dump! 🍳', {
        description: `Dikategorikan sebagai ${CATEGORY_CONFIG[data.category as Category]?.emoji || '📝'} ${CATEGORY_CONFIG[data.category as Category]?.label || data.category}`,
      })
    } catch (err) {
      addItem(trimmed, 'pending', 'Tercatat! 🍳')
      setText('')
      toast.success('Ter-dump! 🍳')
    } finally {
      setIsAiLoading(false)
    }
  }, [text, isAiLoading, addItem, setIsAiLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleDump()
    }
  }

  // Voice input
  const toggleVoice = useCallback(() => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Browser tidak mendukung voice input 😢')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'id-ID'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setText(transcript)
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Gagal merekam suara 😢')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    toast('🎤 Mendengarkan... Ngomong aja!', { icon: '🎤' })
  }, [isListening, setIsListening])

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dump apapun yang ada di kepala... bebas, nggak perlu rapi"
          className="w-full min-h-[120px] p-4 pr-24 rounded-2xl border-2 border-primary/20 bg-card text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all text-base"
          disabled={isAiLoading}
        />
        <div className="absolute right-3 top-3 flex flex-col gap-2 md:flex">
          <Button
            size="sm"
            onClick={toggleVoice}
            className={`rounded-xl ${isListening ? 'bg-destructive hover:bg-destructive/90 animate-voice-pulse' : 'bg-primary hover:bg-primary/90'}`}
            disabled={isAiLoading}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          {/* Desktop submit button - hidden on mobile, shown on md+ */}
          <Button
            size="sm"
            onClick={handleDump}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold hidden md:flex"
            disabled={isAiLoading || !text.trim()}
          >
            {isAiLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      {/* Mobile-friendly Dump button - large and easy to tap */}
      <Button
        onClick={handleDump}
        disabled={isAiLoading || !text.trim()}
        className="w-full h-12 text-base font-bold gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform md:hidden"
      >
        {isAiLoading ? (
          <><RefreshCw className="w-5 h-5 animate-spin" /> Memproses...</>
        ) : (
          <><Zap className="w-5 h-5" /> Dump!</>
        )}
      </Button>
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span className="hidden md:inline">Tekan <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> untuk dump</span>
        <span className="md:hidden">Tekan tombol <span className="font-bold text-primary">Dump!</span> di atas untuk menyimpan</span>
        {isListening && (
          <span className="text-destructive font-medium animate-pulse">🎤 Merekam...</span>
        )}
      </div>
    </div>
  )
}

// ==================== ITEM CARD ====================
function ItemCard({ item, searchQuery }: { item: ScrambleItem; searchQuery: string }) {
  const { updateItemCategory, deleteItem, toggleExpand } = useScrambleStore()
  const config = CATEGORY_CONFIG[item.category]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="group"
    >
      <Card
        className={`border transition-all duration-200 hover:shadow-md cursor-pointer ${config.bgClass} ${item.category === 'done' ? 'opacity-60' : ''}`}
        onClick={() => toggleExpand(item.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5 shrink-0">{config.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-relaxed ${item.category === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                {searchQuery ? highlightText(item.text, searchQuery) : item.text}
              </p>
              {item.aiNote && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  🤖 {searchQuery ? highlightText(item.aiNote, searchQuery) : item.aiNote}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px] h-5">
                  {config.emoji} {config.label}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
              </div>
            </div>
            <motion.div
              animate={{ rotate: item.isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </motion.div>
          </div>

          <AnimatePresence>
            {item.isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Separator className="my-3" />
                <div className="flex flex-wrap gap-2">
                  {item.category !== 'done' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                      onClick={(e) => { e.stopPropagation(); updateItemCategory(item.id, 'done') }}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </Button>
                  )}
                  {item.category !== 'parking' && item.category !== 'done' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-blue-400/30 text-blue-500 hover:bg-blue-400/10"
                      onClick={(e) => { e.stopPropagation(); updateItemCategory(item.id, 'parking') }}
                    >
                      <ParkingCircle className="w-3 h-3" /> Parkir
                    </Button>
                  )}
                  {item.category === 'done' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                      onClick={(e) => { e.stopPropagation(); updateItemCategory(item.id, 'pending') }}
                    >
                      <RefreshCw className="w-3 h-3" /> Reopen
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }}
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== ITEM LIST ====================
function ItemList({ filterCategory, searchQuery }: { filterCategory?: Category; searchQuery?: string }) {
  const { items } = useScrambleStore()

  const filtered = items
    .filter((item) => (!filterCategory || item.category === filterCategory))
    .filter((item) => {
      if (!searchQuery?.trim()) return true
      const q = searchQuery.toLowerCase()
      return item.text.toLowerCase().includes(q) || item.aiNote.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    })

  if (filtered.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 space-y-6"
      >
        <div className="flex-1" />
        <div>
          <p className="text-xl font-display tracking-wide bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">Belum ada yang di-dump!</p>
          <p className="text-sm text-muted-foreground mt-2 font-serif italic">Ketik apapun di atas, tekan ⚡ Dump — berantakan itu valid</p>
        </div>
        <div className="animate-egg-bounce">
          <img
            src="/logo.webp"
            alt="Scramble Egg"
            className="w-36 h-36 object-contain drop-shadow-lg"
          />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
      <AnimatePresence mode="popLayout">
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} searchQuery={searchQuery || ''} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ==================== WEEKLY DIGEST ====================
function WeeklyDigest() {
  const { items, digests, addDigest, digestLoading, setDigestLoading } = useScrambleStore()
  const [isOpen, setIsOpen] = useState(false)

  const generateDigest = async () => {
    if (items.length === 0) {
      toast.error('Dump dulu beberapa item baru bisa generate digest! 🍳')
      return
    }
    setDigestLoading(true)
    try {
      const res = await fetch('/api/ai/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      addDigest({
        summary: data.summary,
        priorities: data.priorities,
        mood: data.mood,
        generatedAt: new Date().toISOString(),
      })
      setIsOpen(true)
    } catch {
      toast.error('Gagal generate digest 😢')
    } finally {
      setDigestLoading(false)
    }
  }

  const latestDigest = digests[0]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={generateDigest}
          disabled={digestLoading || items.length === 0}
          className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl"
        >
          {digestLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {digestLoading ? 'Menganalisis...' : 'Weekly Digest'}
        </Button>
        {latestDigest && !isOpen && (
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="text-xs">
            Lihat terakhir
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && latestDigest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                    Weekly Digest
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
                    ✕
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{timeAgo(latestDigest.generatedAt)}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm leading-relaxed">{latestDigest.summary}</p>
                </div>
                <div>
                  <h4 className="text-xs font-display tracking-wider text-muted-foreground uppercase mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" /> 3 Prioritas Minggu Ini
                  </h4>
                  <div className="space-y-2">
                    {latestDigest.priorities.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-sm font-medium">{latestDigest.mood}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== DUMP TAB ====================
function DumpTab() {
  const { items } = useScrambleStore()
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all')

  const counts = {
    all: items.length,
    ide: items.filter(i => i.category === 'ide').length,
    task: items.filter(i => i.category === 'task').length,
    pending: items.filter(i => i.category === 'pending').length,
    parking: items.filter(i => i.category === 'parking').length,
    done: items.filter(i => i.category === 'done').length,
  }

  return (
    <div className="space-y-4">
      <DumpBox />

      <WeeklyDigest />

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          className="rounded-full text-xs shrink-0"
          onClick={() => setActiveFilter('all')}
        >
          Semua ({counts.all})
        </Button>
        {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).map(([key, cfg]) => (
          <Button
            key={key}
            variant={activeFilter === key ? 'default' : 'outline'}
            size="sm"
            className={`rounded-full text-xs shrink-0 ${activeFilter === key ? '' : cfg.color}`}
            onClick={() => setActiveFilter(key)}
          >
            {cfg.emoji} {cfg.label} ({counts[key]})
          </Button>
        ))}
      </div>

      <ItemList filterCategory={activeFilter === 'all' ? undefined : activeFilter} />
    </div>
  )
}

// ==================== SEARCH TAB ====================
function SearchTab() {
  const { searchQuery, setSearchQuery } = useScrambleStore()

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Cari natural language... "ide kemarin soal konten manifestasi"'
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-primary/20 bg-card text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base"
        />
      </div>
      <div className="text-xs text-muted-foreground font-serif italic">
        Pencarian di text maupun AI note — langsung filter + highlight
      </div>
      <ItemList searchQuery={searchQuery} />
    </div>
  )
}

// ==================== VISION BOARD TAB ====================
function VisionTab() {
  const { items, visions, addVision, visionLoading, setVisionLoading } = useScrambleStore()
  const [generating, setGenerating] = useState(false)

  const generateVision = async () => {
    if (items.length < 3) {
      toast.error('Dump minimal 3 item dulu baru bisa generate Vision Board! 🍳')
      return
    }
    setGenerating(true)
    setVisionLoading(true)
    try {
      const res = await fetch('/api/ai/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      addVision({
        headline: data.headline,
        themes: data.themes,
        wordCloud: data.wordCloud,
        affirmations: data.affirmations,
        dailyMantra: data.dailyMantra,
        generatedAt: new Date().toISOString(),
      })
      toast.success('Vision Board generated! ✨')
    } catch {
      toast.error('Gagal generate Vision Board 😢')
    } finally {
      setGenerating(false)
      setVisionLoading(false)
    }
  }

  const latestVision = visions[0]

  const wordColors = [
    'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    'bg-orange-500/15 text-orange-700 dark:text-orange-300',
    'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
    'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    'bg-purple-500/15 text-purple-700 dark:text-purple-300',
    'bg-pink-500/15 text-pink-700 dark:text-pink-300',
    'bg-teal-500/15 text-teal-700 dark:text-teal-300',
    'bg-red-500/15 text-red-700 dark:text-red-300',
  ]

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-display tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent">
          <Eye className="w-5 h-5 text-primary" /> Vision Board
        </h2>
        <p className="text-sm text-muted-foreground font-serif italic">
          AI baca semua chaos-mu → generate visi yang powerful
        </p>
      </div>

      <Button
        onClick={generateVision}
        disabled={generating || items.length < 3}
        className="w-full gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold rounded-xl h-12 text-base"
      >
        {generating ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Generating Vision...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Vision Board
          </>
        )}
      </Button>

      {items.length < 3 && (
        <p className="text-xs text-center text-muted-foreground font-serif italic">
          Dump minimal 3 item dulu ya — makin banyak, makin akurat!
        </p>
      )}

      {generating && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <div className="flex flex-wrap gap-2 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[...Array(15)].map((_, i) => (
                  <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${40 + Math.random() * 80}px` }} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {latestVision && !generating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Headline */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-serif">Your Vision</p>
                <h3 className="text-2xl font-display tracking-wider leading-snug bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent">
                  &ldquo;{latestVision.headline}&rdquo;
                </h3>
              </motion.div>
            </CardContent>
          </Card>

          {/* Themes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Tema Besar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {latestVision.themes.map((theme, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Badge className={`${wordColors[i % wordColors.length]} border-0 text-sm py-1.5 px-3`}>
                      {theme}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Word Cloud */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display tracking-wider flex items-center gap-2">
                Word Cloud
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center py-2">
                {latestVision.wordCloud.map((word, i) => {
                  const size = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'][Math.floor(Math.random() * 5)]
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i }}
                      className={`word-cloud-word ${wordColors[i % wordColors.length]} ${size} font-medium animate-word-float`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {word}
                    </motion.span>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Affirmations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display tracking-wider flex items-center gap-2">
                Afirmasi Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestVision.affirmations.map((aff, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-primary/5"
                >
                  <span className="text-lg mt-0.5 text-amber-500">*</span>
                  <p className="text-sm font-serif italic leading-relaxed">&ldquo;{aff}&rdquo;</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Daily Mantra */}
          <Card className="border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-serif">Daily Mantra</p>
              <p className="text-lg font-display tracking-wider leading-snug bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent">
                &ldquo;{latestVision.dailyMantra}&rdquo;
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(latestVision.dailyMantra)
                  toast.success('Mantra dicopy! 🌅')
                }}
              >
                <Copy className="w-3 h-3" /> Copy mantra
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// ==================== MOOD TAB ====================
function MoodTab() {
  const { items, moodImages, addMoodImage, moodLoading, setMoodLoading } = useScrambleStore()
  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState<typeof moodImages[0] | null>(null)
  const [imageLoading, setImageLoading] = useState(false)

  const generateMood = async (sceneId: string) => {
    if (items.length < 2) {
      toast.error('Dump minimal 2 item dulu baru bisa generate Mood! 🍳')
      return
    }
    setSelectedScene(sceneId)
    setImageLoading(true)
    setMoodLoading(true)
    try {
      const res = await fetch('/api/ai/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, scene: sceneId }),
      })
      const data = await res.json()
      const moodImage = {
        id: crypto.randomUUID(),
        scene: sceneId,
        imageUrl: data.imageUrl,
        caption: data.caption,
        hashtags: data.hashtags,
        generatedAt: new Date().toISOString(),
      }
      addMoodImage(moodImage)
      setCurrentImage(moodImage)
      toast.success('Mood image generated! 🎨')
    } catch {
      toast.error('Gagal generate mood image 😢')
    } finally {
      setImageLoading(false)
      setMoodLoading(false)
    }
  }

  const sceneIcons: Record<string, React.ElementType> = {
    'me-today': Coffee,
    'me-this-week': Calendar,
    'my-brain': Brain,
    'my-parking-lot': Car,
    'done-party': PartyPopper,
  }

  const copyCaption = () => {
    if (!currentImage) return
    const text = `${currentImage.caption}\n\n${currentImage.hashtags}`
    navigator.clipboard.writeText(text)
    toast.success('Caption + hashtag dicopy! Siap share 🚀')
  }

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-display tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent">
          Scramble Mood
        </h2>
        <p className="text-sm text-muted-foreground font-serif italic">
          AI baca chaos-mu → generate gambar lucu yang relatable
        </p>
      </div>

      {/* Scene Selection */}
      <div className="grid grid-cols-1 gap-2">
        {MOOD_SCENES.map((scene) => {
          const Icon = sceneIcons[scene.id] || Coffee
          return (
            <Button
              key={scene.id}
              variant="outline"
              className="h-auto py-3 px-4 justify-start gap-3 rounded-xl border-2 hover:border-primary/50 transition-all"
              onClick={() => generateMood(scene.id)}
              disabled={imageLoading || items.length < 2}
            >
              <span className="text-2xl">{scene.emoji}</span>
              <div className="text-left">
                <p className="font-semibold text-sm">{scene.label}</p>
                <p className="text-xs text-muted-foreground">{scene.desc}</p>
              </div>
            </Button>
          )
        })}
      </div>

      {items.length < 2 && (
        <p className="text-xs text-center text-muted-foreground font-serif italic">
          Dump minimal 2 item dulu ya — makin banyak, makin personal gambarnya!
        </p>
      )}

      {/* Loading */}
      {imageLoading && (
        <Card className="overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-5xl animate-egg-bounce inline-block"><img src="/logo.webp" alt="Scramble Egg" className="w-16 h-16 object-contain" /></div>
                <p className="text-sm text-muted-foreground">AI lagi masak gambar kamu...</p>
                <div className="w-48 h-2 bg-muted-foreground/10 rounded-full overflow-hidden mx-auto">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 8, ease: 'linear' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Image */}
      {currentImage && !imageLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <Card className="overflow-hidden border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={currentImage.imageUrl}
                  alt={MOOD_SCENES.find(s => s.id === currentImage.scene)?.label || 'Mood image'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>

          {/* Caption & Hashtags */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium">{currentImage.caption}</p>
              <p className="text-xs text-muted-foreground">{currentImage.hashtags}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 rounded-xl"
                  onClick={copyCaption}
                >
                  <Copy className="w-3 h-3" /> Copy Caption
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 rounded-xl"
                  onClick={() => {
                    if (currentImage.imageUrl) {
                      window.open(currentImage.imageUrl, '_blank')
                    }
                  }}
                >
                  <Share2 className="w-3 h-3" /> Open Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* History */}
      {moodImages.length > 0 && !imageLoading && (
        <div className="space-y-2">
          <h3 className="text-sm font-display tracking-wider text-muted-foreground">Riwayat Mood</h3>
          <div className="grid grid-cols-3 gap-2">
            {moodImages.slice(0, 6).map((mi) => (
              <button
                key={mi.id}
                onClick={() => setCurrentImage(mi)}
                className="aspect-square rounded-xl overflow-hidden bg-muted border-2 border-transparent hover:border-primary/50 transition-all"
              >
                {mi.imageUrl ? (
                  <img src={mi.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {MOOD_SCENES.find(s => s.id === mi.scene)?.emoji || '🍳'}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== MAIN APP ====================
export default function Home() {
  const { activeTab, setActiveTab, items } = useScrambleStore()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('scramble-egg-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = saved ? saved === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', dark)
    return dark
  })

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('scramble-egg-theme', newDark ? 'dark' : 'light')
  }

  const tabs = [
    { id: 'dump' as const, label: 'Dump', icon: Zap, emoji: '🍳' },
    { id: 'search' as const, label: 'Search', icon: Search, emoji: '🔍' },
    { id: 'vision' as const, label: 'Vision', icon: Eye, emoji: '👁️' },
    { id: 'mood' as const, label: 'Mood', icon: SmilePlus, emoji: '😂' },
  ]

  const activeItems = items.filter(i => i.category !== 'done').length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass bg-background/80 border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/logo.webp"
                  alt="Scramble Egg"
                  className="w-10 h-10 rounded-xl object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-display tracking-wider leading-tight bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                  Scramble Egg
                </h1>
                <p className="text-[10px] text-muted-foreground leading-tight font-serif italic tracking-wide">Chaos Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeItems > 0 && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {activeItems} active
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-xl h-9 w-9"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-[65px] z-40 glass bg-background/80 border-b border-border/50">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all relative ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-lg mx-auto px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dump' && <DumpTab />}
              {activeTab === 'search' && <SearchTab />}
              {activeTab === 'vision' && <VisionTab />}
              {activeTab === 'mood' && <MoodTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4">
        <div className="max-w-lg mx-auto px-4 text-center">
          <p className="text-[10px] text-muted-foreground font-serif italic">
            Scramble Egg — Chaos is valid. AI organizes.
          </p>
        </div>
      </footer>
    </div>
  )
}
