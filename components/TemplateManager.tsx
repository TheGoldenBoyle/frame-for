'use client'

import { useState, useEffect } from 'react'
import { PromptTemplate } from '@/types/globals'
import { Button } from "@/components/ui/Button"
type TemplateManagerProps = {
  mode?: string
  currentPrompt: string
  onSelectTemplate: (prompt: string, templateId: string) => void
  onClose?: () => void
}

export const TemplateManager = ({
  mode = 'expand',
  currentPrompt,
  onSelectTemplate,
  onClose,
}: TemplateManagerProps) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/playground/templates/list')
        if (!res.ok) throw new Error('Failed to fetch templates')
        const data = await res.json()
        setTemplates(data.templates.filter((t: PromptTemplate) => t.mode === mode))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [mode])

  const handleEdit = (template: PromptTemplate) => {
    setEditingId(template.id)
    setEditingValue(template.systemPrompt)
  }

  const handleSave = async () => {
    if (!editingId) return
    try {
      const res = await fetch('/api/playground/templates/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, systemPrompt: editingValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update template')

      setTemplates((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, systemPrompt: editingValue } : t))
      )
      setEditingId(null)
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Failed to save template')
    }
  }

  const handleSelect = (template: PromptTemplate) => {
    onSelectTemplate(template.systemPrompt, template.id)
    if (onClose) onClose()
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-lg">
      <h3 className="text-lg font-semibold mb-3 text-white">Prompt Manager</h3>

      {loading ? (
        <p className="text-gray-400">Loading templates...</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-2 border rounded border-primary flex flex-col gap-1 bg-gray-800"
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{template.name}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSelect(template)}
                  >
                    Use
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-400 truncate">{template.systemPrompt}</p>
            </div>
          ))}
        </div>
      )}

      {editingId && (
        <div className="mt-4 flex flex-col gap-2">
          <textarea
            className="w-full p-2 rounded bg-gray-700 text-white resize-none min-h-[80px]"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
