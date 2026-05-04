'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type ViewMode = 'split' | 'map' | 'list'

export function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode
  onChange: (v: ViewMode) => void
}) {
  const options: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
    { value: 'split', label: 'Split', icon: <SplitIcon /> },
    { value: 'map',   label: 'Map',   icon: <MapIcon /> },
    { value: 'list',  label: 'List',  icon: <ListIcon /> },
  ]

  return (
    <div className="inline-flex rounded-full border border-brand-border bg-white p-1 gap-0.5 shrink-0">
      {options.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
            view === value
              ? 'bg-brand-green text-white'
              : 'text-brand-navy hover:bg-brand-surface'
          )}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  )
}

function SplitIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M9 3v18M15 3v18" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}
