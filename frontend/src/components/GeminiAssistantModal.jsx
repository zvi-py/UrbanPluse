import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, X, Send, Key, Check, AlertCircle, Bot, User, Compass, Activity, Navigation, Users } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const QUICK_PROMPTS = [
  { label: '🚦 Traffic Bottlenecks & Detours', prompt: 'What are the main traffic bottlenecks in Belagavi right now and what detours should commuters take?' },
  { label: '🏛️ Weekend Campus Gatherings', prompt: 'What are the top upcoming events and tech fests in Belagavi colleges this week?' },
  { label: '🎓 Collegiate Student Projects', prompt: 'Which student groups at KLE Tech and KLS GIT are active in robotics and AI collaboration?' },
  { label: '🌿 Quiet Study Zones in Belagavi', prompt: 'Which BCC wards have the lowest noise levels and best air quality for focused study?' },
  { label: '✦ Full City Executive Briefing', prompt: 'Provide a complete cross-agent executive briefing for Belagavi today across transit, fests, and environment.' },
]

export default function GeminiAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to the **UrbanPulse Gemini Intelligence Synthesizer**. I monitor real-time telemetry across Belagavi’s 12 traffic arteries, 26 active campus gatherings, student peer networks, and 58 BCC environmental wards.\n\nHow can I assist your transit, campus, or civic planning today?',
      citations: ['Traffic Intelligence', 'Event Intelligence', 'Environmental Vitals'],
      model: 'gemini-1.5-flash',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('urbanpulse_gemini_key') || ''
    } catch {
      return ''
    }
  })
  const [showKeyInput, setShowKeyInput] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (!isOpen) return null

  const handleSaveKey = (val) => {
    setApiKey(val)
    try {
      localStorage.setItem('urbanpulse_gemini_key', val)
    } catch {}
  }

  const handleSend = async (userPrompt) => {
    const promptToSend = userPrompt || input.trim()
    if (!promptToSend || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: promptToSend }])
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/gemini/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-gemini-key': apiKey } : {}),
        },
        body: jsonBody(promptToSend, apiKey),
      })

      if (!res.ok) {
        throw new Error(`Gemini service responded with status ${res.status}`)
      }

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          citations: data.citations || [],
          model: data.model || 'gemini-1.5-flash',
          source: data.source,
        },
      ])
    } catch (err) {
      console.error('Gemini query error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to communicate with the Gemini Intelligence backend. Please ensure the UrbanPulse API orchestrator is running on port 8000.',
          citations: ['System Alert'],
          model: 'offline',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function jsonBody(text, key) {
    return JSON.stringify({ message: text, api_key: key || undefined })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(28, 25, 23, 0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          height: '85vh',
          maxHeight: '740px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-raised)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--agent-gemini-bg)',
                border: '1px solid var(--agent-gemini-border)',
                color: 'var(--agent-gemini)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Gemini Urban Intelligence Assistant
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--agent-gemini-bg)',
                    color: 'var(--agent-gemini)',
                    border: '1px solid var(--agent-gemini-border)',
                  }}
                >
                  Belagavi Mesh Live
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Grounded on 12 Traffic Corridors · 26 Campus Events · 58 BCC Wards
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              title="Configure Gemini API Key"
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-hairline)',
                backgroundColor: apiKey ? 'var(--agent-student-bg)' : 'transparent',
                color: apiKey ? 'var(--agent-student)' : 'var(--text-secondary)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Key size={12} />
              <span>{apiKey ? 'API Key Set' : 'Set API Key'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Optional Custom API Key input banner */}
        {showKeyInput && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--agent-gemini-bg)',
              borderBottom: '1px solid var(--agent-gemini-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
              Google Gemini Key:
            </span>
            <input
              type="password"
              placeholder="Paste your Google Gemini API Key (optional)"
              value={apiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              style={{
                flex: 1,
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-hairline)',
                backgroundColor: '#FFFFFF',
                color: '#1C1917',
                outline: 'none',
              }}
            />
            {apiKey && (
              <button
                onClick={() => handleSaveKey('')}
                style={{
                  fontSize: '11px',
                  color: 'var(--status-critical)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Chat Messages Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-dim)',
                  }}
                >
                  {isUser ? <User size={12} /> : <Bot size={12} color="var(--agent-gemini)" />}
                  <span>{isUser ? 'You' : 'Gemini AI Synthesizer'}</span>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-surface-raised)',
                    color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                    border: isUser ? 'none' : '1px solid var(--border-hairline)',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </div>

                {/* Agent Citations Tags */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {msg.citations.map((cite, cIdx) => (
                      <span
                        key={cIdx}
                        style={{
                          fontSize: '10px',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--bg-surface-raised)',
                          border: '1px solid var(--border-hairline)',
                          color: 'var(--text-dim)',
                          fontWeight: 600,
                        }}
                      >
                        ✓ {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', padding: '8px' }}>
              <Sparkles size={14} className="spin-slow" color="var(--agent-gemini)" />
              <span>Gemini is synthesizing cross-agent telemetry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border-hairline)',
            backgroundColor: 'var(--bg-surface-raised)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', flexShrink: 0 }}>
            Suggestions:
          </span>
          {QUICK_PROMPTS.map((qp, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSend(qp.prompt)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-hairline)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Bottom Input Field */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-hairline)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <input
            type="text"
            placeholder="Ask anything about Belagavi traffic, campus events, or air quality..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
            style={{
              flex: 1,
              fontSize: '13px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-hairline)',
              backgroundColor: 'var(--bg-surface-raised)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: input.trim() && !loading ? 'var(--accent)' : 'var(--border-hairline)',
              color: '#FFFFFF',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
