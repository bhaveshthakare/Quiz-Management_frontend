import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, BookOpen, Clock, Flame, Sparkles, Target, TrendingUp, Trophy, XCircle } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import client from '../../api/client'
import { useAuth } from '../../store/auth'
import Spinner from '../../components/Spinner'
import Badge from '../../components/Badge'

const statusTone = { PASSED: 'green', FAILED: 'red' }

export default function StudentDashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      client.get('/api/attempts').catch(() => ({ data: [] })),
      client.get('/api/quizzes').catch(() => ({ data: [] })),
    ]).then(([h, q]) => {
      setHistory(h.data)
      setQuizzes(q.data.filter((quiz) => quiz.status === 'PUBLISHED').slice(0, 3))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const passed = history.filter((a) => a.status === 'PASSED').length
  const failed = history.filter((a) => a.status === 'FAILED').length
  const avg = history.length ? Math.round(history.reduce((s, a) => s + Number(a.percentage), 0) / history.length) : 0
  const best = history.length ? Math.max(...history.map((a) => Number(a.percentage))) : 0
  const chartData = [...history].reverse().slice(-14).map((a) => ({
    name: new Date(a.completedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    score: Number(a.percentage),
  }))
  const streak = history.filter((a) => a.status === 'PASSED').length

  const stats = [
    { icon: BookOpen, label: 'Quizzes attempted', value: history.length, tone: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300' },
    { icon: Trophy, label: 'Passed', value: passed, tone: 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300' },
    { icon: XCircle, label: 'Failed', value: failed, tone: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300' },
    { icon: Target, label: 'Average score', value: `${avg}%`, tone: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300' },
    { icon: TrendingUp, label: 'Highest score', value: `${best}%`, tone: 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300' },
    { icon: Flame, label: 'Quizzes passed', value: streak, tone: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300' },
  ]

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-8 text-white shadow-xl shadow-primary-500/20">
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-32 h-44 w-44 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-3xl font-extrabold backdrop-blur">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-white/70">
                <Sparkles className="h-4 w-4" /> Student dashboard
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Hi, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
              <p className="mt-1.5 text-sm text-white/80">Keep the momentum going — {quizzes.length > 0 ? 'fresh quizzes are waiting for you.' : 'your performance is looking great!'}</p>
            </div>
          </div>
          <Link
            to="/student/quizzes"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25"
          >
            <BookOpen className="h-4 w-4" /> Browse quizzes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="card card-hover p-5">
            <div className={`stat-chip ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" /> Score trend
          </h2>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No attempts yet. <Link to="/student/quizzes" className="text-primary-600 hover:underline">Take your first quiz!</Link>
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'white' }} />
                <Line type="monotone" dataKey="score" name="Score %" stroke="#6c63ff" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Trophy className="h-4 w-4 text-primary-600 dark:text-primary-400" /> Recent attempts
            </h2>
            <Link to="/student/history" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
          </div>
          {history.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No attempts yet.</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((a) => (
                <Link key={a.id} to={`/student/result/${a.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 transition hover:border-primary-300 dark:border-slate-800 dark:hover:border-primary-500">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{a.quizTitle}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {a.category} · {new Date(a.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{a.percentage}%</span>
                    <Badge tone={statusTone[a.status]}>{a.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {quizzes.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" /> Recommended for you
            </h2>
            <Link to="/student/quizzes" className="text-sm font-semibold text-primary-600 hover:underline">See all quizzes</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Link key={quiz.id} to={`/quizzes/${quiz.id}`} className="card card-hover group p-5">
                <div className="flex items-start justify-between">
                  <Badge tone="blue">{quiz.difficulty}</Badge>
                  <BarChart3 className="h-4 w-4 text-slate-300 transition group-hover:text-primary-500 dark:text-slate-600" />
                </div>
                <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{quiz.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{quiz.description}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{quiz.questionCount} questions</span>
                  <span>·</span>
                  <span>{quiz.duration} min</span>
                  <span>·</span>
                  <span>Pass {quiz.passingScore}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}