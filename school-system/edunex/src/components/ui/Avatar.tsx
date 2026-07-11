import { cn } from '@/utils/cn'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ name, className, size = 40 }: { name: string; className?: string; size?: number }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-glow font-display text-sm font-semibold text-white',
        className
      )}
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </div>
  )
}
