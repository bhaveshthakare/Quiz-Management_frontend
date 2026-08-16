import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Award, FileCheck2, Trophy } from 'lucide-react'
import client from '../api/client'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'

const typeConfig = {
  QUIZ_COMPLETION: { icon: FileCheck2, tone: 'blue', label: 'Completed' },
  RESULT: { icon: Trophy, tone: 'amber', label: 'Result' },
  CERTIFICATE: { icon: Award, tone: 'green', label: 'Certificate' },
}

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    client.get('/api/notifications').then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const markRead = async (id) => {
    await client.patch(`/api/notifications/${id}/read`)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n)))
  }

  const markAll = async () => {
    await client.patch('/api/notifications/read-all')
    setItems((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })))
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-white">
            <Bell className="h-7 w-7 text-primary-600 dark:text-primary-400" /> Notifications
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Updates about your quiz activity.</p>
        </div>
        {items.some((n) => !n.isRead) && (
          <button onClick={markAll} className="btn-secondary">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Bell className="h-12 w-12" />} title="No notifications yet" subtitle="Quiz results and certificates will appear here." />
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const cfg = typeConfig[n.type] || { icon: Bell, tone: 'slate', label: n.type }
            return (
              <div
                key={n.id}
                className={`card flex items-start gap-4 p-5 ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                  <cfg.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={cfg.tone}>{cfg.label}</Badge>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(n.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200">{n.message}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markRead(n.id)} className="text-xs font-semibold text-primary-600 hover:underline">
                    Mark read
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}