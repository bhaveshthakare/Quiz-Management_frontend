import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, CheckCircle2, ClipboardList, FileQuestion, FileText, Layers, Users, XCircle,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import client from '../../api/client'
import Spinner from '../../components/Spinner'

const PIE_COLORS = ['#10b981', '#f43f5e', '#3c6cf0', '#f59e0b', '#8b5cf6', '#06b6d4']

export default function AdminDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    client.get('/api/admin/analytics').then((r) => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <Spinner />

  const { stats } = data

  const cards = [
    { icon: Users, label: 'Total students', value: stats.totalStudents, tone: 'text-primary-600 bg-primary-50 dark:bg-primary-900/40 dark:text-primary-300' },
    { icon: BookOpen, label: 'Total quizzes', value: stats.totalQuizzes, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-900/40 dark:text-violet-300' },
    { icon: FileText, label: 'Published quizzes', value: stats.publishedQuizzes, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-300' },
    { icon: Layers, label: 'Draft quizzes', value: stats.draftQuizzes, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-900/40 dark:text-amber-300' },
    { icon: FileQuestion, label: 'Total questions', value: stats.totalQuestions, tone: 'text-sky-600 bg-sky-50 dark:bg-sky-900/40 dark:text-sky-300' },
    { icon: ClipboardList, label: 'Total attempts', value: stats.totalAttempts, tone: 'text-rose-600 bg-rose-50 dark:bg-rose-900/40 dark:text-rose-300' },
    { icon: CheckCircle2, label: 'Passed attempts', value: stats.passedAttempts, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-300' },
    { icon: XCircle, label: 'Failed attempts', value: stats.failedAttempts, tone: 'text-rose-600 bg-rose-50 dark:bg-rose-900/40 dark:text-rose-300' },
    { icon: BookOpen, label: 'Average score', value: `${stats.averageScore}%`, tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Platform overview and key statistics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.tone}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
          </div>
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
              <Line type="monotone" dataKey="value" name="Attempts" stroke="#3c6cf0" strokeWidth={2} dot={false} />
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
              <Bar dataKey="value" name="Students" fill="#3c6cf0" radius={[6, 6, 0, 0]} />
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
              <Bar dataKey="value" name="Avg score %" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
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
              <Bar dataKey="value" name="Attempts" fill="#f59e0b" radius={[0, 6, 6, 0]} />
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

      <div className="mt-8 flex gap-3">
        <Link to="/admin/quizzes" className="btn-primary">Manage quizzes</Link>
        <Link to="/admin/users" className="btn-secondary">Manage students</Link>
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