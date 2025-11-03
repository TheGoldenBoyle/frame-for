'use client'

import { useState } from 'react'

export type PromptTemplate = {
  id: string
  name: string
  systemPrompt: string
  isDefault: boolean
}

type Props = {
  templates: PromptTemplate[]
  onChangeTemplate: (template: PromptTemplate) => void
}

export function InlinePromptManager({ templates, onChangeTemplate }: Props) {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [localTemplates, setLocalTemplates] = useState<PromptTemplate[]>(templates)

  const handleChange = (id: string, key: keyof PromptTemplate, value: string) => {
    setLocalTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [key]: value } : t))
    )
  }

  const handleSave = (id: string) => {
    const template = localTemplates.find((t) => t.id === id)
    if (template) {
      onChangeTemplate(template)
      setEditingTemplateId(null)
    }
  }

  return (
    <div className="border border-gray-300 rounded p-4 space-y-2 bg-gray-50">
      {localTemplates.map((template) => {
        const isEditing = editingTemplateId === template.id
        return (
          <div key={template.id} className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{template.name}</span>
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setEditingTemplateId(isEditing ? null : template.id)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing && (
              <>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => handleChange(template.id, 'name', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={template.systemPrompt}
                  onChange={(e) => handleChange(template.id, 'systemPrompt', e.target.value)}
                  className="w-full p-2 border rounded resize-none min-h-[100px]"
                />
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => handleSave(template.id)}
                  >
                    Save
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                    onClick={() => setEditingTemplateId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
