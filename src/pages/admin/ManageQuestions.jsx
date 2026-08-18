import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FileUp, Plus, Trash2, Upload } from 'lucide-react'
import client, { errorMessage } from '../../api/client'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'

const difficultyTone = { EASY: 'green', INTERMEDIATE: 'amber', HARD: 'red' }
const LETTERS = ['A', 'B', 'C', 'D']

export default function ManageQuestions() {
  const { id: quizId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importSummary, setImportSummary] = useState(null)
  const fileRef = useRef(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { options: ['', '', '', ''] },
  })
  const options = watch('options')
  const correctIndex = watch('correctIndex')

  const load = () => {
    setLoading(true)
    Promise.all([
      client.get(`/api/quizzes/${quizId}`),
      client.get(`/api/quizzes/${quizId}/questions`),
    ]).then(([q, qs]) => {
      setQuiz(q.data)
      setQuestions(qs.data)
    }).catch((e) => toast.error(errorMessage(e))).finally(() => setLoading(false))
  }

  useEffect(load, [quizId])

  const openCreate = () => {
    setEditing({ id: null })
    reset({ questionText: '', marks: 1, difficulty: 'EASY', explanation: '', options: ['', '', '', ''], correctIndex: '0' })
  }

  const openEdit = (q) => {
    setEditing(q)
    const opts = [...q.options.map((o) => o.optionText)]
    while (opts.length < 4) opts.push('')
    reset({
      questionText: q.questionText,
      marks: q.marks,
      difficulty: q.difficulty,
      explanation: q.explanation || '',
      options: opts,
      correctIndex: String(q.options.findIndex((o) => o.isCorrect)),
    })
  }

  const onSave = async (data) => {
    const payload = {
      questionText: data.questionText,
      marks: Number(data.marks),
      difficulty: data.difficulty,
      explanation: data.explanation,
      options: options.map((text, i) => ({ optionText: text, isCorrect: String(i) === String(data.correctIndex) })),
    }
    setSaving(true)
    try {
      if (editing.id) {
        await client.put(`/api/questions/${editing.id}`, payload)
        toast.success('Question updated')
      } else {
        await client.post(`/api/quizzes/${quizId}/questions`, payload)
        toast.success('Question added')
      }
      setEditing(null)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      await client.delete(`/api/questions/${deleteTarget.id}`)
      toast.success('Question deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  const onImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportSummary(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await client.post(`/api/quizzes/${quizId}/questions/import`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImportSummary(data)
      toast.success(`Imported ${data.imported} of ${data.totalRows} questions`)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link to="/admin/quizzes" className="text-sm text-slate-500 hover:underline dark:text-slate-400">← Back to quizzes</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{quiz?.title}</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{questions.length} questions · manage or import questions</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} disabled={importing} className="btn-secondary">
              <FileUp className="h-4 w-4" /> {importing ? 'Importing...' : 'Import CSV/Excel'}
            </button>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onImport} />
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" /> Add question
            </button>
          </div>
        </div>
      </div>

      {importSummary && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
          <p className="font-bold">Import complete: {importSummary.imported} imported, {importSummary.failed} failed</p>
          {importSummary.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs">
              {importSummary.errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
        </div>
      )}

      {questions.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-12 w-12" />}
          title="No questions yet"
          subtitle="Add questions one by one, or import them from a CSV/Excel file."
          action={<button onClick={openCreate} className="btn-primary">Add first question</button>}
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-400">Q{idx + 1}</span>
                    <Badge tone={difficultyTone[q.difficulty]}>{q.difficulty}</Badge>
                    <Badge tone="blue">{q.marks} mark{q.marks > 1 ? 's' : ''}</Badge>
                  </div>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{q.questionText}</p>
                  <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {q.options.map((o, i) => (
                      <div
                        key={o.id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                          o.isCorrect
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                            : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-bold">{LETTERS[i]}.</span> {o.optionText}
                        {o.isCorrect && <span className="ml-auto text-xs font-bold">✓ correct</span>}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="mt-3 rounded-lg bg-primary-50 p-3 text-xs text-primary-900 dark:bg-primary-900/30 dark:text-primary-200">
                      <span className="font-bold">Explanation:</span> {q.explanation}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => openEdit(q)} className="btn-secondary px-3 py-1.5 text-xs">Edit</button>
                  <button onClick={() => setDeleteTarget(q)} className="btn-danger px-3 py-1.5 text-xs">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit question' : 'Add question'} wide>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label htmlFor="q-text" className="label">Question text *</label>
            <textarea id="q-text" className="input min-h-20" {...register('questionText', { required: 'Question text is required' })} />
            {errors.questionText && <p className="mt-1 text-xs text-rose-600">{errors.questionText.message}</p>}
          </div>

          <div>
            <label className="label">Options</label>
            <div className="space-y-2">
              {options.map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-6 text-center text-sm font-bold ${String(i) === String(correctIndex) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {LETTERS[i]}
                  </span>
                  <input
                    aria-label={`Option ${LETTERS[i]}`}
                    className="input"
                    placeholder={`Option ${LETTERS[i]}`}
                    {...register(`options.${i}`, { required: 'Option text is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setValue('correctIndex', String(i))}
                    className={`btn px-3 py-2 text-xs ${String(i) === String(correctIndex) ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'btn-secondary'}`}
                  >
                    {String(i) === String(correctIndex) ? '✓ Correct' : 'Correct'}
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Mark exactly one option as the correct answer.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="q-marks" className="label">Marks *</label>
              <input id="q-marks" type="number" min="1" className="input" {...register('marks', { required: true, min: 1 })} />
            </div>
            <div>
              <label htmlFor="q-difficulty" className="label">Difficulty</label>
              <select id="q-difficulty" className="input" {...register('difficulty')}>
                <option value="EASY">Easy</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label htmlFor="q-explanation" className="label">Explanation</label>
              <input id="q-explanation" className="input" placeholder="Shown after quiz" {...register('explanation')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing?.id ? 'Save changes' : 'Add question'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete question?"
        message="This question and its options will be permanently removed."
      />

      <div className="mt-8">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Upload className="h-4 w-4 text-primary-600 dark:text-primary-400" /> CSV / Excel format
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Columns: <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">question, option1, option2, option3, option4, correct(A-D), marks, difficulty, explanation</code>
          </p>
        </div>
      </div>
    </div>
  )
}