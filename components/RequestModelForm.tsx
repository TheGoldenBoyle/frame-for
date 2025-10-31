'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { requestModelAction } from '@/app/actions/requestModelAction'

export function RequestModelForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const [modelName, setModelName] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modelName.trim()) return

    startTransition(async () => {
      const result = await requestModelAction({
        userEmail: user?.email || 'unknown',
        modelName,
      })

      if (result.success) {
        setMessage('✓ Model request sent successfully.')
        setModelName('')
      } else {
        setMessage('Failed to send request.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="w-full max-w-md p-6 bg-surface rounded-2xl shadow-elevated-gold">
        <h2 className="mb-2 text-xl font-bold">Request a Model</h2>
        <p className="mb-4 text-sm text-muted">
          Suggest a model you'd like to see on BildOro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="Model name (e.g., Stable Cascade XL)"
            required
            className="w-full px-4 py-2 text-sm border rounded-lg outline-none border-border bg-surface focus:border-primary"
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Sending...' : 'Submit'}
          </Button>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm ${
              message.startsWith('✓') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-sm underline text-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
