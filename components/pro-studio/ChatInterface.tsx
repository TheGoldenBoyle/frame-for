'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type ChatInterfaceProps = {
  onPromptSelect: (prompt: string) => void
  disabled?: boolean
}

export function ChatInterface({ onPromptSelect, disabled }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!disabled && !loading && inputRef.current) inputRef.current.focus()
  }, [disabled, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setSuggestedPrompt(null)

    try {
      const response = await fetch('/api/pro-studio/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, chatHistory: messages }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to send message')

      const assistantMessage: Message = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, assistantMessage])

      if (data.suggestedPrompt) setSuggestedPrompt(data.suggestedPrompt)
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleUsePrompt = () => suggestedPrompt && onPromptSelect(suggestedPrompt)

  return (
    <Card className="flex flex-col h-full" animate={false}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="mb-1 text-lg font-semibold">AI Prompt Assistant</h3>
        <p className="text-sm text-muted">
          Chat with AI to craft the perfect hyper-realistic prompt
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex flex-col flex-1 pb-4 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <div className="py-8 text-center text-muted">
            <p className="mb-2">👋 Hi! I'm here to help you create amazing prompts.</p>
            <p className="text-sm">Tell me what you'd like to generate!</p>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 border rounded-lg bg-surface border-border">
              <Loader size="sm" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt */}
      {suggestedPrompt && (
        <div className="p-3 mb-4 border rounded-lg bg-primary/10 border-primary/30">
          <p className="mb-2 text-xs font-medium text-primary">✨ Optimized Prompt Ready</p>
          <p className="mb-3 text-sm">{suggestedPrompt}</p>
          <Button size="sm" onClick={handleUsePrompt} disabled={disabled}>
            Use This Prompt
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 mt-auto">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to create..."
          disabled={disabled || loading}
          rows={2}
          className="flex-1 px-4 py-3 border rounded-lg resize-none bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled || loading}
          className="self-end"
        >
          Send
        </Button>
      </div>
    </Card>
  )
}
