import { useRef } from 'react'

interface OtpInputsProps {
  otp: string
  onOtpChange: (otp: string) => void
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: string
}

const OTP_LENGTH = 6

const otpInputClasses =
  'w-10 sm:w-12 h-12 sm:h-14 text-center text-xl font-bold bg-neps-input border border-neps-border rounded-lg focus:border-neps-primary focus:ring-1 focus:ring-neps-primary text-white outline-none transition-all duration-200'

export function OtpInputs({ otp, onOtpChange, onPaste, disabled, error }: OtpInputsProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(-1)
    const otpArray = otp.padEnd(OTP_LENGTH, '').split('').slice(0, OTP_LENGTH)

    if (!numericValue) {
      otpArray[index] = ''
      onOtpChange(otpArray.join(''))
      if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      return
    }

    otpArray[index] = numericValue
    onOtpChange(otpArray.join(''))

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      const otpArray = otp.padEnd(OTP_LENGTH, '').split('').slice(0, OTP_LENGTH)
      if (otpArray[index]) {
        otpArray[index] = ''
        onOtpChange(otpArray.join(''))
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center gap-1.5 sm:gap-2" id="otp-inputs">
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            value={otp[index] || ''}
            onChange={(event) => handleOtpChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={onPaste}
            onFocus={() => inputRefs.current[index]?.select()}
            disabled={disabled}
            className={otpInputClasses}
          />
        ))}
      </div>
      {error && <p className="text-neps-accent text-[10px] text-center">{error}</p>}
    </div>
  )
}
