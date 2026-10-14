import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authenticationRepository } from '@/features/authentication/api'
import { usePasswordRules } from '@/features/authentication/hooks/use-password-rules'
import type { RequestError } from '@/types/api'
import { AuthSplitLayout, PasswordInput, CountrySearchSelect } from '@/features/authentication/components'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'El nombre es obligatorio.'),
    lastName: z.string().min(1, 'El apellido es obligatorio.'),
    email: z.string().email('Ingresá un email válido.'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .regex(/\d/, 'La contraseña debe contener al menos un número.')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula.')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula.')
      .regex(
        /[^A-Za-z0-9]/,
        'La contraseña debe contener al menos un carácter especial.',
      ),
    confirmPassword: z.string(),
    nationalityId: z.string().optional(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Debés aceptar los términos y condiciones.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const inputClasses =
  'w-full bg-neps-input border border-neps-border focus:border-neps-primary focus:ring-1 focus:ring-neps-primary text-neps-text placeholder-slate-600 rounded-lg px-3.5 py-2 text-xs sm:text-sm outline-none transition-all duration-200'

const labelClasses =
  'block text-xs font-medium text-neps-muted mb-1'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError: setFormError,
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' })
  const passwordRules = usePasswordRules(passwordValue)

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    clearErrors()

    const formData = new FormData()
    formData.append('firstName', data.firstName)
    formData.append('lastName', data.lastName)
    formData.append('email', data.email)
    formData.append('password', data.password)

    if (data.nationalityId) {
      formData.append('nationalityId', data.nationalityId)
    }

    if (selectedAvatar) {
      formData.append('avatar', selectedAvatar)
    }

    try {
      const result = await authenticationRepository.register(formData)

      navigate('/verify-email', {
        state: {
          email: data.email,
          type: 'register',
          expiresInMinutes: result.expiresInMinutes,
        },
      })
    } catch (err) {
      const apiError = err as RequestError

      if (apiError.status === 400 && apiError.payload?.errors) {
        apiError.payload.errors.forEach((fieldError) => {
          const fieldName = fieldError.field.toLowerCase()
          if (fieldName === 'email') {
            setFormError('email', { message: fieldError.message })
          } else if (fieldName === 'password') {
            setFormError('password', { message: fieldError.message })
          } else if (fieldName === 'nationality') {
            setFormError('nationalityId', { message: fieldError.message })
          } else {
            setError(fieldError.message)
          }
        })
      } else if (apiError.status === 409) {
        setError(apiError.message || 'El email ya está registrado.')
      } else if (apiError.status === 404) {
        setError(apiError.message || 'Nacionalidad no encontrada.')
      } else {
        setError(apiError.message || 'Ocurrió un error inesperado. Intentá nuevamente.')
      }
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedAvatar(null)
      setAvatarPreview(null)
    }
  }

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formFieldClasses = 'space-y-3.5'

  return (
    <div className="min-h-screen bg-neps-bg text-neps-text antialiased font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,0.07)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_15%_85%,rgba(56,189,248,0.07)_0%,transparent_70%)] pointer-events-none" />

      <AuthSplitLayout
        heroTitle={
          <>
            Empezá a construir{' '}
            <span className="text-neps-accent">tu biblioteca hoy.</span>
          </>
        }
        heroDescription="Creá tu usuario en segundos y accedé al motor de categorización, listados de seguimiento y estadísticas de lectura."
        statusText="Registro Seguro"
      >
        <div className="md:hidden text-center mb-6">
          <div className="text-2xl font-black tracking-tight text-white">
            &lt;neps<span className="text-neps-accent">/</span>&gt;
          </div>
          <p className="text-[10px] uppercase tracking-widest text-neps-muted font-semibold mt-0.5">
            Comic Library
          </p>
        </div>

        <div className="mb-5 text-center md:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Crear una cuenta
          </h1>
          <p className="text-xs sm:text-sm text-neps-muted mt-1">
            Sumate para gestionar tu colección personal.
          </p>
        </div>

        {error && (
          <div className="bg-neps-accent/10 border border-neps-accent/30 text-red-200 text-xs rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={formFieldClasses} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClasses}>
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                {...register('firstName')}
                placeholder="Juan"
                className={inputClasses}
              />
              {errors.firstName && (
                <p className="text-neps-accent text-[10px] mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className={labelClasses}>
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                {...register('lastName')}
                placeholder="Pérez"
                className={inputClasses}
              />
              {errors.lastName && (
                <p className="text-neps-accent text-[10px] mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClasses}>
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              placeholder="tu@email.com"
              className={inputClasses}
            />
            {errors.email && (
              <p className="text-neps-accent text-[10px] mt-1">{errors.email.message}</p>
            )}
          </div>

          <PasswordInput
            label="Contraseña"
            labelClassName="mb-1"
            showRules
            rules={passwordRules}
            id="password"
            {...register('password')}
            placeholder="••••••••"
            containerClassName="mb-0"
          />
          {errors.password && (
            <p className="text-neps-accent text-[10px] mt-1 -mt-2">{errors.password.message}</p>
          )}

          <PasswordInput
            label="Confirmar contraseña"
            labelClassName="mb-1"
            id="confirmPassword"
            {...register('confirmPassword')}
            placeholder="••••••••"
            containerClassName="mb-0"
          />
          {errors.confirmPassword && (
            <p className="text-neps-accent text-[10px] mt-1 -mt-2">{errors.confirmPassword.message}</p>
          )}

          <div>
            <Controller
              control={control}
              name="nationalityId"
              render={({ field }) => (
                <CountrySearchSelect
                  label="Nacionalidad"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.nationalityId?.message}
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="avatar" className={labelClasses}>
              Avatar (opcional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full bg-neps-input border border-neps-border focus:border-neps-primary focus:ring-1 focus:ring-neps-primary text-neps-text rounded-lg px-3.5 py-2 text-xs sm:text-sm outline-none transition-all duration-200 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neps-accent/20 file:text-neps-accent hover:file:bg-neps-accent/30"
            />
            {avatarPreview && (
              <div className="mt-3 flex justify-center relative inline-block">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-neps-primary/50"
                />
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-neps-accent hover:bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start pt-1">
            <input
              type="checkbox"
              id="terms"
              {...register('terms')}
              className="w-4 h-4 mt-0.5 text-neps-primary bg-neps-input border-neps-border rounded focus:ring-neps-primary"
            />
            <label htmlFor="terms" className="ml-2 text-xs text-neps-muted">
              Acepto los{' '}
              <a href="#" className="text-neps-primary hover:text-neps-accent transition-colors">
                términos y condiciones
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-neps-accent text-[10px] -mt-2">{errors.terms.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-neps-primary hover:bg-sky-400 text-neps-bg font-bold py-2.5 px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-glow-blue active:scale-[0.99] mt-3"
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-xs text-neps-muted mt-5 pt-3 border-t border-neps-border">
          ¿Ya tenés una cuenta?{' '}
          <Link to="/login" className="text-neps-accent font-semibold hover:text-rose-400 transition-colors ml-1">
            Iniciá sesión
          </Link>
        </p>
      </AuthSplitLayout>
    </div>
  )
}
