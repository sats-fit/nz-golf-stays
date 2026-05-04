/* global React */
// Lucide-style line icons. 1.5px stroke, rounded caps. All inline SVG.

const Icon = ({ name, size = 18, stroke = 1.5, color = 'currentColor', fill = 'none', ...rest }) => {
  const paths = {
    search:    <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    'map-pin': <><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></>,
    flag:      <><path d="M5 21V4l13 4-13 4"/></>,
    van:       <><rect x="2" y="8" width="14" height="9" rx="2"/><path d="M16 12h4l2 3v2h-6"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    power:     <><path d="M12 3v6"/><path d="M5 9h14l-2 11H7z"/></>,
    paw:       <><circle cx="6.5" cy="11" r="1.5"/><circle cx="11" cy="6" r="1.5"/><circle cx="17" cy="11" r="1.5"/><circle cx="13" cy="6" r="1.5"/><path d="M8 16c0-2 2-3 4-3s4 1 4 3-2 4-4 4-4-2-4-4z"/></>,
    waves:     <><path d="M3 12c4-6 14-6 18 0"/><path d="M3 16c5-4 13-4 18 0"/><path d="M3 8c5-2 13-2 18 0"/></>,
    heart:     <path d="M12 21s-7.5-4.5-7.5-11.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7.5 3.5C19.5 16.5 12 21 12 21z"/>,
    'heart-fill': <path d="M12 21s-7.5-4.5-7.5-11.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7.5 3.5C19.5 16.5 12 21 12 21z"/>,
    star:      <path d="M12 3l2.6 5.5 6 .9-4.4 4.2 1 6-5.2-2.8-5.2 2.8 1-6L3.4 9.4l6-.9z"/>,
    'star-fill': <path d="M12 3l2.6 5.5 6 .9-4.4 4.2 1 6-5.2-2.8-5.2 2.8 1-6L3.4 9.4l6-.9z"/>,
    chevron:   <path d="m6 9 6 6 6-6"/>,
    'chevron-up': <path d="m6 15 6-6 6 6"/>,
    'chevron-right': <path d="m9 6 6 6-6 6"/>,
    arrow:     <><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></>,
    user:      <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    menu:      <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    close:     <><path d="M6 6l12 12"/><path d="M18 6l-12 12"/></>,
    droplet:   <path d="M12 3s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z"/>,
    wifi:      <><path d="M2 9a16 16 0 0 1 20 0"/><path d="M5 13a11 11 0 0 1 14 0"/><path d="M8.5 16.5a6 6 0 0 1 7 0"/><circle cx="12" cy="20" r="0.7"/></>,
    calendar:  <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    sliders:   <><path d="M4 6h11"/><path d="M19 6h1"/><circle cx="17" cy="6" r="2"/><path d="M4 12h3"/><path d="M11 12h9"/><circle cx="9" cy="12" r="2"/><path d="M4 18h13"/><path d="M21 18h-1"/><circle cx="19" cy="18" r="2"/></>,
    list:      <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="0.7"/><circle cx="4" cy="12" r="0.7"/><circle cx="4" cy="18" r="0.7"/></>,
    map:       <><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/></>,
    split:     <><rect x="3" y="4" width="8" height="16" rx="1"/><rect x="13" y="4" width="8" height="16" rx="1"/></>,
    plug:      <><path d="M9 3v6"/><path d="M15 3v6"/><path d="M7 9h10v3a5 5 0 0 1-10 0z"/><path d="M12 17v4"/></>,
    dollar:    <><path d="M12 4v16"/><path d="M16 8a4 4 0 0 0-4-2 3 3 0 0 0-1 5.8l3 1.4A3 3 0 0 1 12 18a4 4 0 0 1-4-2"/></>,
    info:      <><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.7"/></>,
    phone:     <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>,
    globe:     <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>,
    pin:       <><path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></>,
    edit:      <><path d="M14 4l5 5"/><path d="M4 20v-4l11-11 4 4-11 11z"/></>,
    plus:      <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    minus:     <path d="M5 12h14"/>,
    grip:      <><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></>,
    check:     <path d="m5 12 5 5 9-11"/>,
    filter:    <path d="M4 5h16l-6 8v6l-4-2v-4z"/>,
    target:    <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
  };
  const filledNames = new Set(['heart-fill', 'star-fill']);
  const isFilled = filledNames.has(name);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
         fill={isFilled ? color : fill}
         stroke={color} strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths[name]}
    </svg>
  );
};

window.Icon = Icon;
