/* global React, Icon, COURSES, REGIONS, STAY_TYPES, AMENITIES, CourseCard, NZMap, StaysToggleV1, StaysToggleV2, StaysToggleV3, applyFilters, initialFilters, FilterChecklist, FilterChip, Logo, Avatar, StayIcon, STAY_TYPE_LABELS */
const { useState, useRef, useEffect } = React;

// Mobile bezel — single phone frame
const MobileFrame = ({ width = 390, height = 780, children, label }) => (
  <div style={{
    width, height, background: '#1a1a1a', borderRadius: 38, padding: 8,
    boxShadow: 'var(--shadow-md)', position: 'relative',
  }}>
    <div style={{
      width: '100%', height: '100%', borderRadius: 30, overflow: 'hidden',
      background: '#fff', position: 'relative',
    }}>
      {/* status bar */}
      <div style={{
        height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 22px', fontSize: 12, fontWeight: 600, color: 'var(--text)',
        background: '#fff', flexShrink: 0,
      }}>
        <span>9:41</span>
        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
          <span style={{ width: 16, height: 9, border: '1px solid var(--text)', borderRadius: 2, display: 'inline-block', position: 'relative' }}>
            <span style={{ position: 'absolute', inset: 1.5, background: 'var(--text)', borderRadius: 1 }}/>
          </span>
        </span>
      </div>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 110, height: 26, borderRadius: '0 0 14px 14px', background: '#1a1a1a', zIndex: 100 }}/>
      <div style={{ height: 'calc(100% - 32px)', overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MOBILE A — Compact top bar + bottom-sheet filters (drag-up)
// ─────────────────────────────────────────────────────────────
const MobileA = () => {
  const [filters, setFilters] = useState(initialFilters());
  const [stayMode, setStayMode] = useState('stays-only');
  const [sheet, setSheet] = useState(false);
  const [v, setV] = useState('list');
  const [saved, setSaved] = useState(new Set(['akarana']));
  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = applyFilters(COURSES, filters, stayMode);
  const filterCount = filters.stayTypes.length + filters.amenities.length + (filters.region !== 'All regions' ? 1 : 0);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-alt)', fontFamily: 'var(--font-body)', color: 'var(--text)', position: 'relative' }}>
      {/* Compact header */}
      <header style={{ background: '#fff', padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <img src="assets/logo-circle.png" alt="NZ Golf Stays" width={30} height={30} style={{ display: 'block', objectFit: 'contain', flexShrink: 0, borderRadius: '50%' }}/>
        <div style={{ position: 'relative', flex: 1 }}>
          <Icon name="search" size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}/>
          <input placeholder="Search courses" style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 9999, border: '1px solid var(--border)', font: 'inherit', fontSize: 13 }}/>
        </div>
        <Avatar size={28}/>
      </header>
      {/* Stays toggle row */}
      <div style={{ padding: '12px 14px 8px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <StaysToggleV1 value={stayMode} onChange={setStayMode}/>
        <button onClick={() => setV(v === 'map' ? 'list' : 'map')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fff', border: '1px solid var(--border)', borderRadius: 9999,
          padding: '6px 12px', font: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          <Icon name={v === 'map' ? 'list' : 'map'} size={13}/>
          {v === 'map' ? 'List' : 'Map'}
        </button>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <b style={{ color: 'var(--text)' }}>{filtered.length}</b> {stayMode === 'stays-only' ? 'stays' : 'courses'} found
        </div>
        {v === 'list' ? filtered.map(c => <CourseCard key={c.id} c={c} saved={saved.has(c.id)} onSave={onSave} layout="grid"/>)
          : <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}><NZMap courses={filtered} width="100%" height="100%" stayMode={stayMode}/></div>}
      </div>
      {/* Bottom-sheet drag handle */}
      <button onClick={() => setSheet(true)} style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'var(--text)', color: '#fff', border: 0, borderRadius: 9999,
        padding: '12px 20px 12px 16px', cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(29,53,87,0.25)',
        display: 'inline-flex', alignItems: 'center', gap: 8, font: 'inherit', fontSize: 13, fontWeight: 600,
      }}>
        <Icon name="sliders" size={15} color="#fff"/>
        Filters {filterCount > 0 && <span style={{ background: '#fff', color: 'var(--text)', borderRadius: 9999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{filterCount}</span>}
      </button>
      {/* Sheet */}
      {sheet && (
        <>
          <div onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(29,53,87,0.40)', zIndex: 50 }}/>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: '#fff', borderRadius: '20px 20px 0 0',
            maxHeight: '78%', display: 'flex', flexDirection: 'column',
            zIndex: 60, animation: 'slideUp 240ms var(--ease-standard)',
          }}>
            <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <span style={{ width: 36, height: 4, borderRadius: 2, background: '#D9DCE0' }}/>
            </div>
            <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Filters</span>
              <button onClick={() => setFilters(initialFilters())} style={{ background: 'none', border: 0, color: 'var(--secondary)', font: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Clear all</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
              <FilterChecklist filters={filters} setFilters={setFilters}/>
            </div>
            <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setSheet(false)} style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 9999, padding: '13px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Show {filtered.length} {stayMode === 'stays-only' ? 'stays' : 'courses'}
              </button>
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MOBILE B — Sticky top bar + horizontal scrolling filter chips
// ─────────────────────────────────────────────────────────────
const MobileB = () => {
  const [filters, setFilters] = useState(initialFilters());
  const [stayMode, setStayMode] = useState('all');
  const [v, setV] = useState('list');
  const [saved, setSaved] = useState(new Set());
  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = applyFilters(COURSES, filters, stayMode);
  const tog = (group, id) => setFilters(f => ({ ...f, [group]: f[group].includes(id) ? f[group].filter(x => x !== id) : [...f[group], id] }));

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-alt)', fontFamily: 'var(--font-body)', color: 'var(--text)' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
          <img src="assets/logo-circle.png" alt="NZ Golf Stays" width={30} height={30} style={{ display: 'block', objectFit: 'contain', flexShrink: 0, borderRadius: '50%' }}/>
          <StaysToggleV2 value={stayMode} onChange={setStayMode}/>
          <Avatar size={28}/>
        </div>
        <div style={{ padding: '0 12px 10px' }}>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}/>
            <input placeholder="Search courses" style={{ width: '100%', padding: '9px 10px 9px 32px', borderRadius: 9999, border: '1px solid var(--border)', font: 'inherit', fontSize: 13, boxSizing: 'border-box' }}/>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 12px 12px', scrollbarWidth: 'none' }}>
          <FilterChip icon="map-pin" hasMenu>{filters.region}</FilterChip>
          <FilterChip icon="sliders" hasMenu active={filters.stayTypes.length > 0}>Stay type{filters.stayTypes.length ? ` · ${filters.stayTypes.length}` : ''}</FilterChip>
          {AMENITIES.map(a => (
            <FilterChip key={a.id} icon={a.id === 'power' ? 'plug' : a.id === 'dogs' ? 'paw' : 'info'}
              active={filters.amenities.includes(a.id)} onClick={() => tog('amenities', a.id)}>
              {a.label}
            </FilterChip>
          ))}
        </div>
      </header>
      <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <b style={{ color: 'var(--text)' }}>{filtered.length}</b> {stayMode === 'stays-only' ? 'stays' : 'courses'}
        </div>
        <button onClick={() => setV(v === 'map' ? 'list' : 'map')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fff', border: '1px solid var(--border)', borderRadius: 9999,
          padding: '5px 12px', font: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          <Icon name={v === 'map' ? 'list' : 'map'} size={13}/>
          {v === 'map' ? 'List' : 'Map'}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {v === 'list' ? filtered.map(c => <CourseCard key={c.id} c={c} saved={saved.has(c.id)} onSave={onSave} layout="grid"/>)
          : <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}><NZMap courses={filtered} width="100%" height="100%" stayMode={stayMode}/></div>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MOBILE C — Floating FAB filter + minimal top bar
// ─────────────────────────────────────────────────────────────
const MobileC = () => {
  const [filters, setFilters] = useState(initialFilters());
  const [stayMode, setStayMode] = useState('stays-only');
  const [v, setV] = useState('map');
  const [sheet, setSheet] = useState(false);
  const [saved, setSaved] = useState(new Set(['matarangi']));
  const [selectedId, setSelectedId] = useState('matarangi');
  const onSave = (id) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = applyFilters(COURSES, filters, stayMode);
  const filterCount = filters.stayTypes.length + filters.amenities.length;
  const sel = filtered.find(c => c.id === selectedId);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-alt)', fontFamily: 'var(--font-body)', color: 'var(--text)', position: 'relative' }}>
      {/* Minimal floating top bar */}
      <header style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          flex: 1, background: '#fff', borderRadius: 9999,
          boxShadow: '0 4px 14px rgba(29,53,87,0.12)',
          padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <img src="assets/logo-circle.png" alt="NZ Golf Stays" width={28} height={28} style={{ display: 'block', objectFit: 'contain', flexShrink: 0, borderRadius: '50%' }}/>
          <Icon name="search" size={14} color="var(--text-muted)"/>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>Search courses</span>
          <Avatar size={26}/>
        </div>
      </header>
      {/* Map fills */}
      <div style={{ flex: 1, position: 'relative', background: '#DCEEF1' }}>
        <NZMap courses={filtered} width="100%" height="100%" stayMode={stayMode}
               selectedId={selectedId} onSelect={setSelectedId}/>
      </div>
      {/* Floating selected-card preview */}
      {sel && (
        <div style={{ position: 'absolute', bottom: 92, left: 12, right: 12, zIndex: 5 }}>
          <CourseCard c={sel} saved={saved.has(sel.id)} onSave={onSave} layout="list"/>
        </div>
      )}
      {/* Stays toggle pinned top-right under header */}
      <div style={{ position: 'absolute', top: 64, left: 12, zIndex: 8 }}>
        <StaysToggleV3 value={stayMode} onChange={setStayMode} staysCount={filtered.length} totalCount={COURSES.length}/>
      </div>
      {/* FAB filter cluster */}
      <div style={{ position: 'absolute', bottom: 22, right: 14, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 6 }}>
        <button onClick={() => setV(v === 'map' ? 'list' : 'map')} style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#fff', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name={v === 'map' ? 'list' : 'map'} size={18}/>
        </button>
        <button onClick={() => setSheet(true)} style={{
          height: 52, padding: '0 18px', borderRadius: 9999,
          background: 'var(--primary)', color: '#fff', border: 0,
          boxShadow: '0 8px 20px rgba(45,95,63,0.35)',
          display: 'inline-flex', alignItems: 'center', gap: 8, font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          <Icon name="sliders" size={16} color="#fff"/>
          Filters {filterCount > 0 && <span style={{ background: '#fff', color: 'var(--primary)', borderRadius: 9999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{filterCount}</span>}
        </button>
      </div>
      {sheet && (
        <>
          <div onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(29,53,87,0.40)', zIndex: 50 }}/>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: '#fff', borderRadius: '20px 20px 0 0',
            maxHeight: '80%', display: 'flex', flexDirection: 'column', zIndex: 60,
            animation: 'slideUp 240ms var(--ease-standard)',
          }}>
            <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <span style={{ width: 36, height: 4, borderRadius: 2, background: '#D9DCE0' }}/>
            </div>
            <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Filters</span>
              <button onClick={() => setSheet(false)} style={{ background: 'none', border: 0, cursor: 'pointer' }}><Icon name="close" size={18}/></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
              <FilterChecklist filters={filters} setFilters={setFilters}/>
            </div>
            <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setSheet(false)} style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 9999, padding: '13px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Show {filtered.length} {stayMode === 'stays-only' ? 'stays' : 'courses'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAP POPUP (course detail) — compact + expanded variants
// ─────────────────────────────────────────────────────────────
const MapPopupCompact = ({ c, onSave, saved, onView }) => (
  <article style={{
    width: 280, background: '#fff', borderRadius: 16,
    overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
    fontFamily: 'var(--font-body)',
  }}>
    <div style={{ position: 'relative', height: 140, background: c.photo }}>
      <div style={{ position: 'absolute', inset: 0, background: c.photoAccent }}/>
      <button onClick={() => onSave?.(c.id)} style={{ position: 'absolute', top: 10, left: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={saved ? 'heart-fill' : 'heart'} size={15} color={saved ? 'var(--danger)' : 'var(--text)'}/>
      </button>
      <button style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="close" size={14}/>
      </button>
    </div>
    <div style={{ padding: 14 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, lineHeight: 1.2 }}>{c.name}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{c.region}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, color: 'var(--text)' }}>
        <StayIcon type={c.stayType} size={15} color="var(--text)"/>
        {c.power && <Icon name="plug" size={15}/>}
        {c.dogs && <Icon name="paw" size={15}/>}
        <span style={{ marginLeft: 'auto', fontWeight: 600, fontSize: 13 }}>
          {c.price > 0 ? `$${c.price}` : 'Free'}
        </span>
      </div>
      <button onClick={onView} style={{ marginTop: 12, width: '100%', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 9999, padding: '11px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        View details →
      </button>
    </div>
  </article>
);

const MapPopupExpanded = ({ c, onSave, saved, onClose }) => (
  <article style={{
    width: 460, background: '#fff', borderRadius: 16,
    overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
    fontFamily: 'var(--font-body)',
  }}>
    <div style={{ position: 'relative', height: 220, background: c.photo }}>
      <div style={{ position: 'absolute', inset: 0, background: c.photoAccent }}/>
      <button onClick={() => onSave?.(c.id)} style={{ position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={saved ? 'heart-fill' : 'heart'} size={16} color={saved ? 'var(--danger)' : 'var(--text)'}/>
      </button>
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
        <button style={{ height: 34, padding: '0 14px', borderRadius: 9999, background: 'rgba(255,255,255,0.95)', border: 0, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="edit" size={13}/> Edit
        </button>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={15}/>
        </button>
      </div>
    </div>
    <div style={{ padding: '20px 22px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, lineHeight: 1.2, margin: 0 }}>{c.name}</h3>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{c.region}</div>
          {c.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 13 }}>
              <Icon name="star-fill" size={14} color="var(--warning)"/>
              <span style={{ fontWeight: 600 }}>{c.rating}</span>
              <span style={{ color: 'var(--text-muted)' }}>({c.reviews} reviews)</span>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22 }}>
            {c.price > 0 ? `$${c.price}` : 'Free'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {c.price > 0 ? 'per night' : STAY_TYPE_LABELS[c.stayType]}
          </div>
        </div>
      </div>
      {/* Amenity badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {[
          { icon: <StayIcon type={c.stayType} size={14}/>, label: STAY_TYPE_LABELS[c.stayType] },
          c.power   && { icon: <Icon name="plug" size={14}/>, label: 'Powered' },
          c.dogs    && { icon: <Icon name="paw" size={14}/>, label: 'Dogs OK' },
          c.askAhead && { icon: <Icon name="info" size={14}/>, label: 'Ask ahead' },
          { icon: <Icon name="map-pin" size={14}/>, label: `${c.sites} sites` },
        ].filter(Boolean).map((b, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--surface-alt)', border: '1px solid var(--border)',
            padding: '6px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 500, color: 'var(--text)',
          }}>{b.icon}{b.label}</span>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
          <Icon name="pin" size={15} color="var(--primary)"/>{c.address}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
          <Icon name="phone" size={15} color="var(--primary)"/>07 866 5394
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--secondary)' }}>
          <Icon name="globe" size={15}/>www.{c.id}.co.nz
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={{ flex: 1, background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 9999, padding: '12px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Request to park up
        </button>
        <button style={{ background: '#fff', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 9999, padding: '12px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          View course
        </button>
      </div>
    </div>
  </article>
);

window.MobileFrame = MobileFrame;
window.MobileA = MobileA;
window.MobileB = MobileB;
window.MobileC = MobileC;
window.MapPopupCompact = MapPopupCompact;
window.MapPopupExpanded = MapPopupExpanded;
