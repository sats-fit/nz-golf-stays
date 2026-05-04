/* global React, Icon, COURSES, REGIONS, applyFilters, initialFilters, FilterChecklist, FilterChip, CourseCard, NZMap, StaysToggleV3, Avatar */
const { useState } = React;

// ═════════════════════════════════════════════════════════════
// LOGO — fern + kombi van mark (real artwork)
// Two source files: assets/logo-mark.png (transparent silhouette)
// and assets/logo-circle.png (cream silhouette inside a green circle).
// ═════════════════════════════════════════════════════════════

// Standalone mark — green silhouette on transparent. Use on light bg.
const LogoMarkSilhouette = ({ size = 32 }) => (
  <img src="assets/logo-mark.png" alt="NZ Golf Stays" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }}/>
);

// Circle stamp — cream on green disc. Use as avatar/badge or on warm/dark bg.
const LogoMarkCircle = ({ size = 32 }) => (
  <img src="assets/logo-circle.png" alt="NZ Golf Stays" width={size} height={size} style={{ display: 'block', objectFit: 'contain', borderRadius: '50%' }}/>
);

// Inverse circle — used when sitting on the primary green; we just show the silhouette in cream
// (no separate file needed — this is achieved by the silhouette in cream, but we don't have a cream
// version separately — fall back to the green-on-cream circle stamp).
const LogoMarkSquareTile = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    <img src="assets/logo-circle.png" alt="NZ Golf Stays" width={size * 0.96} height={size * 0.96} style={{ display: 'block', objectFit: 'contain' }}/>
  </div>
);

// Wordmark renderings
const Wordmark = ({ size = 16, mode = 'inline', color = 'var(--primary)' }) => {
  const display = { fontFamily: 'var(--font-display)', fontWeight: 600, color, letterSpacing: '-0.01em', lineHeight: 1 };
  if (mode === 'stacked') {
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, lineHeight: 1 }}>
        <span style={{ ...display, fontSize: size }}>NZ Golf</span>
        <span style={{ ...display, fontSize: size, color: 'var(--secondary,#1D3557)', fontWeight: 500, fontStyle: 'italic' }}>Stays</span>
      </span>
    );
  }
  if (mode === 'two-tone') {
    return (
      <span style={{ ...display, fontSize: size }}>
        NZ Golf <span style={{ color: 'var(--secondary, #1D3557)', fontWeight: 700 }}>Stays</span>
      </span>
    );
  }
  if (mode === 'small-caps') {
    return <span style={{ ...display, fontSize: size, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>NZ Golf Stays</span>;
  }
  return <span style={{ ...display, fontSize: size }}>NZ Golf Stays</span>;
};

// Lockup variants — pair the real mark with different wordmark treatments / arrangements.
const LogoLockup = ({ variant = 'L1', size = 'md', dark = false, vertical = false }) => {
  const sz = size === 'sm' ? 28 : size === 'lg' ? 56 : 40;
  const fs = size === 'sm' ? 14 : size === 'lg' ? 24 : 17;
  const color = dark ? '#fff' : 'var(--primary)';

  // L1 — silhouette mark + plain inline wordmark (clean, default)
  if (variant === 'L1') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <LogoMarkSilhouette size={sz}/>
        <Wordmark size={fs} mode="inline" color={color}/>
      </div>
    );
  }
  // L2 — circle stamp + inline wordmark (more "brand seal" feeling)
  if (variant === 'L2') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <LogoMarkCircle size={sz}/>
        <Wordmark size={fs} mode="inline" color={color}/>
      </div>
    );
  }
  // L3 — silhouette mark + stacked two-line wordmark (editorial / serif feel)
  if (variant === 'L3') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <LogoMarkSilhouette size={sz}/>
        <Wordmark size={fs} mode="stacked" color={color}/>
      </div>
    );
  }
  // L4 — vertical stack: circle stamp above wordmark (formal lockup, footers / splash)
  if (vertical || variant === 'L4') {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <LogoMarkCircle size={sz + 6}/>
        <Wordmark size={fs} mode="small-caps" color={color}/>
      </div>
    );
  }
  return null;
};

// Mobile-specific compact lockups
const LogoMobile = ({ variant = 'M1', dark = false }) => {
  const color = dark ? '#fff' : 'var(--primary)';
  if (variant === 'M1') { // circle stamp only (most space-efficient, also looks like an app icon)
    return <LogoMarkCircle size={32}/>;
  }
  if (variant === 'M2') { // silhouette + wordmark inline
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <LogoMarkSilhouette size={28}/>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color, letterSpacing: '-0.01em' }}>NZ Golf Stays</span>
      </div>
    );
  }
  if (variant === 'M3') { // circle stamp + tracked uppercase below
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <LogoMarkCircle size={28}/>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9, color, letterSpacing: '0.1em' }}>NZ GOLF STAYS</span>
      </div>
    );
  }
  // M4 — silhouette mark only
  return <LogoMarkSilhouette size={30}/>;
};

// ═════════════════════════════════════════════════════════════
// HERO TOGGLE LAYOUT VARIANTS
// ═════════════════════════════════════════════════════════════
// All 4 are the "hero switch + count" idea but laid out differently.

// H1 — Original pill with switch + count (refined)
const HeroToggleH1 = ({ value, onChange, staysCount = 142, totalCount = 391 }) => {
  const isStays = value === 'stays-only';
  return (
    <button onClick={() => onChange(isStays ? 'all' : 'stays-only')} style={{
      display: 'inline-flex', alignItems: 'center', gap: 14,
      background: isStays ? 'var(--primary)' : '#fff',
      color: isStays ? '#fff' : 'var(--text)',
      border: `1px solid ${isStays ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 9999, padding: '8px 16px 8px 8px',
      cursor: 'pointer', font: 'inherit', boxShadow: 'var(--shadow-sm)', transition: 'all 200ms var(--ease-standard)',
    }}>
      <span style={{ width: 44, height: 26, borderRadius: 9999, background: isStays ? 'rgba(255,255,255,0.25)' : 'var(--surface-alt)', border: `1px solid ${isStays ? 'rgba(255,255,255,0.35)' : 'var(--border)'}`, position: 'relative', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, left: isStays ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 200ms var(--ease-standard)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={isStays ? 'van' : 'flag'} size={11} color="var(--primary)"/>
        </span>
      </span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{isStays ? 'Stays only' : 'All courses'}</span>
      <span style={{ fontSize: 12, fontWeight: 500, background: isStays ? 'rgba(255,255,255,0.18)' : 'var(--surface-alt)', color: isStays ? '#fff' : 'var(--text-muted)', padding: '3px 8px', borderRadius: 9999 }}>
        {isStays ? staysCount : totalCount}
      </span>
    </button>
  );
};

// H2 — Stacked vertical: count above, switch row below; bigger feel
const HeroToggleH2 = ({ value, onChange, staysCount = 142, totalCount = 391 }) => {
  const isStays = value === 'stays-only';
  return (
    <button onClick={() => onChange(isStays ? 'all' : 'stays-only')} style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
      background: isStays ? 'var(--primary)' : '#fff',
      color: isStays ? '#fff' : 'var(--text)',
      border: `1px solid ${isStays ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 14, padding: '10px 16px',
      cursor: 'pointer', font: 'inherit', boxShadow: 'var(--shadow-sm)', minWidth: 220, textAlign: 'left',
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, lineHeight: 1 }}>
          {isStays ? staysCount : totalCount}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.85 }}>
          {isStays ? 'overnight stays' : 'courses total'}
        </span>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, opacity: 0.9 }}>
        <span style={{ width: 30, height: 18, borderRadius: 9999, background: isStays ? 'rgba(255,255,255,0.25)' : 'var(--surface-alt)', border: `1px solid ${isStays ? 'rgba(255,255,255,0.35)' : 'var(--border)'}`, position: 'relative' }}>
          <span style={{ position: 'absolute', top: 1, left: isStays ? 13 : 1, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 200ms' }}/>
        </span>
        Stays only · tap to flip
      </div>
    </button>
  );
};

// H3 — Two-button segmented "tabs" with count badges
const HeroToggleH3 = ({ value, onChange, staysCount = 142, totalCount = 391 }) => {
  const isStays = value === 'stays-only';
  const Btn = ({ active, onClick, icon, label, count }) => (
    <button onClick={onClick} style={{
      flex: 1, background: active ? 'var(--primary)' : 'transparent',
      color: active ? '#fff' : 'var(--text)',
      border: 0, borderRadius: 9999, padding: '8px 16px', cursor: 'pointer',
      font: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center',
      transition: 'all 180ms var(--ease-standard)',
      boxShadow: active ? 'var(--shadow-sm)' : 'none',
    }}>
      <Icon name={icon} size={14}/>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{
        fontSize: 11, fontWeight: 600,
        background: active ? 'rgba(255,255,255,0.22)' : 'var(--surface-alt)',
        color: active ? '#fff' : 'var(--text-muted)',
        padding: '1px 7px', borderRadius: 9999,
      }}>{count}</span>
    </button>
  );
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 9999, padding: 4, boxShadow: 'var(--shadow-sm)',
    }}>
      <Btn active={isStays} onClick={() => onChange('stays-only')} icon="van" label="Stays" count={staysCount}/>
      <Btn active={!isStays} onClick={() => onChange('all')} icon="flag" label="All courses" count={totalCount}/>
    </div>
  );
};

// H4 — Single bold pill, count is the headline
const HeroToggleH4 = ({ value, onChange, staysCount = 142, totalCount = 391 }) => {
  const isStays = value === 'stays-only';
  return (
    <button onClick={() => onChange(isStays ? 'all' : 'stays-only')} style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      background: isStays ? 'var(--primary)' : 'var(--neutral-warm,#F1ECE2)',
      color: isStays ? '#fff' : 'var(--text)',
      border: `1px solid ${isStays ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 9999, padding: '6px 18px 6px 6px',
      cursor: 'pointer', font: 'inherit', boxShadow: 'var(--shadow-sm)',
    }}>
      <span style={{
        width: 38, height: 38, borderRadius: '50%',
        background: isStays ? '#fff' : 'var(--primary)',
        color: isStays ? 'var(--primary)' : '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={isStays ? 'van' : 'flag'} size={18}/>
      </span>
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85 }}>
          {isStays ? 'Stays only' : 'All courses'}
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, lineHeight: 1.1 }}>
          {isStays ? `${staysCount} overnight spots` : `${totalCount} courses in NZ`}
        </span>
      </span>
      <span style={{
        fontSize: 11, opacity: 0.7, fontWeight: 500, marginLeft: 4,
        borderLeft: `1px solid ${isStays ? 'rgba(255,255,255,0.3)' : 'var(--border)'}`,
        paddingLeft: 12,
      }}>flip ↺</span>
    </button>
  );
};

// ═════════════════════════════════════════════════════════════
// DESKTOP B BUTTON-CLUSTER VARIANTS
// ═════════════════════════════════════════════════════════════
// Right-side header cluster + view switcher placement.
// All 4 share the same Airbnb-style header skeleton.

const DesktopBHeader = ({ children, logoVariant = 'L1', heroToggleVariant = 'H1', stayMode, setStayMode }) => (
  <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px' }}>
      <LogoLockup variant={logoVariant}/>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {/* hero toggle in centered slot — placeholder ; real slot used below */}
      </div>
      {children}
    </div>
  </header>
);

// Shared body that simulates the list + chips below the header
const DesktopBBody = ({ stayMode, view = 'list', filters, setFilters, selectedId, onMapSelect }) => {
  const [saved, setSaved] = useState(new Set(['akarana']));
  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = applyFilters(COURSES, filters, stayMode);

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="eyebrow" style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {stayMode === 'stays-only' ? `${filtered.length} stays` : `${filtered.length} courses`} · {filters.region}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, lineHeight: 1.2, margin: '4px 0 0' }}>
            {stayMode === 'stays-only' ? 'Park up overnight' : 'Every welcoming course in NZ'}
          </h2>
        </div>
      </div>
      {view === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {filtered.slice(0, 8).map(c => <CourseCard key={c.id} c={c} saved={saved.has(c.id)} onSave={onSave} layout="grid"/>)}
        </div>
      )}
      {view === 'split' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, height: 540 }}>
          <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, alignContent: 'start' }}>
            {filtered.slice(0, 6).map(c => <CourseCard key={c.id} c={c} saved={saved.has(c.id)} onSave={onSave} layout="compact"/>)}
          </div>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <NZMap courses={filtered} width="100%" height="100%" stayMode={stayMode} selectedId={selectedId} onSelect={onMapSelect}/>
          </div>
        </div>
      )}
      {view === 'map' && (
        <div style={{ position: 'relative', height: 540, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <NZMap courses={filtered} width="100%" height="100%" stayMode={stayMode} selectedId={selectedId} onSelect={onMapSelect}/>
        </div>
      )}
      {view === 'saved' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {COURSES.filter(c => saved.has(c.id)).map(c => <CourseCard key={c.id} c={c} saved={true} onSave={onSave} layout="grid"/>)}
          {saved.size === 0 && <div style={{ padding: 40, color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center' }}>No saved courses yet — tap the heart on any card to save.</div>}
        </div>
      )}
    </main>
  );
};

const FilterRow = ({ filters, setFilters, rightCluster }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 32px 16px', overflowX: 'auto' }}>
    <FilterChip icon="map-pin" hasMenu>{filters.region}</FilterChip>
    <FilterChip icon="sliders" hasMenu>Stay type</FilterChip>
    <FilterChip icon="plug" active={filters.amenities.includes('power')} onClick={() => setFilters(f => ({ ...f, amenities: f.amenities.includes('power') ? f.amenities.filter(x => x !== 'power') : [...f.amenities, 'power'] }))}>Powered</FilterChip>
    <FilterChip icon="paw" active={filters.amenities.includes('dogs')} onClick={() => setFilters(f => ({ ...f, amenities: f.amenities.includes('dogs') ? f.amenities.filter(x => x !== 'dogs') : [...f.amenities, 'dogs'] }))}>Dogs OK</FilterChip>
    <FilterChip icon="dollar">Free only</FilterChip>
    <div style={{ flex: 1 }}/>
    {rightCluster}
  </div>
);

// Right-cluster style 1 — Saved-link + segmented view switcher (current)
const ClusterSegmented = ({ view, setView, savedCount }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
    <button onClick={() => setView('saved')} style={{
      background: view === 'saved' ? 'var(--surface-alt)' : 'none', border: 0, font: 'inherit',
      fontSize: 13, fontWeight: 500, color: view === 'saved' ? 'var(--primary)' : 'var(--text)',
      cursor: 'pointer', padding: '6px 10px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      <Icon name={view === 'saved' ? 'heart-fill' : 'heart'} size={14} fill={view === 'saved' ? 'var(--primary)' : 'none'}/>
      Saved · {savedCount}
    </button>
    <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
      {['list','split','map'].map(v => (
        <button key={v} onClick={() => setView(v)} style={{
          background: view === v ? 'var(--surface-alt)' : 'transparent',
          color: view === v ? 'var(--text)' : 'var(--text-muted)',
          border: 0, font: 'inherit', fontSize: 13, fontWeight: view === v ? 600 : 500, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6, textTransform: 'capitalize',
        }}>
          <Icon name={v} size={14}/>{v}
        </button>
      ))}
    </div>
  </div>
);

// Right-cluster style 2 — Floating round icon-buttons (saved is heart, view is a single dropdown)
const ClusterIconButtons = ({ view, setView, savedCount }) => {
  const [open, setOpen] = useState(false);
  const labelOf = (v) => v === 'list' ? 'List view' : v === 'split' ? 'Split view' : v === 'map' ? 'Map view' : 'Saved';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative' }}>
      <button onClick={() => setView('saved')} title="Saved" style={{
        width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)',
        background: view === 'saved' ? 'var(--primary)' : '#fff',
        color: view === 'saved' ? '#fff' : 'var(--text)', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <Icon name="heart" size={15} fill={view === 'saved' ? '#fff' : 'none'}/>
        {savedCount > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'var(--accent-warm,#C46A3F)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{savedCount}</span>
        )}
      </button>
      <button onClick={() => setOpen(o => !o)} style={{
        height: 36, padding: '0 14px', borderRadius: 9999, border: '1px solid var(--border)',
        background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, font: 'inherit', fontSize: 13, fontWeight: 500,
      }}>
        <Icon name={view === 'list' || view === 'saved' ? 'list' : view} size={14}/>
        {labelOf(view === 'saved' ? 'list' : view)}
        <Icon name="chevron" size={12}/>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 44, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-md)', padding: 4, minWidth: 160, zIndex: 5 }}>
          {['list','split','map'].map(v => (
            <button key={v} onClick={() => { setView(v); setOpen(false); }} style={{
              width: '100%', textAlign: 'left', background: view === v ? 'var(--surface-alt)' : 'transparent',
              border: 0, font: 'inherit', fontSize: 13, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              fontWeight: view === v ? 600 : 500, color: 'var(--text)',
            }}><Icon name={v} size={14}/><span style={{ textTransform: 'capitalize' }}>{v} view</span></button>
          ))}
        </div>
      )}
    </div>
  );
};

// Right-cluster style 3 — "Vertical tabs" running down the right edge of the body
const ClusterRailRight = ({ view, setView, savedCount }) => {
  const items = [
    { v: 'list', icon: 'list', label: 'List' },
    { v: 'split', icon: 'split', label: 'Split' },
    { v: 'map', icon: 'map', label: 'Map' },
    { v: 'saved', icon: 'heart', label: `Saved · ${savedCount}` },
  ];
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 4, boxShadow: 'var(--shadow-sm)' }}>
      {items.map(it => (
        <button key={it.v} onClick={() => setView(it.v)} style={{
          background: view === it.v ? 'var(--primary)' : 'transparent',
          color: view === it.v ? '#fff' : 'var(--text)',
          border: 0, font: 'inherit', fontSize: 12, fontWeight: view === it.v ? 600 : 500,
          padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', minWidth: 120,
        }}>
          <Icon name={it.icon} size={14} fill={view === it.v && it.v === 'saved' ? '#fff' : 'none'}/>{it.label}
        </button>
      ))}
    </div>
  );
};

// Right-cluster style 4 — combined "view" pill button (icons only) + saved heart
const ClusterMinimal = ({ view, setView, savedCount }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <div style={{ display: 'inline-flex', background: 'var(--surface-alt)', borderRadius: 9999, padding: 3 }}>
      {[
        { v: 'list', icon: 'list' },
        { v: 'split', icon: 'split' },
        { v: 'map', icon: 'map' },
      ].map(o => (
        <button key={o.v} onClick={() => setView(o.v)} title={o.v} style={{
          width: 32, height: 32, borderRadius: '50%',
          background: view === o.v ? '#fff' : 'transparent',
          color: view === o.v ? 'var(--primary)' : 'var(--text-muted)',
          border: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: view === o.v ? 'var(--shadow-sm)' : 'none', transition: 'all 160ms',
        }}>
          <Icon name={o.icon} size={14}/>
        </button>
      ))}
    </div>
    <button onClick={() => setView('saved')} style={{
      height: 36, padding: '0 14px', borderRadius: 9999, border: '1px solid var(--border)', background: view === 'saved' ? 'var(--primary)' : '#fff',
      color: view === 'saved' ? '#fff' : 'var(--text)', cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      <Icon name={view === 'saved' ? 'heart-fill' : 'heart'} size={14} fill={view === 'saved' ? '#fff' : 'none'}/>
      {savedCount}
    </button>
  </div>
);

// Compose: full Desktop B layout, parameterized by hero-toggle + cluster + logo + view-default
const DesktopBRefined = ({ width = 1200, height = 760, heroToggle = 'H1', cluster = 'C1', logoVariant = 'L1', defaultView = 'split' }) => {
  const [filters, setFilters] = useState(initialFilters());
  const [stayMode, setStayMode] = useState('stays-only');
  const [view, setView] = useState(defaultView);
  const [saved, setSaved] = useState(new Set(['akarana','muriwai','matarangi']));
  const [selectedId, setSelectedId] = useState(null);
  const [popupExpanded, setPopupExpanded] = useState(false);

  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const onMapSelect = (id) => { setSelectedId(id); setPopupExpanded(false); };
  const onClosePopup = () => { setSelectedId(null); setPopupExpanded(false); };

  const HeroToggle = heroToggle === 'H2' ? HeroToggleH2 : heroToggle === 'H3' ? HeroToggleH3 : heroToggle === 'H4' ? HeroToggleH4 : HeroToggleH1;
  const Cluster = cluster === 'C2' ? ClusterIconButtons : cluster === 'C3' ? ClusterRailRight : cluster === 'C4' ? ClusterMinimal : ClusterSegmented;
  const filtered = applyFilters(COURSES, filters, stayMode);
  const staysCount = COURSES.filter(c => c.stayType).length;
  const selectedCourse = COURSES.find(c => c.id === selectedId);
  const showPopup = selectedId != null && (view === 'split' || view === 'map');

  return (
    <div style={{ width, height, background: 'var(--surface-alt)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', color: 'var(--text)', overflow: 'hidden', position: 'relative' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '14px 32px', gap: 24 }}>
          <LogoLockup variant={logoVariant}/>
          <HeroToggle value={stayMode} onChange={setStayMode} staysCount={staysCount} totalCount={COURSES.length}/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14 }}>
            <button style={{ background: 'none', border: 0, font: 'inherit', fontSize: 13, fontWeight: 500, color: 'var(--text)', cursor: 'pointer' }}>List your course</button>
            <Avatar/>
          </div>
        </div>
        <FilterRow filters={filters} setFilters={setFilters} rightCluster={cluster !== 'C3' ? <Cluster view={view} setView={setView} savedCount={saved.size}/> : null}/>
      </header>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <DesktopBBody stayMode={stayMode} view={view} filters={filters} setFilters={setFilters} selectedId={selectedId} onMapSelect={onMapSelect}/>
        </div>
        {cluster === 'C3' && (
          <div style={{ padding: '24px 24px 0 0' }}>
            <Cluster view={view} setView={setView} savedCount={saved.size}/>
          </div>
        )}
      </div>

      {/* Map popup overlay — triggered by clicking a pin in split or map view */}
      {showPopup && selectedCourse && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(29,53,87,0.15)',
        }} onClick={onClosePopup}>
          <div onClick={e => e.stopPropagation()}>
            {popupExpanded
              ? <window.MapPopupExpanded c={selectedCourse} saved={saved.has(selectedCourse.id)} onSave={onSave} onClose={onClosePopup}/>
              : <window.MapPopupCompact c={selectedCourse} saved={saved.has(selectedCourse.id)} onSave={onSave} onView={() => setPopupExpanded(true)}/>
            }
          </div>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// MOBILE C REFINED VARIANTS
// ═════════════════════════════════════════════════════════════

const MobileFrame = window.MobileFrame; // reuse existing frame

// Shared state hook for mobile
const useMobileState = () => {
  const [filters, setFilters] = useState(initialFilters());
  const [stayMode, setStayMode] = useState('stays-only');
  const [v, setV] = useState('map');
  const [sheet, setSheet] = useState(false);
  const [saved, setSaved] = useState(new Set(['matarangi']));
  const [selectedId, setSelectedId] = useState('matarangi');
  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = applyFilters(COURSES, filters, stayMode);
  return { filters, setFilters, stayMode, setStayMode, v, setV, sheet, setSheet, saved, onSave, selectedId, setSelectedId, filtered };
};

const MobileFiltersSheet = ({ open, onClose, filters, setFilters, filtered, stayMode }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(29,53,87,0.40)', zIndex: 50 }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '80%', display: 'flex', flexDirection: 'column', zIndex: 60 }}>
        <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: '#D9DCE0' }}/>
        </div>
        <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Filters</span>
          <button onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer' }}><Icon name="close" size={18}/></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
          <FilterChecklist filters={filters} setFilters={setFilters}/>
        </div>
        <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 9999, padding: '13px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Show {filtered.length} {stayMode === 'stays-only' ? 'stays' : 'courses'}
          </button>
        </div>
      </div>
    </>
  );
};

// MC1 — Logo lock-up at top-left, search to the right; hero toggle floats below
const MobileC1 = ({ logoVariant = 'M1', heroToggle = 'H1' }) => {
  const s = useMobileState();
  const filterCount = s.filters.stayTypes.length + s.filters.amenities.length;
  const sel = s.filtered.find(c => c.id === s.selectedId);
  const HeroToggle = heroToggle === 'H2' ? HeroToggleH2 : heroToggle === 'H3' ? HeroToggleH3 : heroToggle === 'H4' ? HeroToggleH4 : HeroToggleH1;
  const staysCount = COURSES.filter(c => c.stayType).length;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-alt)', fontFamily: 'var(--font-body)', color: 'var(--text)', position: 'relative' }}>
      <header style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ background: '#fff', borderRadius: 9999, padding: '8px 12px', boxShadow: '0 4px 14px rgba(29,53,87,0.12)', display: 'flex', alignItems: 'center' }}>
          <LogoMobile variant={logoVariant}/>
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 9999, boxShadow: '0 4px 14px rgba(29,53,87,0.12)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="search" size={14} color="var(--text-muted)"/>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>Search</span>
          <Avatar size={26}/>
        </div>
      </header>
      <div style={{ flex: 1, position: 'relative', background: '#DCEEF1' }}>
        <NZMap courses={s.filtered} width="100%" height="100%" stayMode={s.stayMode} selectedId={s.selectedId} onSelect={s.setSelectedId}/>
      </div>
      <div style={{ position: 'absolute', top: 64, left: 12, zIndex: 8 }}>
        <HeroToggle value={s.stayMode} onChange={s.setStayMode} staysCount={staysCount} totalCount={COURSES.length}/>
      </div>
      {sel && (
        <div style={{ position: 'absolute', bottom: 92, left: 12, right: 12, zIndex: 5 }}>
          <CourseCard c={sel} saved={s.saved.has(sel.id)} onSave={s.onSave} layout="list"/>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 22, right: 14, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 6 }}>
        <button onClick={() => s.setV(s.v === 'map' ? 'list' : 'map')} style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name={s.v === 'map' ? 'list' : 'map'} size={18}/>
        </button>
        <button onClick={() => s.setSheet(true)} style={{ height: 52, padding: '0 18px', borderRadius: 9999, background: 'var(--primary)', color: '#fff', border: 0, boxShadow: '0 8px 20px rgba(45,95,63,0.35)', display: 'inline-flex', alignItems: 'center', gap: 8, font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Icon name="sliders" size={16} color="#fff"/>
          Filters {filterCount > 0 && <span style={{ background: '#fff', color: 'var(--primary)', borderRadius: 9999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{filterCount}</span>}
        </button>
      </div>
      <MobileFiltersSheet open={s.sheet} onClose={() => s.setSheet(false)} filters={s.filters} setFilters={s.setFilters} filtered={s.filtered} stayMode={s.stayMode}/>
    </div>
  );
};

// MC2 — Centered logo at very top (small status-bar style), search bar below it; hero toggle above bottom card
const MobileC2 = ({ logoVariant = 'M3', heroToggle = 'H4' }) => {
  const s = useMobileState();
  const filterCount = s.filters.stayTypes.length + s.filters.amenities.length;
  const sel = s.filtered.find(c => c.id === s.selectedId);
  const HeroToggle = heroToggle === 'H2' ? HeroToggleH2 : heroToggle === 'H3' ? HeroToggleH3 : heroToggle === 'H4' ? HeroToggleH4 : HeroToggleH1;
  const staysCount = COURSES.filter(c => c.stayType).length;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-alt)', fontFamily: 'var(--font-body)', color: 'var(--text)', position: 'relative' }}>
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '14px 12px 10px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <LogoMobile variant={logoVariant}/>
        </div>
        <div style={{ background: '#fff', borderRadius: 9999, boxShadow: '0 4px 14px rgba(29,53,87,0.12)', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)' }}>
          <Icon name="search" size={15} color="var(--text-muted)"/>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>Search by region or course</span>
          <Avatar size={26}/>
        </div>
      </header>
      <div style={{ flex: 1, position: 'relative', background: '#DCEEF1' }}>
        <NZMap courses={s.filtered} width="100%" height="100%" stayMode={s.stayMode} selectedId={s.selectedId} onSelect={s.setSelectedId}/>
      </div>
      {sel && (
        <div style={{ position: 'absolute', bottom: 96, left: 12, right: 12, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ alignSelf: 'flex-start' }}>
            <HeroToggle value={s.stayMode} onChange={s.setStayMode} staysCount={staysCount} totalCount={COURSES.length}/>
          </div>
          <CourseCard c={sel} saved={s.saved.has(sel.id)} onSave={s.onSave} layout="list"/>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 22, right: 14, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 6 }}>
        <button onClick={() => s.setV(s.v === 'map' ? 'list' : 'map')} style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name={s.v === 'map' ? 'list' : 'map'} size={18}/>
        </button>
        <button onClick={() => s.setSheet(true)} style={{ height: 52, padding: '0 18px', borderRadius: 9999, background: 'var(--primary)', color: '#fff', border: 0, boxShadow: '0 8px 20px rgba(45,95,63,0.35)', display: 'inline-flex', alignItems: 'center', gap: 8, font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Icon name="sliders" size={16} color="#fff"/>
          Filters {filterCount > 0 && <span style={{ background: '#fff', color: 'var(--primary)', borderRadius: 9999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{filterCount}</span>}
        </button>
      </div>
      <MobileFiltersSheet open={s.sheet} onClose={() => s.setSheet(false)} filters={s.filters} setFilters={s.setFilters} filtered={s.filtered} stayMode={s.stayMode}/>
    </div>
  );
};

// MC3 — Logo in the FAB cluster (logo doubles as menu/home button), search pill alone at top
const MobileC3 = ({ logoVariant = 'M1', heroToggle = 'H3' }) => {
  const s = useMobileState();
  const filterCount = s.filters.stayTypes.length + s.filters.amenities.length;
  const sel = s.filtered.find(c => c.id === s.selectedId);
  const HeroToggle = heroToggle === 'H2' ? HeroToggleH2 : heroToggle === 'H3' ? HeroToggleH3 : heroToggle === 'H4' ? HeroToggleH4 : HeroToggleH1;
  const staysCount = COURSES.filter(c => c.stayType).length;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-alt)', fontFamily: 'var(--font-body)', color: 'var(--text)', position: 'relative' }}>
      <header style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10 }}>
        <div style={{ background: '#fff', borderRadius: 9999, padding: '10px 14px', boxShadow: '0 4px 14px rgba(29,53,87,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="search" size={15} color="var(--text-muted)"/>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>Where to next?</span>
          <Avatar size={26}/>
        </div>
      </header>
      <div style={{ flex: 1, position: 'relative', background: '#DCEEF1' }}>
        <NZMap courses={s.filtered} width="100%" height="100%" stayMode={s.stayMode} selectedId={s.selectedId} onSelect={s.setSelectedId}/>
      </div>
      {/* Hero toggle floats just above bottom card area */}
      <div style={{ position: 'absolute', bottom: sel ? 240 : 92, left: 12, right: 12, zIndex: 7, display: 'flex', justifyContent: 'center' }}>
        <HeroToggle value={s.stayMode} onChange={s.setStayMode} staysCount={staysCount} totalCount={COURSES.length}/>
      </div>
      {sel && (
        <div style={{ position: 'absolute', bottom: 92, left: 12, right: 12, zIndex: 5 }}>
          <CourseCard c={sel} saved={s.saved.has(sel.id)} onSave={s.onSave} layout="list"/>
        </div>
      )}
      {/* Logo-as-home button + filters FAB */}
      <div style={{ position: 'absolute', bottom: 22, left: 14, zIndex: 6 }}>
        <button title="Home" style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <LogoMobile variant={logoVariant}/>
        </button>
      </div>
      <div style={{ position: 'absolute', bottom: 22, right: 14, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 6 }}>
        <button onClick={() => s.setV(s.v === 'map' ? 'list' : 'map')} style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name={s.v === 'map' ? 'list' : 'map'} size={18}/>
        </button>
        <button onClick={() => s.setSheet(true)} style={{ height: 52, padding: '0 18px', borderRadius: 9999, background: 'var(--primary)', color: '#fff', border: 0, boxShadow: '0 8px 20px rgba(45,95,63,0.35)', display: 'inline-flex', alignItems: 'center', gap: 8, font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Icon name="sliders" size={16} color="#fff"/>
          Filters {filterCount > 0 && <span style={{ background: '#fff', color: 'var(--primary)', borderRadius: 9999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{filterCount}</span>}
        </button>
      </div>
      <MobileFiltersSheet open={s.sheet} onClose={() => s.setSheet(false)} filters={s.filters} setFilters={s.setFilters} filtered={s.filtered} stayMode={s.stayMode}/>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
Object.assign(window, {
  LogoMarkSilhouette, LogoMarkCircle, LogoMarkSquareTile,
  Wordmark, LogoLockup, LogoMobile,
  HeroToggleH1, HeroToggleH2, HeroToggleH3, HeroToggleH4,
  ClusterSegmented, ClusterIconButtons, ClusterRailRight, ClusterMinimal,
  DesktopBRefined,
  MobileC1, MobileC2, MobileC3,
});
