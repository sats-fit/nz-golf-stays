/* global React, Icon, COURSES */
const { useState, useRef, useEffect } = React;

// ─────────────────────────────────────────────────────────────
// Stay-type icon (custom glyph: campervan + "$/free/?")
// ─────────────────────────────────────────────────────────────
const StayIcon = ({ type, size = 16, color = 'currentColor' }) => {
  // base camper silhouette in same Lucide-stroke style
  const base = (
    <g>
      <rect x="2" y="9" width="13" height="8" rx="1.5"/>
      <path d="M15 12h4l2 3v2h-6"/>
      <circle cx="6" cy="18" r="1.5"/>
      <circle cx="17" cy="18" r="1.5"/>
    </g>
  );
  const overlays = {
    'free-with-fees':   <text x="13" y="7.5" fontSize="6" fontWeight="700" fill={color} stroke="none" textAnchor="middle">FR</text>,
    'pay-stay-no-play': <text x="20" y="7.5" fontSize="7" fontWeight="700" fill={color} stroke="none" textAnchor="middle">$</text>,
    'pay-stay-play':    <g><text x="6" y="7.5" fontSize="7" fontWeight="700" fill={color} stroke="none" textAnchor="middle">$</text><circle cx="20" cy="5" r="1.6" fill={color} stroke="none"/></g>,
    'donation':         <text x="20" y="7.5" fontSize="7" fontWeight="700" fill={color} stroke="none" textAnchor="middle">♡</text>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {base}
      {overlays[type]}
    </svg>
  );
};

const STAY_TYPE_LABELS = {
  'free-with-fees':   'Free w/ green fees',
  'pay-stay-no-play': 'Pay to stay',
  'pay-stay-play':    'Pay to stay & play',
  'donation':         'Donation',
};

// ─────────────────────────────────────────────────────────────
// CourseCard — reused by list, grid, split sidebar
// ─────────────────────────────────────────────────────────────
const CourseCard = ({ c, layout = 'grid', saved, onSave, onOpen, dense = false }) => {
  const isList = layout === 'list';
  const isCompact = layout === 'compact';

  const photo = (
    <div style={{
      position: 'relative',
      aspectRatio: isList ? '4/3' : (isCompact ? '16/10' : '16/10'),
      background: c.photo,
      overflow: 'hidden',
      flexShrink: 0,
      width: isList ? 180 : '100%',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: c.photoAccent }}/>
      <button onClick={(e) => { e.stopPropagation(); onSave?.(c.id); }} style={{
        position: 'absolute', top: 10, left: 10, width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)', border: 0, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} aria-label="Save">
        <Icon name={saved ? 'heart-fill' : 'heart'} size={16}
              color={saved ? 'var(--danger)' : 'var(--text)'}/>
      </button>
      {!isList && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(255,255,255,0.92)', color: 'var(--text)',
          padding: '4px 10px', borderRadius: 9999,
          fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <StayIcon type={c.stayType} size={13} color="var(--primary)"/>
          {c.price > 0 ? `$${c.price}` : (c.stayType === 'donation' ? 'Koha' : 'Free')}
        </span>
      )}
    </div>
  );

  const body = (
    <div style={{
      padding: isList ? '14px 18px' : (isCompact ? '12px 14px 14px' : '14px 16px 16px'),
      display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 600,
        fontSize: isCompact ? 16 : 18, lineHeight: 1.25,
        color: 'var(--text)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{c.name}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.region}</div>
      {!dense && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 13, color: 'var(--text)' }}>
          {c.rating ? (
            <>
              <Icon name="star-fill" size={13} color="var(--warning)"/>
              <span style={{ fontWeight: 600 }}>{c.rating}</span>
              <span style={{ color: 'var(--text-muted)' }}>({c.reviews})</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Newly listed</span>
          )}
        </div>
      )}
      {/* amenity row — Lucide-style line icons in Deep Navy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, color: 'var(--text-muted)' }}>
        <span title={STAY_TYPE_LABELS[c.stayType]} style={{ display: 'flex' }}>
          <StayIcon type={c.stayType} size={15} color="var(--text)"/>
        </span>
        {c.power && <span title="Powered sites" style={{ display: 'flex' }}><Icon name="plug" size={15} color="var(--text)"/></span>}
        {c.dogs && <span title="Dogs OK" style={{ display: 'flex' }}><Icon name="paw" size={15} color="var(--text)"/></span>}
        {c.askAhead && <span title="Ask ahead" style={{ display: 'flex' }}><Icon name="info" size={15} color="var(--text)"/></span>}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
          {c.price > 0 ? <>${c.price}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/night</span></> : null}
        </span>
      </div>
    </div>
  );

  return (
    <article
      onClick={() => onOpen?.(c)}
      style={{
        background: '#fff', border: '1px solid var(--border)',
        borderRadius: 12, boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden', cursor: 'pointer',
        display: 'flex',
        flexDirection: isList ? 'row' : 'column',
        transition: 'box-shadow 200ms var(--ease-standard)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
      {photo}
      {body}
    </article>
  );
};

// ─────────────────────────────────────────────────────────────
// NZ silhouette + pin overlay (used for compact map illustration)
// ─────────────────────────────────────────────────────────────
const NZMap = ({ width = 460, height = 540, courses = [], selectedId, onSelect, stayMode = 'all', density = 1, showLand = true }) => {
  // Stylised NZ outline — north + south island as fluid paths.
  // Coords are approximate to give a recognisable shape, not surveyed.
  return (
    <svg viewBox="0 0 100 140" width={width} height={height} style={{ display: 'block' }}>
      {/* sea */}
      <rect width="100" height="140" fill="#DCEEF1"/>
      {showLand && (
        <>
          {/* north island */}
          <path d="M55 8 C 62 6, 70 12, 72 22 C 73 30, 68 36, 62 40 C 60 46, 64 50, 60 56 C 56 60, 50 56, 48 50 C 46 44, 50 38, 50 30 C 48 22, 50 14, 55 8 Z"
                fill="#E7DFC8" stroke="#C8BC9C" strokeWidth="0.4"/>
          {/* south island */}
          <path d="M40 60 C 48 60, 54 64, 52 72 C 48 82, 42 90, 36 98 C 30 106, 24 114, 18 116 C 12 116, 14 108, 18 100 C 22 90, 26 80, 30 72 C 34 66, 36 62, 40 60 Z"
                fill="#E7DFC8" stroke="#C8BC9C" strokeWidth="0.4"/>
          {/* stewart island */}
          <path d="M14 122 C 18 121, 22 124, 20 128 C 17 130, 12 128, 14 122 Z"
                fill="#E7DFC8" stroke="#C8BC9C" strokeWidth="0.4"/>
        </>
      )}
      {/* Pins */}
      {courses.map(c => {
        const visible = stayMode === 'all' ? true : true; // stays mode dimming handled below
        const dim = stayMode === 'stays-only' && !c.stayType;
        const sel = c.id === selectedId;
        const x = c.coords.x, y = c.coords.y;
        const pinColor = sel ? '#3A7CA5' : (dim ? '#9CA9A1' : '#2D5F3F');
        return (
          <g key={c.id} transform={`translate(${x}, ${y})`} onClick={(e) => { e.stopPropagation(); onSelect?.(c.id); }} style={{ cursor: 'pointer' }}>
            {/* drop pin teardrop */}
            <path d="M0 -6 C 2.6 -6, 4.5 -4, 4.5 -1.5 C 4.5 1.5, 0 4, 0 4 C 0 4, -4.5 1.5, -4.5 -1.5 C -4.5 -4, -2.6 -6, 0 -6 Z"
                  fill={pinColor} stroke="#fff" strokeWidth="0.6"/>
            {/* tiny golf flag glyph in pin */}
            <path d="M-1 -4.6 V -1.4 M -1 -4.6 L 1.4 -3.8 L -1 -3" stroke="#fff" strokeWidth="0.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {sel && <circle r="7" fill="none" stroke="#3A7CA5" strokeWidth="0.6" opacity="0.4"/>}
          </g>
        );
      })}
      {/* attribution */}
      <text x="98" y="138" textAnchor="end" fontSize="2" fill="#7C8B95">Stylised map</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Stays-only / All courses TOGGLE — multiple styles
// ─────────────────────────────────────────────────────────────

// V1 – classic two-state pill (refined: clean type, slimmer, design-system green)
const StaysToggleV1 = ({ value, onChange }) => {
  const isStays = value === 'stays-only';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 9999, padding: 3, boxShadow: 'var(--shadow-sm)',
      position: 'relative', userSelect: 'none',
    }}>
      <div style={{
        position: 'absolute', top: 3, bottom: 3,
        left: isStays ? 3 : '50%',
        width: 'calc(50% - 3px)',
        background: 'var(--primary)', borderRadius: 9999,
        transition: 'left 200ms var(--ease-standard)',
      }}/>
      {[
        { v: 'stays-only', label: 'Stays only' },
        { v: 'all',        label: 'All courses' },
      ].map(o => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          position: 'relative', zIndex: 1, background: 'transparent', border: 0,
          padding: '8px 18px', borderRadius: 9999,
          font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          color: (o.v === value) ? '#fff' : 'var(--text)',
          transition: 'color 160ms',
        }}>
          {o.label}
        </button>
      ))}
    </div>
  );
};

// V2 – segmented control (sharper, more app-feeling)
const StaysToggleV2 = ({ value, onChange }) => {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--surface-alt)',
      border: '1px solid var(--border)', borderRadius: 10, padding: 3,
    }}>
      {[
        { v: 'stays-only', label: 'Stays', icon: 'van' },
        { v: 'all',        label: 'All courses', icon: 'flag' },
      ].map(o => {
        const active = o.v === value;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            background: active ? '#fff' : 'transparent',
            color: active ? 'var(--text)' : 'var(--text-muted)',
            border: 0, padding: '6px 14px', borderRadius: 8,
            font: 'inherit', fontSize: 13, fontWeight: active ? 600 : 500,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: active ? '0 1px 2px rgba(29,53,87,0.08)' : 'none',
            transition: 'all 160ms var(--ease-standard)',
          }}>
            <Icon name={o.icon} size={14}/>
            {o.label}
          </button>
        );
      })}
    </div>
  );
};

// V3 – Hero-position big switch (label + flip + count chip)
const StaysToggleV3 = ({ value, onChange, staysCount = 142, totalCount = 391 }) => {
  const isStays = value === 'stays-only';
  return (
    <button onClick={() => onChange(isStays ? 'all' : 'stays-only')} style={{
      display: 'inline-flex', alignItems: 'center', gap: 14,
      background: isStays ? 'var(--primary)' : '#fff',
      color: isStays ? '#fff' : 'var(--text)',
      border: `1px solid ${isStays ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 9999, padding: '8px 16px 8px 8px',
      cursor: 'pointer', font: 'inherit', boxShadow: 'var(--shadow-sm)',
      transition: 'all 200ms var(--ease-standard)',
    }}>
      {/* Flip switch */}
      <span style={{
        width: 44, height: 26, borderRadius: 9999,
        background: isStays ? 'rgba(255,255,255,0.25)' : 'var(--surface-alt)',
        border: `1px solid ${isStays ? 'rgba(255,255,255,0.35)' : 'var(--border)'}`,
        position: 'relative', flexShrink: 0,
        transition: 'background 200ms',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: isStays ? 20 : 2,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff', transition: 'left 200ms var(--ease-standard)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={isStays ? 'van' : 'flag'} size={11} color="var(--primary)"/>
        </span>
      </span>
      <span style={{
        fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
      }}>
        {isStays ? 'Stays only' : 'All courses'}
      </span>
      <span style={{
        fontSize: 12, fontWeight: 500,
        background: isStays ? 'rgba(255,255,255,0.18)' : 'var(--surface-alt)',
        color: isStays ? '#fff' : 'var(--text-muted)',
        padding: '3px 8px', borderRadius: 9999,
      }}>
        {isStays ? staysCount : totalCount}
      </span>
    </button>
  );
};

// V4 – inline inside search bar (left-side prefix that toggles)
const SearchWithStaysToggle = ({ stayMode, onStayChange, onChangeQuery, query }) => {
  const isStays = stayMode === 'stays-only';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: '#fff', border: '1px solid var(--border)', borderRadius: 9999,
      boxShadow: 'var(--shadow-sm)', height: 48, paddingLeft: 4, paddingRight: 4,
      width: '100%', maxWidth: 520,
    }}>
      <button onClick={() => onStayChange(isStays ? 'all' : 'stays-only')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: isStays ? 'var(--primary)' : 'var(--surface-alt)',
        color: isStays ? '#fff' : 'var(--text)',
        border: 0, height: 40, borderRadius: 9999, padding: '0 14px',
        font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        flexShrink: 0,
      }}>
        <Icon name={isStays ? 'van' : 'flag'} size={14}/>
        {isStays ? 'Stays' : 'All'}
        <Icon name="chevron" size={12}/>
      </button>
      <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }}/>
      <Icon name="search" size={16} color="var(--text-muted)" style={{ marginLeft: 8 }}/>
      <input value={query || ''} onChange={e => onChangeQuery?.(e.target.value)}
        placeholder="Search by course or town" style={{
          flex: 1, border: 0, outline: 0, background: 'transparent',
          font: 'inherit', fontSize: 14, padding: '0 10px', minWidth: 0,
          color: 'var(--text)',
        }}/>
    </div>
  );
};

window.StayIcon = StayIcon;
window.STAY_TYPE_LABELS = STAY_TYPE_LABELS;
window.CourseCard = CourseCard;
window.NZMap = NZMap;
window.StaysToggleV1 = StaysToggleV1;
window.StaysToggleV2 = StaysToggleV2;
window.StaysToggleV3 = StaysToggleV3;
window.SearchWithStaysToggle = SearchWithStaysToggle;
