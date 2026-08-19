import { useEffect, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import client from '../../api/client'
import Spinner from '../../components/Spinner'

const PIE_COLORS = ['#22c55e', '#f43f5e', '#6c63ff', '#ffb703', '#8f88ff', '#06b6d4']

function ChartCard({ title, children }) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 font-bold text-slate-900 dark:text-white">{title}</h2>
      {children}
    </div>
  )
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    client.get('/api/admin/analytics').then((r) => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <Spinner />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Deep dive into platform performance and engagement.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Attempts over time (14 days)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.attemptsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="value" name="Attempts" stroke="#6c63ff" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New student registrations (14 days)">
          <ResponsiveContainer width="100%" height={280}>
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
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.passFailRatio} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label>
                {data.passFailRatio.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average score by quiz">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.averageScoresByQuiz} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" name="Avg %" fill="#6c63ff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most popular quizzes">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.popularQuizzes} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" name="Attempts" fill="#ffb703" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most popular categories">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.popularCategories} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label>
                {data.popularCategories.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}