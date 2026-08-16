import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Clock, Send } from 'lucide-react'
import client, { errorMessage } from '../../api/client'
import Spinner from '../../components/Spinner'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function Attempt() {
  const { quizId, attemptId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const submittedRef = useRef(false)

  const load = useCallback(async () => {
    try {
      const { data: d } = await client.post(`/api/quizzes/${quizId}/start`)
      if (d.attemptId !== Number(attemptId)) {
        navigate(`/student/attempt/${quizId}/${d.attemptId}`, { replace: true })
      }
      setData(d)
      const map = {}
      d.questions.forEach((q) => {
        if (q.selectedOptionId) map[q.questionId] = q.selectedOptionId
      })
      setAnswers(map)
      const ms = new Date(d.deadline).getTime() - Date.now()
      setRemaining(Math.max(0, Math.floor(ms / 1000)))
    } catch (e) {
      toast.error(errorMessage(e))
      navigate('/student/quizzes')
    }
  }, [quizId, attemptId, navigate])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (data && remaining > 0) {
      const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
      return () => clearInterval(t)
    }
  }, [data, remaining])

  const doSubmit = useCallback(async (auto = false) => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    try {
      await client.post(`/api/attempts/${data.attemptId}/submit`)
      if (auto) toast('Time is up! Quiz submitted automatically.')
      navigate(`/student/result/${data.attemptId}`, { replace: true })
    } catch (e) {
      submittedRef.current = false
      setSubmitting(false)
      toast.error(errorMessage(e))
    }
  }, [data, navigate])

  useEffect(() => {
    if (remaining === 0 && data && !submitting) {
      doSubmit(true)
    }
  }, [remaining, data, submitting, doSubmit])

  const saveAnswer = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
    client.post(`/api/attempts/${data.attemptId}/answer`, { questionId, selectedOptionId: optionId }).catch(() => {})
  }

  const clearAnswer = (questionId) => {
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
    client.post(`/api/attempts/${data.attemptId}/answer`, { questionId, selectedOptionId: null }).catch(() => {})
  }

  const timeLabel = useMemo(() => {
    const m = Math.floor(remaining / 60)
    const s = remaining % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [remaining])

  const answeredCount = Object.keys(answers).length

  if (!data) return <Spinner />

  const q = data.questions[current]
  const danger = remaining <= 60

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white">{data.quizTitle}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Question {current + 1} of {data.questions.length} · {answeredCount} answered
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xl font-bold tabular-nums ${
              danger
                ? 'animate-pulse bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-white'
            }`}
          >
            <Clock className="h-5 w-5" />
            {timeLabel}
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
            className="btn-success"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="card p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
              Question {current + 1}
              <span className="ml-2 text-slate-400 normal-case">· {q.difficulty}</span>
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{q.questionText}</h2>

            <div className="mt-6 space-y-3">
              {q.options.map((opt, idx) => {
                const selected = answers[q.questionId] === opt.optionId
                return (
                  <button
                    key={opt.optionId}
                    onClick={() => saveAnswer(q.questionId, opt.optionId)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                      selected
                        ? 'border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/30'
                        : 'border-slate-200 bg-white hover:border-primary-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        selected
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-slate-800 dark:text-slate-100">{opt.optionText}</span>
                  </button>
                )
              })}
            </div>

            {answers[q.questionId] && (
              <button onClick={() => clearAnswer(q.questionId)} className="mt-4 text-sm font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400">
                Clear selection
              </button>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
              <button
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="btn-secondary"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {answeredCount} of {data.questions.length} answered
              </span>
              {current < data.questions.length - 1 ? (
                <button onClick={() => setCurrent((c) => Math.min(data.questions.length - 1, c + 1))} className="btn-primary">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={() => setConfirmOpen(true)} className="btn-success">
                  Submit <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <aside className="card h-fit p-5 lg:sticky lg:top-24">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Question palette
            </h3>
            <div className="grid grid-cols-5 gap-2 lg:grid-cols-6">
              {data.questions.map((question, idx) => {
                const answered = !!answers[question.questionId]
                const isCurrent = idx === current
                return (
                  <button
                    key={question.questionId}
                    onClick={() => setCurrent(idx)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition ${
                      isCurrent
                        ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900'
                        : ''
                    } ${answered ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-500" /> Answered
              </p>
              <p className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-700" /> Unanswered
              </p>
              <p className="flex items-center gap-2">
                <Circle className="h-3 w-3" /> Current
              </p>
            </div>
            <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Answers are saved as you select them. The quiz auto-submits when time runs out.
            </p>
          </aside>
        </div>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); doSubmit(false) }}
        title="Submit quiz?"
        message={`You have answered ${answeredCount} of ${data.questions.length} questions. You cannot change your answers after submitting.`}
        loading={submitting}
      />
    </div>
  )
}