import { useState, useEffect } from 'react'
import { useUserStore, useAppStore } from '../store/useStore'
import { Brain, Layers, RefreshCw, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function RevisionHub() {
  const { profile } = useUserStore()
  const { bookmarks } = useAppStore()
  const [deck, setDeck] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Initialize deck from bookmarks
  useEffect(() => {
    // We expect bookmarks to be an array of objects: { id, type, question, answer, topic }
    if (bookmarks && bookmarks.length > 0) {
      // Shuffle the bookmarks to create a fresh deck
      const shuffled = [...bookmarks].sort(() => 0.5 - Math.random())
      setDeck(shuffled) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [bookmarks])

  const handleReview = (quality) => {
    // Space Repetition Algorithm (Simple version)
    // quality: 'easy', 'good', 'hard'
    setShowAnswer(false)
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      toast.success('You have finished your daily revision deck! 🎉')
      setDeck([])
    }
  }

  const resetDeck = () => {
    if (bookmarks && bookmarks.length > 0) {
      const shuffled = [...bookmarks].sort(() => 0.5 - Math.random())
      setDeck(shuffled)
      setCurrentIndex(0)
      setShowAnswer(false)
    }
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Smart Revision Hub 🧠</h1>
          <p className="page-subtitle">Spaced repetition flashcards based on your bookmarks and mistakes.</p>
        </div>
      </div>

      {deck.length === 0 ? (
        <div className="card card-p" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Layers size={48} color="var(--purple)" style={{ marginBottom: 16 }} />
          <h2 style={{ marginBottom: 12 }}>Your Deck is Empty</h2>
          <p style={{ color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.5 }}>
            Bookmark questions from Mock Tests, Current Affairs, and the AI Tutor to build your ultimate revision deck.
          </p>
          <button className="btn btn-primary" onClick={resetDeck} disabled={!bookmarks || bookmarks.length === 0}>
            <RefreshCw size={18} /> Reload Deck
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeUp 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--text-3)', fontSize: '0.88rem' }}>
            <span>Card {currentIndex + 1} of {deck.length}</span>
            <span>{deck[currentIndex].type?.toUpperCase() || 'GENERAL'}</span>
          </div>

          <div 
            className="card" 
            style={{ 
              minHeight: 300, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 32,
              textAlign: 'center',
              cursor: showAnswer ? 'default' : 'pointer',
              position: 'relative',
              background: showAnswer ? 'var(--bg-2)' : 'var(--bg-1)',
              transition: 'var(--t)'
            }}
            onClick={() => !showAnswer && setShowAnswer(true)}
          >
            <h2 style={{ fontSize: '1.25rem', marginBottom: 24, lineHeight: 1.6 }}>
              {deck[currentIndex].question || deck[currentIndex].title}
            </h2>
            
            {!showAnswer ? (
              <div style={{ color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Tap to reveal answer</span>
                <ArrowRight size={16} />
              </div>
            ) : (
              <div style={{ animation: 'fadeIn 0.3s ease', width: '100%' }}>
                <div style={{ height: 1, background: 'var(--border)', margin: '24px 0', width: '100%' }} />
                <div style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                  {deck[currentIndex].answer || deck[currentIndex].content || 'Answer not provided.'}
                </div>
              </div>
            )}
          </div>

          {showAnswer && (
            <div style={{ display: 'flex', gap: 12, marginTop: 24, animation: 'fadeIn 0.3s ease' }}>
              <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleReview('hard')}>
                <XCircle size={18} /> Hard
              </button>
              <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => handleReview('good')}>
                Good
              </button>
              <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--emerald)', color: 'var(--emerald)' }} onClick={() => handleReview('easy')}>
                <CheckCircle size={18} /> Easy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
