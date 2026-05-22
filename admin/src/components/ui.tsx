import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../lib/utils'

export function Button({
  className,
  variant = 'primary',
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition active:scale-[0.98]',
        variant === 'primary' &&
          'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30',
        variant === 'secondary' &&
          'border border-white/60 bg-white/60 text-foreground shadow-sm hover:bg-white/80 dark:border-white/10 dark:bg-white/10',
        variant === 'ghost' && 'text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10',
        variant === 'danger' && 'bg-rose-500 text-white shadow-lg shadow-rose-500/20',
        className
      )}
      {...props}
    />
  )
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('soft-card p-5', className)} {...props} />
}

export function Badge({
  className,
  tone = 'pink',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'pink' | 'violet' | 'green' | 'amber' | 'gray' | 'red' }) {
  const tones = {
    pink: 'bg-pink-500/12 text-pink-600 dark:text-pink-200',
    violet: 'bg-violet-500/12 text-violet-600 dark:text-violet-200',
    green: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-200',
    amber: 'bg-amber-500/14 text-amber-700 dark:text-amber-200',
    gray: 'bg-zinc-500/10 text-muted-foreground',
    red: 'bg-rose-500/12 text-rose-600 dark:text-rose-200'
  }
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}
      {...props}
    />
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-full border border-white/60 bg-white/60 px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-200/30 dark:border-white/10 dark:bg-white/8',
        className
      )}
      {...props}
    />
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-sm font-semibold text-pink-500">{eyebrow}</p>}
        <h1 className="text-3xl font-black tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function StatusDot({ tone = 'green' }: { tone?: 'green' | 'amber' | 'red' | 'gray' | 'pink' }) {
  const colors = {
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-rose-400',
    gray: 'bg-zinc-400',
    pink: 'bg-pink-400'
  }
  return <span className={cn('inline-block h-2 w-2 rounded-full shadow-[0_0_16px_currentColor]', colors[tone])} />
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/60 bg-white/35 px-6 py-10 text-center dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-black text-foreground">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>}
    </div>
  )
}
