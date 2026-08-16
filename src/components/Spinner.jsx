export default function Spinner({ className = 'h-8 w-8' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className={`${className} animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-900 dark:border-t-primary-400`}
      />
    </div>
  )
}