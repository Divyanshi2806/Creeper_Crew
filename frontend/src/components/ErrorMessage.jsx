// ErrorMessage.jsx — Shows API errors in a consistent red box

import { AlertCircle } from 'lucide-react'

export default function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  )
}