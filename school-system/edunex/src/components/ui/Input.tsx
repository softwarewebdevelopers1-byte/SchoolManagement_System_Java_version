import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'h-11 w-full rounded-lg border border-ink-900/15 bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-600/50 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/15 dark:bg-ink-800 dark:text-white',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
