import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BookOpen, CheckCircle2, ClipboardList, FileQuestion, FileText,
  Layers, Sparkles, TrendingUp, Users, XCircle,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import client from '../../api/client'
import { useAuth } from '../../store/auth'
import Spinner from '../../components/Spinner'
import Badge from '../../components/Badge'

const PIE_COLORS = ['#6c63ff', '#f43f5e', '#22c55e', '#ffb703', '#06b6d4', '#f97316']

const statusTone = { PASSED: 'green', FAILED: 'red', IN_PROGRESS: 'blue' }

export default function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [attempts, setAttempts] = useState([])

  useEffect(() => {
    client.get('/api/admin/analytics').then((r) => setData(r.data)).catch(() => {})
    client.get('/api/admin/attempts').then((r) => setAttempts(r.data)).catch(() => {})
  }, [])

  if (!data) return <Spinner />

  const { stats } = data
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const cards = [
    { icon: Users, label: 'Total students', value: stats.totalStudents, tone: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300', to: '/admin/users' },
    { icon: BookOpen, label: 'Total quizzes', value: stats.totalQuizzes, tone: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300', to: '/admin/quizzes' },
    { icon: FileText, label: 'Published', value: stats.publishedQuizzes, tone: 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300', to: '/admin/quizzes' },
    { icon: Layers, label: 'Drafts', value: stats.draftQuizzes, tone: 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300', to: '/admin/quizzes' },
    { icon: FileQuestion, label: 'Questions', value: stats.totalQuestions, tone: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300', to: '/admin/quizzes' },
    { icon: ClipboardList, label: 'Attempts', value: stats.totalAttempts, tone: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300', to: '/admin/attempts' },
    { icon: CheckCircle2, label: 'Passed', value: stats.passedAttempts, tone: 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300', to: '/admin/attempts' },
    { icon: XCircle, label: 'Failed', value: stats.failedAttempts, tone: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300', to: '/admin/attempts' },
    { icon: TrendingUp, label: 'Average score', value: `${stats.averageScore}%`, tone: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300', to: '/admin/analytics' },
  ]

  const quickActions = [
    { label: 'Create quiz', to: '/admin/quizzes/new', icon: BookOpen },
    { label: 'Add question', to: '/admin/quizzes', icon: FileQuestion },
    { label: 'Manage students', to: '/admin/users', icon: Users },
    { label: 'View analytics', to: '/admin/analytics', icon: TrendingUp },
  ]

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-8 text-white shadow-xl shadow-primary-500/20">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/70">{today}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'} <Sparkles className="inline h-6 w-6" />
            </h1>
            <p className="mt-2 text-sm text-white/80">Here's what's happening across your quiz platform today.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                <a.icon className="h-4 w-4" /> {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card card-hover p-5">
            <div className="flex items-start justify-between">
              <div className={`stat-chip ${c.tone}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{c.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Quiz attempts over time (14 days)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.attemptsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="value" name="Attempts" stroke="#6c63ff" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Student registrations (14 days)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.registrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" name="Students" fill="#6c63ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pass / fail ratio">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.passFailRatio} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
                {data.passFailRatio.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average scores by quiz">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.averageScoresByQuiz} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" name="Avg score %" fill="#6c63ff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most popular quizzes">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.popularQuizzes} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" name="Attempts" fill="#ffb703" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most popular categories">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.popularCategories} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
                {data.popularCategories.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-8">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <ClipboardList className="h-4 w-4 text-primary-600 dark:text-primary-400" /> Recent attempts
            </h2>
            <Link to="/admin/attempts" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
          </div>
          {attempts.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No attempts yet. Share a published quiz with students to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Quiz</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.slice(0, 6).map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 transition hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">{a.studentName}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{a.quizTitle}</td>
                      <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">{a.percentage}%</td>
                      <td className="px-6 py-3"><Badge tone={statusTone[a.status]}>{a.status}</Badge></td>
                      <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(a.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 font-bold text-slate-900 dark:text-white">{title}</h2>
      {children}
    </div>
  )
}