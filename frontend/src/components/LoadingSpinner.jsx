// LoadingSpinner.jsx — Reusable spinner for loading states

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizeMap[size]} border-4 border-[#EDE9FE] border-t-[#7C3AED] rounded-full animate-spin`} />
      {text && <p className="text-sm text-[#6B7280]">{text}</p>}
    </div>
  )
}