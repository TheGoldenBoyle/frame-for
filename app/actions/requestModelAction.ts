'use server'

import { notifyModelRequest } from '@/lib/email-service'

export async function requestModelAction({
  userEmail,
  modelName,
}: {
  userEmail: string
  modelName: string
}) {
  try {
    await notifyModelRequest({ email: userEmail, modelName })
    return { success: true }
  } catch (error) {
    console.error('Model request email failed:', error)
    return { success: false }
  }
}
