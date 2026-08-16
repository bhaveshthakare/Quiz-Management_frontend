import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Award, CheckCircle2, ChevronDown, Clock, FileQuestion, GraduationCap,
  HelpCircle, RefreshCw, Trophy, XCircle,
} from 'lucide-react'
import client, { errorMessage } from '../../api/client'
import Spinner from '../../components/Spinner'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

const statusTone = { PASSED: 'green', FAILED: 'red' }

export default function Result({ admin = false }) {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    client.get(admin ? `/api/admin/attempts/${id}` : `/api/attempts/${id}`)
      .then((r) => setResult(r.data))
      .catch((e) => toast.error(errorMessage(e)))
  }, [id, admin])

  if (!result) return <Spinner />

  const toggle = (qid) => setExpanded((prev) => ({ ...prev, [qid]: !prev[qid] }))
  const passed = result.passed
  const mm = Math.floor(result.timeTaken / 60)
  const ss = result.timeTaken % 60

  return (
    <div className="mx-auto max-w-4xl">
      <div className={`card overflow-hidden ${passed ? 'ring-1 ring-emerald-300 dark:ring-emerald-800' : ''}`}>
        <div className={`px-6 py-10 text-center ${passed ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-rose-500 to-rose-700'}`}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
            {passed ? <Trophy className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <h1 className="text-2xl font-extrabold text-white">QUIZ RESULT</h1>
          <p className="mt-1 text-lg font-semibold text-white/90">{result.quizTitle}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-4xl font-extrabold text-white tabular-nums">
            {result.percentage}%
          </div>
          <p className="mt-3 text-white/90">
            Status: <Badge tone={statusTone[result.status]} className="ml-1 text-sm">{result.status}</Badge>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-5">
          <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800">
            <FileQuestion className="mx-auto mb-1 h-5 w-5 text-primary-600 dark:text-primary-400" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{result.totalQuestions}</p>
            <p className="text-xs text-slate-500">Total questions</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/30">
            <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{result.correctAnswers}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Correct</p>
          </div>
          <div className="rounded-xl bg-rose-50 p-4 text-center dark:bg-rose-900/30">
            <XCircle className="mx-auto mb-1 h-5 w-5 text-rose-600 dark:text-rose-400" />
            <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{result.incorrectAnswers}</p>
            <p className="text-xs text-rose-600/70 dark:text-rose-400/70">Incorrect</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-center dark:bg-amber-900/30">
            <HelpCircle className="mx-auto mb-1 h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{result.unanswered}</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Unanswered</p>
          </div>
          <div className="col-span-2 rounded-xl bg-slate-50 p-4 text-center md:col-span-1 dark:bg-slate-800">
            <Clock className="mx-auto mb-1 h-5 w-5 text-primary-600 dark:text-primary-400" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{mm}:{String(ss).padStart(2, '0')}</p>
            <p className="text-xs text-slate-500">Time taken</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 px-6 pb-8">
          {result.certificateId && !admin && (
            <a
              href={`${import.meta.env.VITE_API_URL || ''}/api/certificates/${result.attemptId}/download`}
              className="btn-success"
            >
              <Award className="h-4 w-4" /> Download certificate
            </a>
          )}
          {!admin ? (
            <>
              <Link to="/student/quizzes" className="btn-primary">
                <RefreshCw className="h-4 w-4" /> Try another quiz
              </Link>
              <Link to="/student/history" className="btn-secondary">View all attempts</Link>
            </>
          ) : (
            <Link to="/admin/attempts" className="btn-secondary">Back to attempts</Link>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          Answer review
        </h2>
        {result.review.length === 0 ? (
          <EmptyState icon={<HelpCircle className="h-12 w-12" />} title="No review available" />
        ) : (
          <div className="space-y-4">
            {result.review.map((q, idx) => {
              const isOpen = !!expanded[q.questionId]
              return (
                <div key={q.questionId} className="card overflow-hidden">
                  <button
                    onClick={() => toggle(q.questionId)}
                    className="flex w-full items-start justify-between gap-4 p-5 text-left"
                  >
                    <div className="flex items-start gap-3">
                      {q.isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
                      )}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Question {idx + 1} · {q.marks} mark{q.marks > 1 ? 's' : ''}
                        </p>
                        <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{q.questionText}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {!q.answered ? 'Not answered' : q.isCorrect ? 'Correct answer' : 'Wrong answer'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="space-y-2 border-t border-slate-100 p-5 dark:border-slate-800">
                      {q.options.map((opt) => {
                        let style = 'border-slate-200 dark:border-slate-700'
                        let mark = null
                        if (opt.isCorrect) {
                          style = 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30'
                          mark = <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        } else if (opt.selected) {
                          style = 'border-rose-400 bg-rose-50 dark:border-rose-700 dark:bg-rose-900/30'
                          mark = <XCircle className="h-5 w-5 text-rose-500" />
                        }
                        return (
                          <div key={opt.optionId} className={`flex items-center justify-between gap-3 rounded-lg border-2 p-3 text-sm ${style}`}>
                            <span className="text-slate-700 dark:text-slate-200">{opt.optionText}</span>
                            {mark}
                          </div>
                        )
                      })}
                      {q.explanation && (
                        <div className="mt-3 rounded-lg bg-primary-50 p-4 text-sm text-primary-900 dark:bg-primary-900/30 dark:text-primary-200">
                          <span className="font-bold">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}