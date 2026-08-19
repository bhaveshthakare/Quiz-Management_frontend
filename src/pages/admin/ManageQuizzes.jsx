import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookPlus, FileQuestion, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import client, { errorMessage } from '../../api/client'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Badge from '../../components/Badge'
import ConfirmDialog from '../../components/ConfirmDialog'

const difficultyTone = { EASY: 'green', INTERMEDIATE: 'amber', HARD: 'red' }
const statusTone = { PUBLISHED: 'green', DRAFT: 'slate', UNPUBLISHED: 'red' }

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    client.get('/api/quizzes').then((r) => setQuizzes(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const togglePublish = async (q) => {
    const status = q.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED'
    try {
      await client.patch(`/api/quizzes/${q.id}/publish`, { status })
      toast.success(`Quiz ${status === 'PUBLISHED' ? 'published' : 'unpublished'}`)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      await client.delete(`/api/quizzes/${deleteTarget.id}`)
      toast.success('Quiz deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quizzes</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Create, edit, publish and delete quizzes.</p>
        </div>
        <Link to="/admin/quizzes/new" className="btn-primary">
          <BookPlus className="h-4 w-4" /> New quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon={<BookPlus className="h-12 w-12" />}
          title="No quizzes yet"
          subtitle="Create your first quiz to get started."
          action={<Link to="/admin/quizzes/new" className="btn-primary">Create quiz</Link>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Quiz</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Difficulty</th>
                <th className="px-5 py-3">Questions</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Pass</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <Link to={`/admin/quizzes/${q.id}/edit`} className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
                      {q.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4"><Badge tone="blue">{q.category.name}</Badge></td>
                  <td className="px-5 py-4"><Badge tone={difficultyTone[q.difficulty]}>{q.difficulty}</Badge></td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{q.questionCount}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{q.duration} min</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{q.passingScore}%</td>
                  <td className="px-5 py-4"><Badge tone={statusTone[q.status]}>{q.status}</Badge></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/quizzes/${q.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs" title="Edit">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <Link to={`/admin/quizzes/${q.id}/questions`} className="btn-secondary px-3 py-1.5 text-xs" title="Questions">
                        <FileQuestion className="h-3.5 w-3.5" /> Questions
                      </Link>
                      <button
                        onClick={() => togglePublish(q)}
                        className={`btn px-3 py-1.5 text-xs ${q.status === 'PUBLISHED' ? 'bg-accent-500 text-white hover:bg-accent-600' : 'bg-success-600 text-white hover:bg-success-700'}`}
                      >
                        {q.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => setDeleteTarget(q)} className="btn-danger px-3 py-1.5 text-xs" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete quiz?"
        message={`This will permanently delete "${deleteTarget?.title}" along with all its questions and attempt history.`}
      />
    </div>
  )
}