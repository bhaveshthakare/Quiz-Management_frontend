import { Link } from 'react-router-dom'
import Badge from './Badge'
import { Clock, FileQuestion } from 'lucide-react'

const difficultyTone = { EASY: 'green', INTERMEDIATE: 'amber', HARD: 'red' }
const difficultyLabel = { EASY: 'Easy', INTERMEDIATE: 'Intermediate', HARD: 'Hard' }

export default function QuizCard({ quiz }) {
  return (
    <Link
      to={`/quizzes/${quiz.id}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-36 bg-gradient-to-br from-primary-500 to-primary-700">
        {quiz.thumbnail ? (
          <img src={quiz.thumbnail} alt={quiz.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-extrabold text-white/80">
            {quiz.title.charAt(0)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <span className="text-xs font-semibold text-white/90">{quiz.category?.name}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-slate-900 group-hover:text-primary-600 dark:text-white">{quiz.title}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{quiz.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge tone={difficultyTone[quiz.difficulty] || 'slate'}>{difficultyLabel[quiz.difficulty] || quiz.difficulty}</Badge>
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <FileQuestion className="h-3.5 w-3.5" /> {quiz.questionCount}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" /> {quiz.duration} min
          </span>
        </div>
      </div>
    </Link>
  )
}