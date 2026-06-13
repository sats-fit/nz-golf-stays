import Link from 'next/link'
import { GuideNav } from '@/components/guide/GuideNav'

export const metadata = {
  title: 'How to Use This Site — NZ Golf Stays',
  description:
    'A simple guide to NZ Golf Stays: how filtering works, what the green and red map markers mean, saving favourites, suggesting edits, signing in, and more.',
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'start', label: 'Getting started' },
  { id: 'filters', label: 'Filtering & search' },
  { id: 'map', label: 'The map colours' },
  { id: 'views', label: 'Switching views' },
  { id: 'cards', label: 'Cards & the pop-up' },
  { id: 'saving', label: 'Saving favourites' },
  { id: 'signin', label: 'Signing in & Google' },
  { id: 'suggest', label: 'Suggesting edits' },
  { id: 'pricing', label: 'Is it free?' },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header + floating section nav */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-brand-border">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 sm:px-6 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-navy transition-colors"
          >
            <ArrowLeftIcon />
            Back to courses
          </Link>
          <span className="text-brand-border">|</span>
          <div className="flex items-center gap-2">
            <img src="/logo-mark-circle.png" alt="NZ Golf Stays" className="w-6 h-6" />
            <span className="font-display font-semibold text-[15px] text-brand-green tracking-tight">
              NZ Golf Stays
            </span>
          </div>
        </div>
        <GuideNav sections={SECTIONS} />
      </div>

      {/* Hero */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-green mb-3">
            How it works
          </p>
          <h1 className="font-display font-semibold text-brand-navy text-3xl sm:text-4xl leading-tight max-w-2xl">
            A quick guide to finding your next golf stay
          </h1>
          <p className="mt-4 text-brand-muted text-base sm:text-lg max-w-2xl leading-relaxed">
            NZ Golf Stays helps you find New Zealand golf courses that welcome motorhome and
            self-contained overnight stays. This page walks through every part of the site on both
            phone and desktop — no account needed to read along.
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        {/* ── Getting started ── */}
        <Section id="start" eyebrow="01" title="Getting started">
          <p>
            When you open the site you land on the home screen: a list of golf courses paired with a
            map of New Zealand. Every course shown is one that allows some form of overnight stay or
            is a day-play club worth knowing about. You can browse freely — you only need an account
            if you want to <strong>save favourites</strong> or <strong>suggest changes</strong>.
          </p>
          <Figure
            src="/guide/desktop-home.webp"
            alt="The NZ Golf Stays home screen on desktop, showing a list of courses on the left and a map of New Zealand on the right."
            caption="Desktop home — the course list sits beside the live map."
          />
          <Figure
            src="/guide/mobile-home.webp"
            alt="The NZ Golf Stays home screen on a phone, showing the map with green flag markers and a course count at the bottom."
            phone
            caption="On a phone the map fills the screen, with courses in a sheet you can pull up from the bottom."
          />
        </Section>

        {/* ── Filters ── */}
        <Section id="filters" eyebrow="02" title="Filtering & search">
          <p>
            Filters are how you narrow hundreds of courses down to the handful that suit your trip.
            On desktop they run along the top of the screen as a row of chips. On mobile, tap the{' '}
            <SlidersInline /> <strong>sliders icon</strong> in the top-right to open the full filter
            sheet.
          </p>
          <p>Here is what each control does:</p>
          <ul className="space-y-3">
            <FilterRow label="Search">
              Type a course or town name to jump straight to it.
            </FilterRow>
            <FilterRow label="Stays only / All courses">
              The toggle at the top. <strong>Stays only</strong> shows just courses that allow
              overnight stays. Switch to <strong>All courses</strong> to also see day-play clubs.
            </FilterRow>
            <FilterRow label="Region">
              Limit results to one part of the country — Canterbury, Otago, Northland and so on.
            </FilterRow>
            <FilterRow label="Stay type">
              Filter by how the stay works: free with green fees, pay to stay (no play), pay to stay
              &amp; play, or donation accepted.
            </FilterRow>
            <FilterRow label="Powered">
              Show only courses that offer a powered site for your motorhome.
            </FilterRow>
            <FilterRow label="Dogs OK">
              Show only courses that welcome dogs.
            </FilterRow>
            <FilterRow label="Saved">
              Show only the courses you&apos;ve saved (needs a free account — see below).
            </FilterRow>
          </ul>
          <Callout>
            Your filters live in the web address, so you can bookmark or share a filtered view — for
            example &ldquo;powered sites in Otago&rdquo; — and it opens exactly the same for whoever
            you send it to.
          </Callout>
          <Figure
            src="/guide/mobile-filters.webp"
            alt="The mobile filter sheet showing Stays only / All courses toggle, region pills, and stay type checkboxes."
            phone
            caption="The mobile filter sheet. Tap Show courses to apply, or Clear all to reset."
          />
        </Section>

        {/* ── Map colours ── */}
        <Section id="map" eyebrow="03" title="What the map colours mean">
          <p>
            Each course is a little flag pin on the map. The colour tells you, at a glance, whether
            you can stay the night:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 not-prose my-6">
            <MarkerCard color="#2D5F3F" title="Green flag">
              Welcomes overnight stays. This is a course where you can park up for the night.
            </MarkerCard>
            <MarkerCard color="#C73E1D" title="Red flag">
              Day play only — no overnight stays here. Shown when you switch to{' '}
              <strong>All courses</strong>.
            </MarkerCard>
          </div>

          <p>
            Tap or click any pin to open that course&apos;s details. When you hover a course in the
            list, its pin grows and darkens so you can spot it on the map.
          </p>
          <Figure
            src="/guide/desktop-map.webp"
            alt="A map of New Zealand covered in green and red flag markers showing golf courses."
            caption="All courses shown at once — green pins welcome stays, red pins are day-play only."
          />
        </Section>

        {/* ── Views ── */}
        <Section id="views" eyebrow="04" title="Switching views">
          <p>On desktop, the buttons in the top-right let you choose how much map you want:</p>
          <ul className="space-y-3">
            <FilterRow label="Split">List and map side by side — the default.</FilterRow>
            <FilterRow label="Map">The map fills the screen.</FilterRow>
            <FilterRow label="List">A full-width list of course cards, no map.</FilterRow>
          </ul>
          <p>
            On a phone the map is front and centre, with your courses in a sheet that slides up from
            the bottom — drag it up for the full list, or down to see more of the map.
          </p>
        </Section>

        {/* ── Cards & pop-up ── */}
        <Section id="cards" eyebrow="05" title="Course cards & the pop-up">
          <p>
            Each course appears as a <strong>card</strong> with a photo, name, region and rating.
            Click or tap a card (or its map pin) and a <strong>pop-up</strong> opens with the full
            details: stay options, amenities, address, phone and website.
          </p>
          <Callout tone="green">
            <strong>The details in the pop-up are clickable links.</strong> The address opens the
            course in <strong>Google Maps</strong> for directions, the website link opens the
            club&apos;s own site in a new tab, and the phone number is tap-to-call on a phone.
          </Callout>
          <Figure
            src="/guide/desktop-card-popup.webp"
            alt="A course detail pop-up showing the photo, stay options, a clickable address, phone number and website link."
            caption="The pop-up. The green address and website are links — tap the address for directions, the website to visit the club."
          />
        </Section>

        {/* ── Saving ── */}
        <Section id="saving" eyebrow="06" title="Saving favourites (the heart)">
          <p>
            See the little <HeartInline /> <strong>heart icon</strong> on each card and in the
            top-left of every pop-up? Tap it to save a course to your personal wishlist. The heart
            fills in <span className="text-red-500 font-semibold">red</span> once a course is saved.
          </p>
          <ul className="space-y-3">
            <FilterRow label="Find them again">
              Use the <strong>Saved</strong> filter at any time to show only your saved courses.
            </FilterRow>
            <FilterRow label="Your wishlist">
              Open <strong>My Wishlist</strong> from the menu to see everything you&apos;ve saved in
              one place.
            </FilterRow>
          </ul>
          <Callout>
            Saving needs a free account so your list follows you across devices. If you tap a heart
            while signed out, we&apos;ll pop up a quick sign-in first.
          </Callout>
        </Section>

        {/* ── Sign in & Google ── */}
        <Section id="signin" eyebrow="07" title="Signing in & that long Google message">
          <p>
            Open the menu (the <HamburgerInline /> icon, top-right) and choose{' '}
            <strong>Sign in / Sign up</strong>. You can sign up with an email and password, or use{' '}
            <strong>Continue with Google</strong> for one tap.
          </p>
          <Figure
            src="/guide/mobile-signin.webp"
            alt="The sign-in pop-up with a Continue with Google button and email and password fields."
            phone
            caption="Sign in with Google, or create an account with your email."
          />

          <figure className="not-prose my-6">
            <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface max-w-[380px] mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/guide/google-supabase-consent.webp"
                alt="Google's sign-in screen reading 'Sign in to continue to mhyphpgmefjjwircnkur.supabase.co' — an example of the long web address Google shows."
                loading="lazy"
                className="w-full h-auto block"
              />
            </div>
            <figcaption className="mt-2.5 text-center text-sm text-brand-muted">
              Google says &ldquo;to continue to&rdquo; followed by a long{' '}
              <code className="text-brand-navy">.supabase.co</code> address. It&apos;s normal and
              safe; here&apos;s why. 👇
            </figcaption>
          </figure>

          <div className="not-prose rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6 my-6">
            <h3 className="font-display font-semibold text-brand-navy text-lg mb-2 flex items-center gap-2">
              <ShieldInline />
              &ldquo;Why does Google mention a long web address?&rdquo;
            </h3>
            <div className="space-y-3 text-brand-muted text-[15px] leading-relaxed">
              <p>
                When you choose <strong>Continue with Google</strong>, Google shows a screen that
                says something like &ldquo;<em>Choose an account to continue to</em>&rdquo; followed
                by a long web address ending in <code className="text-brand-navy">.supabase.co</code>{' '}
                (a string of random-looking letters).
              </p>
              <p>
                <strong>That&apos;s completely normal and safe.</strong> Supabase is the trusted
                service that securely handles accounts and logins for NZ Golf Stays, and that long
                address is simply its technical name for our login. It isn&apos;t a virus, a scam, or
                anything to worry about.
              </p>
              <p>
                Your Google password is <strong>never</strong> shared with us — Google only confirms
                who you are and passes along your name and email so we can create your account. You
                can revoke that access from your Google account settings at any time.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Suggest edits ── */}
        <Section id="suggest" eyebrow="08" title="Suggesting edits & adding courses">
          <p>
            This site is community-driven, so the details get better when locals and travellers chip
            in. There are two ways to help: <strong>fix an existing listing</strong>, or{' '}
            <strong>add a course we don&apos;t have yet</strong>.
          </p>
          <ul className="space-y-3">
            <FilterRow label="Spotted something out of date?">
              Open the course pop-up and tap <strong>Suggest edit</strong>. A short form opens,
              pre-filled with the current details — describe what changed and correct any fields.
            </FilterRow>
            <FilterRow label="Know a course we&apos;re missing?">
              Open the menu (the <HamburgerInline /> icon, top-right) and choose{' '}
              <strong>Add a course</strong> — or go straight to the{' '}
              <Link href="/submit" className="text-brand-green font-semibold hover:underline">
                Add a course
              </Link>{' '}
              form. Fill in what you know (even just a name and town is a great start) — you
              don&apos;t need an account.
            </FilterRow>
            <FilterRow label="We do the rest">
              Every suggestion and new course goes to our team for a quick check. For new courses
              we&apos;ll find it on Google Maps, add the location and photos, then publish it — so
              listings stay accurate for everyone.
            </FilterRow>
          </ul>
          <Figure
            src="/guide/desktop-suggest-edit.webp"
            alt="The Suggest an edit form, pre-filled with a course's details and a field describing what changed."
            caption="The Suggest an edit form. Tell us what changed and we&apos;ll review it before it goes live."
          />
        </Section>

        {/* ── Pricing ── */}
        <Section id="pricing" eyebrow="09" title="Is it free?">
          <p>
            <strong>Yes — NZ Golf Stays is free to use right now.</strong> Browse, filter, save
            favourites and suggest edits at no cost.
          </p>
          <p>
            Down the track we may introduce a small annual subscription — think roughly{' '}
            <strong>$5–$10 a year</strong>. That would go straight toward the real running costs
            (maps, hosting and keeping the data fresh) and, hopefully, toward building proper{' '}
            <strong>Android and iOS apps</strong> so the site is even easier to use on the road.
            Nothing changes without plenty of notice — for now, enjoy it on the house. ⛳
          </p>
        </Section>

        {/* CTA */}
        <div className="not-prose pt-4">
          <div className="rounded-2xl bg-brand-green text-white p-6 sm:p-8 text-center">
            <h2 className="font-display font-semibold text-xl sm:text-2xl mb-2">
              Ready to find your next stay?
            </h2>
            <p className="text-white/80 mb-5 text-sm sm:text-base">
              Jump back to the map and start exploring courses near your route.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-green font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              Browse courses
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-display text-brand-sand text-2xl font-semibold select-none">
          {eyebrow}
        </span>
        <h2 className="font-display font-semibold text-brand-navy text-2xl sm:text-[28px] leading-tight">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-brand-muted text-[15px] sm:text-base leading-relaxed [&_strong]:text-brand-navy [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  )
}

function Figure({
  src,
  alt,
  caption,
  phone = false,
}: {
  src: string
  alt: string
  caption: string
  phone?: boolean
}) {
  return (
    <figure className="not-prose my-6">
      <div
        className={`overflow-hidden rounded-2xl border border-brand-border bg-brand-surface ${
          phone ? 'max-w-[300px] mx-auto' : ''
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="w-full h-auto block" />
      </div>
      <figcaption className="mt-2.5 text-center text-sm text-brand-muted">{caption}</figcaption>
    </figure>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col sm:flex-row sm:gap-4">
      <span className="shrink-0 sm:w-44 font-semibold text-brand-navy">{label}</span>
      <span>{children}</span>
    </li>
  )
}

function MarkerCard({
  color,
  title,
  children,
}: {
  color: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-4 flex flex-col items-start gap-2.5">
      <FlagIcon color={color} />
      <h3 className="font-semibold text-brand-navy">{title}</h3>
      <p className="text-sm text-brand-muted leading-relaxed">{children}</p>
    </div>
  )
}

function Callout({
  children,
  tone = 'sand',
}: {
  children: React.ReactNode
  tone?: 'sand' | 'green'
}) {
  const styles =
    tone === 'green'
      ? 'border-brand-green/30 bg-brand-green/5'
      : 'border-brand-sand bg-brand-sand/40'
  return (
    <div className={`not-prose rounded-2xl border ${styles} p-4 sm:p-5 my-2`}>
      <p className="text-[15px] leading-relaxed text-brand-navy [&_strong]:font-semibold">
        {children}
      </p>
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function FlagIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="34" viewBox="0 0 22 30" aria-hidden>
      <line x1="7" y1="3" x2="7" y2="27" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
      <polygon points="7,3 20,9 7,15" fill={color} />
      <circle cx="7" cy="27" r="3.5" fill="#1f2937" />
    </svg>
  )
}

function HeartInline() {
  return (
    <svg
      className="inline-block align-[-2px]"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="#ef4444"
      stroke="#ef4444"
      strokeWidth="2.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )
}

function SlidersInline() {
  return (
    <svg
      className="inline-block align-[-3px]"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1D3557"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}

function HamburgerInline() {
  return (
    <svg
      className="inline-block align-[-2px]"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1D3557"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function ShieldInline() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2D5F3F"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
