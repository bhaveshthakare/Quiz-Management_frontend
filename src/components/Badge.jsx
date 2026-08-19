const toneClasses = {
  green: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  red: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  amber: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  blue: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  slate: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  violet: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
}

export default function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}