import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FolderPlus, Pencil, Trash2 } from 'lucide-react'
import client, { errorMessage } from '../../api/client'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = () => {
    client.get('/api/categories').then((r) => setCategories(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing({ id: null })
    reset({ name: '', description: '' })
  }

  const openEdit = (c) => {
    setEditing(c)
    reset({ name: c.name, description: c.description || '' })
  }

  const onSave = async (data) => {
    setSaving(true)
    try {
      if (editing.id) {
        await client.put(`/api/categories/${editing.id}`, data)
        toast.success('Category updated')
      } else {
        await client.post('/api/categories', data)
        toast.success('Category created')
      }
      setEditing(null)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      await client.delete(`/api/categories/${deleteTarget.id}`)
      toast.success('Category deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Organize quizzes into categories.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FolderPlus className="h-4 w-4" /> New category
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={<FolderPlus className="h-12 w-12" />} title="No categories yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{c.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {c.description || 'No description'}
                  </p>
                </div>
                <Badge tone="blue">{c.quizCount} quizzes</Badge>
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button onClick={() => openEdit(c)} className="btn-secondary px-3 py-1.5 text-xs">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteTarget(c)} className="btn-danger px-3 py-1.5 text-xs">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit category' : 'New category'}>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="e.g. JavaScript" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="Short description" {...register('description')} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete category?"
        message="Only empty categories can be deleted. Quizzes under this category must be removed or moved first."
      />
    </div>
  )
}