import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import client, { errorMessage } from '../../api/client'
import Spinner from '../../components/Spinner'

export default function QuizForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    client.get('/api/categories').then((r) => setCategories(r.data)).catch(() => {})
    if (isEdit) {
      client.get(`/api/quizzes/${id}`).then((r) => {
        const q = r.data
        reset({
          title: q.title,
          description: q.description || '',
          categoryId: String(q.category.id),
          difficulty: q.difficulty,
          duration: q.duration,
          passingScore: q.passingScore,
          maxAttempts: q.maxAttempts,
          status: q.status,
          thumbnail: q.thumbnail || '',
          negativeMarking: q.negativeMarking,
          negativeMarkValue: q.negativeMarkValue,
          startDate: q.startDate ? q.startDate.slice(0, 16) : '',
          endDate: q.endDate ? q.endDate.slice(0, 16) : '',
        })
      }).catch((e) => toast.error(errorMessage(e))).finally(() => setLoading(false))
    }
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      categoryId: Number(data.categoryId),
      duration: Number(data.duration),
      passingScore: Number(data.passingScore),
      maxAttempts: Number(data.maxAttempts),
      negativeMarking: data.negativeMarking === true || data.negativeMarking === 'true',
      negativeMarkValue: Number(data.negativeMarkValue || 0),
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    }
    try {
      if (isEdit) {
        await client.put(`/api/quizzes/${id}`, payload)
        toast.success('Quiz updated')
      } else {
        const { data: created } = await client.post('/api/quizzes', payload)
        toast.success('Quiz created')
        navigate(`/admin/quizzes/${created.id}/questions`)
        return
      }
      navigate('/admin/quizzes')
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link to="/admin/quizzes" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
          ← Back to quizzes
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {isEdit ? 'Edit quiz' : 'Create quiz'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6">
        <div>
          <label className="label">Quiz title *</label>
          <input className="input" placeholder="e.g. JavaScript Fundamentals" {...register('title', { required: 'Title is required' })} />
          {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-24" placeholder="What does this quiz cover?" {...register('description')} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Category *</label>
            <select className="input" {...register('categoryId', { required: 'Category is required' })}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-rose-600">{errors.categoryId.message}</p>}
          </div>
          <div>
            <label className="label">Difficulty *</label>
            <select className="input" {...register('difficulty', { required: 'Difficulty is required' })}>
              <option value="EASY">Easy</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label className="label">Duration (minutes) *</label>
            <input type="number" min="1" className="input" {...register('duration', { required: 'Duration is required', min: 1 })} />
            {errors.duration && <p className="mt-1 text-xs text-rose-600">{errors.duration.message}</p>}
          </div>
          <div>
            <label className="label">Passing score (%) *</label>
            <input type="number" min="0" max="100" className="input" {...register('passingScore', { required: 'Passing score is required', min: 0, max: 100 })} />
            {errors.passingScore && <p className="mt-1 text-xs text-rose-600">{errors.passingScore.message}</p>}
          </div>
          <div>
            <label className="label">Maximum attempts *</label>
            <input type="number" min="1" className="input" {...register('maxAttempts', { required: 'Max attempts is required', min: 1 })} />
            {errors.maxAttempts && <p className="mt-1 text-xs text-rose-600">{errors.maxAttempts.message}</p>}
          </div>
          <div>
            <label className="label">Status *</label>
            <select className="input" {...register('status')}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="UNPUBLISHED">Unpublished</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Thumbnail URL (optional)</label>
          <input className="input" placeholder="https://..." {...register('thumbnail')} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Scheduled start (optional)</label>
            <input type="datetime-local" className="input" {...register('startDate')} />
          </div>
          <div>
            <label className="label">Scheduled end (optional)</label>
            <input type="datetime-local" className="input" {...register('endDate')} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Negative marking</span>
            <input type="checkbox" className="h-5 w-5 accent-primary-600" {...register('negativeMarking')} />
          </label>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Deduct marks for incorrect answers (suggested: 0.5 per mark).
          </p>
          <div className="mt-3">
            <label className="label">Penalty (× question marks)</label>
            <input type="number" step="0.01" min="0" className="input" defaultValue="0.5" {...register('negativeMarkValue')} />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <Link to="/admin/quizzes" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create quiz'}
          </button>
        </div>
      </form>
    </div>
  )
}