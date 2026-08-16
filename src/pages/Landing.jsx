import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Brain, Clock, ShieldCheck, Trophy, Users } from 'lucide-react'
import client from '../api/client'
import QuizCard from '../components/QuizCard'
import Navbar from '../components/Navbar'
import { useTheme } from '../store/theme'

const features = [
  { icon: Brain, title: 'Smart Quizzes', text: 'Timed assessments with instant auto-scoring on the server.' },
  { icon: Trophy, title: 'Leaderboards', text: 'Compete with other students overall or per category.' },
  { icon: BarChart3, title: 'Performance Analytics', text: 'Track your average score, history and progress over time.' },
  { icon: ShieldCheck, title: 'Secure & Fair', text: 'Server-validated answers, randomized questions and options.' },
]

export default function Landing() {
  const [quizzes, setQuizzes] = useState([])
  const init = useTheme((s) => s.init)

  useEffect(() => {
    init()
    client.get('/api/quizzes?sort=recent').then((r) => setQuizzes(r.data.slice(0, 3))).catch(() => {})
  }, [init])

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="bg-gradient-to-br from-primary-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center md:py-28">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
            <Clock className="h-4 w-4" /> Online assessment platform
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 dark:text-white md:text-6xl">
            Test your knowledge with <span className="text-primary-600">timed quizzes</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Browse quizzes across JavaScript, Python, Java and more. Attempt them under a countdown timer,
            get instant results, review answers and climb the leaderboard.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/auth/register" className="btn-primary px-6 py-3 text-base">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/quizzes" className="btn-secondary px-6 py-3 text-base">
              Browse quizzes
            </Link>
          </div>
          <div className="mx-auto mt-12 flex max-w-lg items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> 100s of students</span>
            <span className="flex items-center gap-2"><Brain className="h-4 w-4" /> Auto scoring</span>
            <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Certificates</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {quizzes.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Latest quizzes</h2>
            <Link to="/quizzes" className="text-sm font-semibold text-primary-600 hover:underline">
              View all <ArrowRight className="inline h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {quizzes.map((q) => <QuizCard key={q.id} quiz={q} />)}
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Quiz Platform — Quiz Management & Online Assessment
      </footer>
    </div>
  )
}