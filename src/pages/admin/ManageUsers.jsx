import { useEffect, useState } from 'react'
import { Search, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import client, { errorMessage } from '../../api/client'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    client.get('/api/users/students').then((r) => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleStatus = async (u) => {
    try {
      const status = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await client.patch(`/api/users/${u.id}/status`, { status })
      toast.success(`User ${status === 'ACTIVE' ? 'activated' : 'deactivated'}`)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const openProfile = async (u) => {
    setProfileLoading(true)
    setProfile(null)
    try {
      const { data } = await client.get(`/api/users/${u.id}/profile`)
      setProfile(data)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setProfileLoading(false)
    }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      await client.delete(`/api/users/${deleteTarget.id}`)
      toast.success('Student deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Students</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Manage registered students and their accounts.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name or email..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<UserX className="h-12 w-12" />} title="No students found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Registered</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={u.status === 'ACTIVE' ? 'green' : 'red'}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openProfile(u)} className="btn-secondary px-3 py-1.5 text-xs">Profile</button>
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`btn px-3 py-1.5 text-xs ${u.status === 'ACTIVE' ? 'bg-accent-500 text-white hover:bg-accent-600' : 'bg-success-600 text-white hover:bg-success-700'}`}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => setDeleteTarget(u)} className="btn-danger px-3 py-1.5 text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!profile} onClose={() => setProfile(null)} title="Student profile" wide>
        {profileLoading ? <Spinner className="h-8 w-8" /> : profile && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
                {profile.user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{profile.user.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{profile.user.email}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Joined {new Date(profile.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                { label: 'Quizzes attempted', value: profile.quizzesAttempted },
                { label: 'Passed', value: profile.quizzesPassed },
                { label: 'Failed', value: profile.quizzesFailed },
                { label: 'Average score', value: `${profile.averageScore}%` },
                { label: 'Highest score', value: `${profile.highestScore}%` },
                { label: 'Questions answered', value: profile.totalQuestionsAnswered },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Quiz history
              </h3>
              {profile.attempts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No attempts yet.</p>
              ) : (
                <div className="space-y-2">
                  {profile.attempts.slice(0, 10).map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2.5 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.quizTitle}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(a.completedAt).toLocaleDateString()} · {a.correctAnswers} correct
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 dark:text-white">{a.percentage}%</span>
                        <Badge tone={a.status === 'PASSED' ? 'green' : 'red'}>{a.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete student?"
        message={`This will permanently delete ${deleteTarget?.name}'s account and all their quiz history. This cannot be undone.`}
      />
    </div>
  )
}