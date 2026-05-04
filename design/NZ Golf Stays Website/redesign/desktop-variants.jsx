/* global React, Icon, COURSES, REGIONS, STAY_TYPES, AMENITIES, CourseCard, NZMap, StaysToggleV1, StaysToggleV2, StaysToggleV3, SearchWithStaysToggle, StayIcon, STAY_TYPE_LABELS */
const { useState } = React;

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────
const Logo = ({ collapsed = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <img src="assets/logo-mark.png" alt="NZ Golf Stays" width={36} height={36} style={{ display: 'block', objectFit: 'contain' }}/>
    {!collapsed && (
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 600,
        fontSize: 16, color: 'var(--primary)', letterSpacing: '-0.01em',
      }}>NZ Golf Stays</span>
    )}
  </div>
);

const Avatar = ({ size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'linear-gradient(135deg,#3A7CA5,#1D3557)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: size * 0.42, fontWeight: 600,
    border: '2px solid var(--primary)',
  }}>JM</div>
);

const ViewSwitcher = ({ value, onChange, includeSplit = true, includeSaved = true }) => {
  const opts = [
    includeSaved && { v: 'saved', label: 'Saved', icon: 'heart' },
    includeSplit && { v: 'split', label: 'Split', icon: 'split' },
    { v: 'map', label: 'Map', icon: 'map' },
    { v: 'list', label: 'List', icon: 'list' },
  ].filter(Boolean);
  return (
    <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
      {opts.map(o => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange?.(o.v)} style={{
            background: active ? 'var(--surface-alt)' : 'transparent',
            color: active ? 'var(--text)' : 'var(--text-muted)',
            border: 0, font: 'inherit', fontSize: 13,
            fontWeight: active ? 600 : 500, padding: '6px 12px', borderRadius: 8,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name={o.icon} size={14}/>
            {o.label}
          </button>
        );
      })}
    </div>
  );
};

// Filter chip — used in a few variants
const FilterChip = ({ active, onClick, icon, children, hasMenu }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: active ? 'var(--primary)' : '#fff',
    color: active ? '#fff' : 'var(--text)',
    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
    borderRadius: 9999, padding: '8px 14px',
    font: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 160ms var(--ease-standard)',
  }}>
    {icon && <Icon name={icon} size={14}/>}
    {children}
    {hasMenu && <Icon name="chevron" size={12}/>}
  </button>
);

// Sidebar filter checklist (for "kept sidebar" variants)
const FilterChecklist = ({ filters, setFilters }) => {
  const toggle = (group, id) => {
    setFilters(f => ({ ...f, [group]: f[group].includes(id) ? f[group].filter(x => x !== id) : [...f[group], id] }));
  };
  const Section = ({ title, items, group }) => (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => {
          const checked = filters[group].includes(item.id);
          return (
            <label key={item.id} style={{
              display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start',
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: 4, marginTop: 1,
                border: `1.5px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
                background: checked ? 'var(--primary)' : '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {checked && <Icon name="check" size={12} color="#fff" stroke={2.4}/>}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.35 }}>
                <span style={{ color: 'var(--text)', fontWeight: 500, display: 'block' }}>{item.label}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.sub}</span>
              </span>
              <input type="checkbox" checked={checked} onChange={() => toggle(group, item.id)} style={{ display: 'none' }}/>
            </label>
          );
        })}
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Region</div>
        <select value={filters.region} onChange={e => setFilters(f => ({ ...f, region: e.target.value }))} style={{
          width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 6,
          font: 'inherit', fontSize: 13, color: 'var(--text)', background: '#fff', cursor: 'pointer',
        }}>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <Section title="Stay type" items={STAY_TYPES} group="stayTypes"/>
      <Section title="Amenities" items={AMENITIES} group="amenities"/>
    </div>
  );
};

// Filter logic
const applyFilters = (courses, f, stayMode) => {
  return courses.filter(c => {
    if (stayMode === 'stays-only' && !c.stayType) return false;
    if (f.region !== 'All regions' && c.region !== f.region) return false;
    if (f.stayTypes.length && !f.stayTypes.includes(c.stayType)) return false;
    if (f.amenities.includes('power') && !c.power) return false;
    if (f.amenities.includes('dogs') && !c.dogs) return false;
    if (f.amenities.includes('askAhead') && !c.askAhead) return false;
    if (f.q && !c.name.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
};

const initialFilters = () => ({ region: 'All regions', stayTypes: [], amenities: [], q: '' });

// ─────────────────────────────────────────────────────────────
// VARIANT A — Refined current (sidebar + top bar)
// ─────────────────────────────────────────────────────────────
const DesktopA = ({ width = 1200, height = 760, view = 'list' }) => {
  const [filters, setFilters] = useState(initialFilters());
  const [stayMode, setStayMode] = useState('all');
  const [v, setV] = useState(view);
  const [saved, setSaved] = useState(new Set(['akarana', 'amberley']));
  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = applyFilters(COURSES, filters, stayMode);

  return (
    <div style={{ width, height, background: 'var(--surface-alt)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', color: 'var(--text)', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#fff', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 720 }}>
          <Logo/>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Icon name="search" size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
            <input placeholder="Search courses, towns, regions" style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9999, border: '1px solid var(--border)', font: 'inherit', fontSize: 13, color: 'var(--text)' }}/>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StaysToggleV3 value={stayMode} onChange={setStayMode}/>
          <Avatar/>
        </div>
      </header>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside style={{ width: 260, background: '#fff', borderRight: '1px solid var(--border)', padding: 24, overflowY: 'auto' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--text)', marginBottom: 16 }}>Filters</div>
          <FilterChecklist filters={filters} setFilters={setFilters}/>
        </aside>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <b style={{ color: 'var(--text)', fontWeight: 600 }}>{filtered.length}</b> {stayMode === 'stays-only' ? 'stays' : 'courses'} found
            </div>
            <ViewSwitcher value={v} onChange={setV}/>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--surface-alt)' }}>
            {v === 'list' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {filtered.map(c => <CourseCard key={c.id} c={c} saved={saved.has(c.id)} onSave={onSave} layout="grid"/>)}
              </div>
            )}
            {v === 'map' && (
              <div style={{ position: 'relative', height: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <NZMap courses={filtered} width="100%" height="100%" stayMode={stayMode}/>
              </div>
            )}
            {v === 'split' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                  {filtered.slice(0, 4).map(c => <CourseCard key={c.id} c={c} saved={saved.has(c.id)} onSave={onSave} layout="list"/>)}
                </div>
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <NZMap courses={filtered} width="100%" height="100%" stayMode={stayMode}/>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// VARIANT B — Airbnb-style (centered search, chips below, no sidebar)
// ─────────────────────────────────────────────────────────────
const DesktopB = ({ width = 1200, height = 760 }) => {
  const [filters, setFilters] = useState(initialFilters());
  const [stayMode, setStayMode] = useState('stays-only');
  const [saved, setSaved] = useState(new Set(['akarana']));
  const [v, setV] = useState('list');
  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = applyFilters(COURSES, filters, stayMode);

  return (
    <div style={{ width, height, background: 'var(--surface-alt)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', color: 'var(--text)', overflow: 'hidden' }}>
      {/* Top header — centered search */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px' }}>
          <Logo/>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <SearchWithStaysToggle stayMode={stayMode} onStayChange={setStayMode}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: 'none', border: 0, font: 'inherit', fontSize: 13, fontWeight: 500, color: 'var(--text)', cursor: 'pointer' }}>List your course</button>
            <Avatar/>
          </div>
        </div>
        {/* Filter chip row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 32px 16px', overflowX: 'auto' }}>
          <FilterChip icon="map-pin" hasMenu>{filters.region}</FilterChip>
          <FilterChip icon="sliders" hasMenu>Stay type</FilterChip>
          <FilterChip icon="plug" active={filters.amenities.includes('power')} onClick={() => setFilters(f => ({ ...f, amenities: f.amenities.includes('power') ? f.amenities.filter(x => x !== 'power') : [...f.amenities, 'power'] }))}>Powered</FilterChip>
          <FilterChip icon="paw" active={filters.amenities.includes('dogs')} onClick={() => setFilters(f => ({ ...f, amenities: f.amenities.includes('dogs') ? f.amenities.filter(x => x !== 'dogs') : [...f.amenities, 'dogs'] }))}>Dogs OK</FilterChip>
          <FilterChip icon="info" active={filters.amenities.includes('askAhead')} onClick={() => setFilters(f => ({ ...f, amenities: f.amenities.includes('askAhead') ? f.amenities.filter(x => x !== 'askAhead') : [...f.amenities, 'askAhead'] }))}>Ask ahead</FilterChip>
          <FilterChip icon="dollar">Free only</FilterChip>
          <div style={{ flex: 1 }}/>
          <ViewSwitcher value={v} onChange={setV}/>
        </div>
      </header>
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
        {v === 'list' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {filtered.map(c => <CourseCard key={c.id} c={c} saved={saved.has(c.id)} onSave={onSave} layout="grid"/>)}
          </div>
        )}
        {v === 'map' && (
          <div style={{ position: 'relative', height: 540, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <NZMap courses={filtered} width="100%" height="100%" stayMode={stayMode}/>
          </div>
        )}
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// VARIANT C — Top-bar with horizontal chip filter row, no sidebar
// ─────────────────────────────────────────────────────────────
const DesktopC = ({ width = 1200, height = 760 }) => {
  const [filters, setFilters] = useState(initialFilters());
  const [stayMode, setStayMode] = useState('all');
  const [saved, setSaved] = useState(new Set());
  const [v, setV] = useState('split');
  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = applyFilters(COURSES, filters, stayMode);

  return (
    <div style={{ width, height, background: 'var(--neutral-warm)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', color: 'var(--text)', overflow: 'hidden' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '14px 32px', gap: 24 }}>
          <Logo/>
          <StaysToggleV1 value={stayMode} onChange={setStayMode}/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14 }}>
            <button style={{ background: 'none', border: 0, font: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="heart" size={15}/> Saved · {saved.size}
            </button>
            <Avatar/>
          </div>
        </div>
        {/* Search + chip row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 32px 14px' }}>
          <div style={{ position: 'relative', width: 280 }}>
            <Icon name="search" size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
            <input placeholder="Search courses" style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9999, border: '1px solid var(--border)', font: 'inherit', fontSize: 13 }}/>
          </div>
          <div style={{ display: 'flex', gap: 8, flex: 1, overflowX: 'auto' }}>
            <FilterChip icon="map-pin" hasMenu>{filters.region}</FilterChip>
            <FilterChip icon="sliders" hasMenu>Stay type · {filters.stayTypes.length || 'any'}</FilterChip>
            {AMENITIES.map(a => (
              <FilterChip key={a.id} active={filters.amenities.includes(a.id)} onClick={() => setFilters(f => ({ ...f, amenities: f.amenities.includes(a.id) ? f.amenities.filter(x => x !== a.id) : [...f.amenities, a.id] }))}>
                {a.label}
              </FilterChip>
            ))}
          </div>
          <ViewSwitcher value={v} onChange={setV}/>
        </div>
      </header>
      <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: '0 0 50%', overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <b style={{ color: 'var(--text)' }}>{filtered.length}</b> {stayMode === 'stays-only' ? 'stays' : 'courses'} in view
          </div>
          {filtered.slice(0, 5).map(c => <CourseCard key={c.id} c={c} saved={saved.has(c.id)} onSave={onSave} layout="list"/>)}
        </div>
        <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
          <NZMap courses={filtered} width="100%" height="100%" stayMode={stayMode}/>
        </div>
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// VARIANT D — Collapsible icon-rail sidebar
// ─────────────────────────────────────────────────────────────
const DesktopD = ({ width = 1200, height = 760 }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [filters, setFilters] = useState(initialFilters());
  const [stayMode, setStayMode] = useState('stays-only');
  const [v, setV] = useState('list');
  const [saved, setSaved] = useState(new Set(['matarangi', 'paraparaumu']));
  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = applyFilters(COURSES, filters, stayMode);

  const railW = collapsed ? 64 : 240;
  return (
    <div style={{ width, height, background: 'var(--surface-alt)', display: 'flex', fontFamily: 'var(--font-body)', color: 'var(--text)', overflow: 'hidden' }}>
      {/* Left rail */}
      <aside style={{
        width: railW, transition: 'width 200ms var(--ease-standard)',
        background: '#fff', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <Logo collapsed={collapsed}/>
        </div>
        <nav style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'discover', icon: 'search', label: 'Discover', active: true },
            { id: 'saved', icon: 'heart', label: `Saved · ${saved.size}` },
            { id: 'trips', icon: 'calendar', label: 'My trips' },
            { id: 'submit', icon: 'plus', label: 'Submit a course' },
          ].map(it => (
            <button key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: it.active ? 'var(--surface-alt)' : 'transparent',
              border: 0, borderRadius: 8, padding: collapsed ? '10px 12px' : '10px 14px',
              font: 'inherit', fontSize: 13, fontWeight: it.active ? 600 : 500, color: 'var(--text)',
              cursor: 'pointer', textAlign: 'left',
            }}>
              <Icon name={it.icon} size={16} color={it.active ? 'var(--primary)' : 'var(--text)'}/>
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>}
            </button>
          ))}
          {!collapsed && <div style={{ height: 1, background: 'var(--border)', margin: '12px 4px' }}/>}
          {!collapsed && (
            <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <FilterChecklist filters={filters} setFilters={setFilters}/>
            </div>
          )}
        </nav>
        <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 10 }}>
          {!collapsed && <Avatar/>}
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>James M.</span>}
          <button onClick={() => setCollapsed(c => !c)} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
            <Icon name={collapsed ? 'chevron-right' : 'menu'} size={14}/>
          </button>
        </div>
      </aside>
      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
            <Icon name="search" size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
            <input placeholder="Search courses, towns, regions" style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 9999, border: '1px solid var(--border)', font: 'inherit', fontSize: 13 }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <StaysToggleV2 value={stayMode} onChange={setStayMode}/>
            <ViewSwitcher value={v} onChange={setV} includeSaved={false}/>
          </div>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--surface-alt)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: collapsed ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: 16 }}>
            {filtered.map(c => <CourseCard key={c.id} c={c} saved={saved.has(c.id)} onSave={onSave} layout="grid"/>)}
          </div>
        </div>
      </main>
    </div>
  );
};

window.DesktopA = DesktopA;
window.DesktopB = DesktopB;
window.DesktopC = DesktopC;
window.DesktopD = DesktopD;
window.applyFilters = applyFilters;
window.initialFilters = initialFilters;
window.Logo = Logo;
window.Avatar = Avatar;
window.ViewSwitcher = ViewSwitcher;
window.FilterChip = FilterChip;
window.FilterChecklist = FilterChecklist;
