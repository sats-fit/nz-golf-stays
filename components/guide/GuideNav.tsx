'use client'

import { useEffect, useRef, useState } from 'react'

type SectionLink = { id: string; label: string }

export function GuideNav({ sections }: { sections: SectionLink[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '')
  const navRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Scroll-spy: mark the section currently under the sticky nav as active.
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-110px 0px -65% 0px', threshold: 0 },
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  // Keep the active chip in view within the horizontally-scrolling bar (mobile).
  useEffect(() => {
    const chip = chipRefs.current[active]
    if (chip) chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [active])

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    setActive(id)
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <div ref={navRef} className="border-t border-brand-border overflow-x-auto no-scrollbar">
      <nav className="max-w-5xl mx-auto flex gap-2 px-4 sm:px-6 py-2.5 w-max sm:w-auto">
        {sections.map(s => {
          const isActive = active === s.id
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={e => handleClick(e, s.id)}
              ref={el => { chipRefs.current[s.id] = el }}
              aria-current={isActive ? 'true' : undefined}
              className={`shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-green border-brand-green text-white'
                  : 'bg-white border-brand-border text-brand-navy hover:border-brand-green hover:text-brand-green'
              }`}
            >
              {s.label}
            </a>
          )
        })}
      </nav>
    </div>
  )
}
