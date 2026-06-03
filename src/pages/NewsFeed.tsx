import React, { useState, useEffect, useRef, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Search, RefreshCw, Newspaper, TrendingUp, BookOpen, Landmark, FlaskConical, Trophy, Star, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { fetchNews, supabase, type NewsArticle } from '../lib/supabase'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Newspaper },
  { id: 'ap_tg', label: 'AP / TG', icon: Landmark },
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'government', label: 'Government', icon: Landmark },
  { id: 'science', label: 'Science', icon: FlaskConical },
  { id: 'sports', label: 'Sports', icon: Trophy },
]

const CATEGORY_COLORS: Record<string, string> = {
  ap_tg: '#1E40AF',
  education: '#059669',
  government: '#0891B2',
  science: '#0891B2',
  sports: '#D97706',
}

function SkeletonNews() {
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, display: 'flex', gap: 12 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 14, width: '90%', background: 'var(--bg-4)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }} />
        <div style={{ height: 12, width: '60%', background: 'var(--bg-4)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }} />
        <div style={{ height: 40, background: 'var(--bg-4)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }} />
      </div>
      <div style={{ width: 80, height: 80, background: 'var(--bg-4)', borderRadius: 8, flexShrink: 0, animation: 'pulse 1.5s ease infinite' }} />
    </div>
  )
}

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [featured, setFeatured] = useState<NewsArticle[]>([])
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [newCount, setNewCount] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const feedRef = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 15

  const loadArticles = useCallback(async (reset = false) => {
    const p = reset ? 0 : page
    if (reset) { setPage(0); setLoading(true) }
    try {
      const data = await fetchNews({ category: category !== 'all' ? category : undefined, search: search || undefined, limit: PAGE_SIZE, offset: p * PAGE_SIZE })
      if (reset) setArticles(data)
      else setArticles(prev => [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
    } catch {
      toast.error('Failed to load news')
    }
    setLoading(false)
  }, [category, search, page])

  useEffect(() => {
    fetchNews({ featured: true, limit: 4 }).then(setFeatured).catch(() => {})
  }, [])

  useEffect(() => { loadArticles(true) }, [category, search])

  useEffect(() => {
    const channel = supabase
      .channel('news_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_articles' }, payload => {
        const article = payload.new as NewsArticle
        setNewCount(c => c + 1)
        setArticles(prev => [article, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleNewBanner = () => {
    setNewCount(0)
    feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>News & Updates</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-3)' }}>Education news, exam updates, government schemes</p>
        </div>
        <button onClick={() => loadArticles(true)} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {newCount > 0 && (
        <button onClick={handleNewBanner} style={{ width: '100%', padding: '10px 16px', background: 'rgba(30,64,175,0.15)', border: '1px solid rgba(30,64,175,0.3)', borderRadius: 'var(--r-md)', color: '#60A5FA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14, fontSize: '0.88rem', fontWeight: 600 }}>
          <TrendingUp size={14} /> {newCount} new article{newCount > 1 ? 's' : ''} — tap to scroll to top
        </button>
      )}

      {featured.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {featured.map(a => (
              <div key={a.id}
                style={{ minWidth: 260, background: 'linear-gradient(135deg, rgba(30,64,175,0.15), rgba(8,145,178,0.1))', border: '1px solid rgba(30,64,175,0.2)', borderRadius: 'var(--r-md)', padding: 14, cursor: 'pointer', flexShrink: 0 }}
                onClick={() => a.url && window.open(a.url, '_blank')}>
                <span style={{ padding: '2px 8px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3, marginBottom: 8 }}>
                  <Star size={9} fill="#F59E0B" /> Featured
                </span>
                <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.4 }}>{a.title}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.4 }}>
                  {a.summary?.slice(0, 80)}{(a.summary?.length ?? 0) > 80 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>{a.source}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>{formatDistanceToNow(new Date(a.published_at), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '10px 16px', marginBottom: 14 }}>
        <Search size={15} color="var(--text-3)" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news..."
          style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '0.88rem', width: '100%', fontFamily: 'inherit' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 20, border: '1px solid var(--border)', background: category === c.id ? '#1E40AF' : 'var(--bg-3)', color: category === c.id ? 'white' : 'var(--text-2)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, transition: 'var(--t)' }}>
            <c.icon size={13} /> {c.label}
          </button>
        ))}
      </div>

      <div ref={feedRef} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading
          ? Array(5).fill(0).map((_, i) => <SkeletonNews key={i} />)
          : articles.map(a => (
            <article key={a.id}
              onClick={() => a.url && window.open(a.url, '_blank')}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, cursor: a.url ? 'pointer' : 'default', display: 'flex', gap: 14, transition: 'var(--t)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,64,175,0.4)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  {a.category && a.category !== 'education' && (
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: `${CATEGORY_COLORS[a.category] ?? '#1E40AF'}18`, color: CATEGORY_COLORS[a.category] ?? '#1E40AF', fontSize: '0.7rem', fontWeight: 700 }}>
                      {CATEGORIES.find(c => c.id === a.category)?.label ?? a.category}
                    </span>
                  )}
                  {a.is_featured && (
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', fontSize: '0.7rem', fontWeight: 700 }}>Featured</span>
                  )}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', marginLeft: 'auto' }}>
                    {formatDistanceToNow(new Date(a.published_at), { addSuffix: true })}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.4 }}>{a.title}</h4>
                {a.summary && (
                  <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                    {a.summary.slice(0, 130)}{a.summary.length > 130 ? '...' : ''}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', fontWeight: 500 }}>{a.source}</span>
                  {a.url && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: '#60A5FA' }}>
                      <ExternalLink size={11} /> Read more
                    </span>
                  )}
                </div>
              </div>
              {a.image_url && (
                <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={a.image_url} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </article>
          ))
        }
      </div>

      {hasMore && !loading && articles.length > 0 && (
        <button onClick={() => { setPage(p => p + 1); loadArticles() }}
          style={{ width: '100%', marginTop: 16, padding: 14, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.88rem' }}>
          Load more articles
        </button>
      )}

      {!loading && articles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
          <Newspaper size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No articles found</p>
          <p style={{ fontSize: '0.85rem' }}>Try a different category or clear the search.</p>
        </div>
      )}
    </div>
  )
}
