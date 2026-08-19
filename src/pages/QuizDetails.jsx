import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AlertCircle, CheckCircle2, Clock, FileQuestion, Play, Repeat, Target, Timer } from 'lucide-react'
import client, { errorMessage } from '../api/client'
import { useAuth } from '../store/auth'
import Navbar from '../components/Navbar'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'

const difficultyTone = { EASY: 'green', INTERMEDIATE: 'amber', HARD: 'red' }
const difficultyLabel = { EASY: 'Easy', INTERMEDIATE: 'Intermediate', HARD: 'Hard' }

export default function QuizDetails() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [starting, setStarting] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    client.get(`/api/quizzes/${id}`).then((r) => setQuiz(r.data)).catch((e) => toast.error(errorMessage(e)))
  }, [id])

  const startQuiz = async () => {
    if (!isAuthenticated) {
      toast('Please login to start the quiz')
      navigate('/auth/login', { state: { from: `/quizzes/${id}` } })
      return
    }
    if (isAdmin) {
      toast.error('Only students can attempt quizzes')
      return
    }
    setStarting(true)
    try {
      const { data } = await client.post(`/api/quizzes/${id}/start`)
      navigate(`/student/attempt/${id}/${data.attemptId}`)
    } catch (e) {
      const msg = errorMessage(e)
      if (msg.toLowerCase().includes('maximum number of attempts')) {
        setLimitReached(true)
      }
      toast.error(msg)
    } finally {
      setStarting(false)
    }
  }

  if (!quiz) return <div className="min-h-screen"><Navbar /><Spinner /></div>

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/quizzes" className="hover:underline">Quizzes</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700 dark:text-slate-200">{quiz.title}</span>
        </nav>

        <div className="card overflow-hidden">
          <div className="relative h-52 bg-gradient-to-br from-primary-500 to-primary-800">
            {quiz.thumbnail ? (
              <img src={quiz.thumbnail} alt={quiz.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl font-extrabold text-white/80">
                {quiz.title.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <h1 className="text-3xl font-extrabold text-white">{quiz.title}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone="blue">{quiz.category?.name}</Badge>
                <Badge tone={difficultyTone[quiz.difficulty]}>{difficultyLabel[quiz.difficulty]}</Badge>
                <Badge tone={quiz.status === 'PUBLISHED' ? 'green' : 'slate'}>
                  {quiz.status === 'PUBLISHED' ? 'Available' : quiz.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <p className="text-slate-600 dark:text-slate-300">{quiz.description || 'No description provided.'}</p>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <FileQuestion className="mb-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.questionCount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Questions</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <Timer className="mb-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.duration}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Minutes</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <Target className="mb-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.passingScore}%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">To pass</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <Repeat className="mb-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.maxAttempts}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Max attempts</p>
              </div>
            </div>

            {quiz.negativeMarking && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-800 dark:border-accent-900 dark:bg-accent-900/30 dark:text-accent-200">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  Negative marking is enabled: each incorrect answer deducts{' '}
                  <strong>{quiz.negativeMarkValue}×</strong> the question&apos;s marks. Skipped questions carry no penalty.
                </p>
              </div>
            )}

            {quiz.startDate && quiz.endDate && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Clock className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  Available from {new Date(quiz.startDate).toLocaleString()} until{' '}
                  {new Date(quiz.endDate).toLocaleString()}.
                </p>
              </div>
            )}

            {limitReached && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-200">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  You've used all <strong>{quiz.maxAttempts}</strong> allowed attempts for this quiz.
                  You can review past results from your history, or check back if the admin raises the limit.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={startQuiz}
                disabled={starting || limitReached}
                className="btn-primary px-8 py-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-5 w-5" />
                {limitReached ? 'Attempts exhausted' : starting ? 'Starting...' : 'Start Quiz'}
              </button>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-success-500" />
                Questions and options are randomized for every attempt. Timer starts immediately.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}