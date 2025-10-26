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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (!disabled && !loading && inputRef.current) {
            inputRef.current.focus()
        }
    }, [disabled, loading])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage: Message = {
            role: 'user',
            content: input.trim()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)
        setSuggestedPrompt(null)

        try {
            const response = await fetch('/api/pro-studio/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    chatHistory: messages,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message')
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.message
            }

            setMessages(prev => [...prev, assistantMessage])

            if (data.suggestedPrompt) {
                setSuggestedPrompt(data.suggestedPrompt)
            }
        } catch (error) {
            console.error('Chat error:', error)
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }
            setMessages(prev => [...prev, errorMessage])
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

    const handleUsePrompt = () => {
        if (suggestedPrompt) {
            onPromptSelect(suggestedPrompt)
        }
    }

    return (
        <Card className="flex flex-col h-full">
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">AI Prompt Assistant</h3>
                <p className="text-sm text-muted">
                    Chat with AI to craft the perfect hyper-realistic prompt
                </p>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px] max-h-[500px]">
                {messages.length === 0 && (
                    <div className="text-center py-8 text-muted">
                        <p className="mb-2">👋 Hi! I'm here to help you create amazing prompts.</p>
                        <p className="text-sm">Tell me what you'd like to generate!</p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                    ? 'bg-primary text-white'
                                    : 'bg-surface border border-border'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surface border border-border rounded-lg px-4 py-2">
                            <Loader size="sm" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {suggestedPrompt && (
                <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-xs font-medium text-primary mb-2">✨ Optimized Prompt Ready</p>
                    <p className="text-sm mb-3">{suggestedPrompt}</p>
                    <Button
                        size="sm"
                        onClick={handleUsePrompt}
                        disabled={disabled}
                    >
                        Use This Prompt
                    </Button>
                </div>
            )}

            <div className="flex gap-2">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want to create..."
                    disabled={disabled || loading}
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
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