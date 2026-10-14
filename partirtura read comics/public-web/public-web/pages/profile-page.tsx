import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import { authenticationRepository } from '@/features/authentication/api'
import type { RequestError } from '@/types/api'
import CountrySearchSelect from '@/features/authentication/components/country-search-select'
import { useProtectedImage } from '@/hooks/use-protected-image'

interface ProfileFormData {
  firstName: string
  lastName: string
  countryId: string
}

const emptyForm: ProfileFormData = {
  firstName: '',
  lastName: '',
  countryId: '',
}

function extractImageId(avatarUrl: string | null): number {
  if (!avatarUrl) return 0
  const match = avatarUrl.match(/\/images\/(\d+)/)
  return match ? Number(match[1]) : 0
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [form, setForm] = useState<ProfileFormData>(emptyForm)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [currentImageId, setCurrentImageId] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAvatarSubmitting, setIsAvatarSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarSrc = useProtectedImage(avatarPreview || user?.avatarUrl)

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        countryId: user.countryId ? String(user.countryId) : '',
      })
      setAvatarPreview(user.avatarUrl)
      setCurrentImageId(extractImageId(user.avatarUrl))
      setAvatarFile(null)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('firstName', form.firstName)
      formData.append('lastName', form.lastName)
      formData.append('countryId', form.countryId ? String(form.countryId) : '')

      if (avatarFile) {
        formData.append('imageId', '0')
        formData.append('avatar', avatarFile)
      } else if (avatarPreview === null && currentImageId > 0) {
        formData.append('imageId', '0')
      } else {
        formData.append('imageId', String(currentImageId))
      }

      await authenticationRepository.updateProfile(formData)

      setSuccess('Perfil actualizado correctamente.')
      await refreshProfile()
    } catch (err) {
      const apiError = err as RequestError
      setError(apiError.message || 'Ocurrió un error al actualizar el perfil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)
    setIsAvatarSubmitting(true)

    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
      setAvatarFile(file)
      setCurrentImageId(0)
    }
    reader.readAsDataURL(file)

    setIsAvatarSubmitting(false)
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setAvatarFile(null)
    setCurrentImageId(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancel = () => {
    navigate('/index')
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neps-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Editar Perfil</h1>
          <p className="text-xs text-neps-muted mt-1">Actualizá tu foto y datos personales de tu cuenta.</p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-xs text-neps-muted hover:text-white bg-neps-card border border-neps-border px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar
        </button>
      </div>

      {(error || success) && (
        <div
          className={`text-xs rounded-lg px-4 py-3 ${
            error
              ? 'bg-neps-accent/10 border border-neps-accent/30 text-red-200'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="bg-neps-card border border-neps-border rounded-2xl p-6 sm:p-8 shadow-glow-blue">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-neps-input border border-neps-border rounded-xl">
            <div className="relative group">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar actual"
                  className="w-20 h-20 rounded-xl object-cover ring-2 ring-neps-primary/50 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-neps-primary/20 border border-neps-primary/40 flex items-center justify-center text-neps-primary text-2xl font-bold">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-neps-accent hover:bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-col items-center sm:items-start gap-2">
              <span className="text-xs font-semibold text-white">Foto de Perfil</span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAvatarSubmitting}
                className="bg-neps-primary/10 border border-neps-primary/30 hover:bg-neps-primary hover:text-neps-bg text-neps-primary font-semibold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {isAvatarSubmitting ? 'Guardando...' : 'Cargar nuevo avatar'}
              </button>
              <span className="text-[10px] text-neps-muted">Formatos permitidos: JPG, PNG o WebP. Máximo 2MB.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-xs font-semibold text-neps-text">
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                required
                className="w-full bg-neps-input border border-neps-border focus:border-neps-primary focus:ring-1 focus:ring-neps-primary text-xs text-white placeholder-slate-600 rounded-lg px-3.5 py-2.5 outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-xs font-semibold text-neps-text">
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                required
                className="w-full bg-neps-input border border-neps-border focus:border-neps-primary focus:ring-1 focus:ring-neps-primary text-xs text-white placeholder-slate-600 rounded-lg px-3.5 py-2.5 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold text-neps-muted">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-neps-input border border-neps-border text-neps-muted rounded-lg px-3.5 py-2.5 text-xs outline-none cursor-not-allowed"
            />
            <p className="text-[10px] text-neps-muted">El email no puede modificarse.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="countryId" className="block text-xs font-semibold text-neps-text">
              Nacionalidad
            </label>
            <CountrySearchSelect
              label=""
              value={form.countryId}
              onChange={(value) => setForm((prev) => ({ ...prev, countryId: value }))}
              onBlur={() => {}}
            />
            <p className="text-[10px] text-neps-muted">Podés seleccionar tu nacionalidad o dejarla vacía.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neps-border">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-neps-input border border-neps-border hover:bg-neps-card text-neps-muted hover:text-white font-medium text-xs rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-neps-primary hover:bg-sky-300 text-neps-bg font-bold text-xs rounded-lg shadow-glow-blue transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
