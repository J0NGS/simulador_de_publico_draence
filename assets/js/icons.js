/**
 * ============================================
 * DRAENCE — CONJUNTO DE ÍCONES
 * ============================================
 * Sprite SVG injetado no início do <body>. Uso no HTML:
 *   <svg class="icon"><use href="#i-shirt"></use></svg>
 *
 * Ícones: Lucide (https://lucide.dev) — ISC License,
 * Copyright (c) Lucide Icons and Contributors.
 * "i-ball" (bola de futebol) desenhado no mesmo grid/estilo.
 * ============================================
 */
(function () {
    const symbols = [
    '<symbol id="i-calculator" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/> <line x1="8" x2="16" y1="6" y2="6"/> <line x1="16" x2="16" y1="14" y2="18"/> <path d="M16 10h.01"/> <path d="M12 10h.01"/> <path d="M8 10h.01"/> <path d="M12 14h.01"/> <path d="M8 14h.01"/> <path d="M12 18h.01"/> <path d="M8 18h.01"/></symbol>',
    '<symbol id="i-table-2" viewBox="0 0 24 24"><path d="M3 9h18"/> <path d="M9 3v18"/> <rect x="3" y="3" width="18" height="18" rx="2"/></symbol>',
    '<symbol id="i-circle-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/> <path d="M12 17h.01"/></symbol>',
    '<symbol id="i-arrow-left" viewBox="0 0 24 24"><path d="m12 19-7-7 7-7"/> <path d="M19 12H5"/></symbol>',
    '<symbol id="i-log-out" viewBox="0 0 24 24"><path d="m16 17 5-5-5-5"/> <path d="M21 12H9"/> <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></symbol>',
    '<symbol id="i-shirt" viewBox="0 0 24 24"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></symbol>',
    '<symbol id="i-file-signature" viewBox="0 0 24 24"><path d="M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z"/> <path d="M14.487 7.858A1 1 0 0 1 14 7V2"/> <path d="M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516"/> <path d="M8 18h1"/></symbol>',
    '<symbol id="i-sliders-horizontal" viewBox="0 0 24 24"><path d="M10 5H3"/> <path d="M12 19H3"/> <path d="M14 3v4"/> <path d="M16 17v4"/> <path d="M21 12h-9"/> <path d="M21 19h-5"/> <path d="M21 5h-7"/> <path d="M8 10v4"/> <path d="M8 12H3"/></symbol>',
    '<symbol id="i-map-pin" viewBox="0 0 24 24"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/> <circle cx="12" cy="10" r="3"/></symbol>',
    '<symbol id="i-cake" viewBox="0 0 24 24"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/> <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/> <path d="M2 21h20"/> <path d="M7 8v3"/> <path d="M12 8v3"/> <path d="M17 8v3"/> <path d="M7 4h.01"/> <path d="M12 4h.01"/> <path d="M17 4h.01"/></symbol>',
    '<symbol id="i-star" viewBox="0 0 24 24"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></symbol>',
    '<symbol id="i-smile" viewBox="0 0 24 24"><path d="M15 10V9"/> <path d="M16.472 15a6 6 0 01-8.943 0"/> <path d="M9 10V9"/> <circle cx="12" cy="12" r="10"/></symbol>',
    '<symbol id="i-calendar-clock" viewBox="0 0 24 24"><path d="M16 14v2.2l1.6 1"/> <path d="M16 2v3"/> <path d="M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338"/> <path d="M3 9h5.859"/> <path d="M8 2v3"/> <circle cx="16" cy="16" r="6"/></symbol>',
    '<symbol id="i-banknote" viewBox="0 0 24 24"><rect width="20" height="12" x="2" y="6" rx="2"/> <circle cx="12" cy="12" r="2"/> <path d="M6 12h.01M18 12h.01"/></symbol>',
    '<symbol id="i-hand-coins" viewBox="0 0 24 24"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/> <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/> <path d="m2 16 6 6"/> <circle cx="16" cy="9" r="2.9"/> <circle cx="6" cy="5" r="3"/></symbol>',
    '<symbol id="i-rotate-ccw" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/> <path d="M3 3v5h5"/></symbol>',
    '<symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14"/> <path d="m12 5 7 7-7 7"/></symbol>',
    '<symbol id="i-copy" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/> <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></symbol>',
    '<symbol id="i-funnel" viewBox="0 0 24 24"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></symbol>',
    '<symbol id="i-chevron-left" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></symbol>',
    '<symbol id="i-chevron-right" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></symbol>',
    '<symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14"/> <path d="M12 5v14"/></symbol>',
    '<symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18"/> <path d="m6 6 12 12"/></symbol>',
    '<symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/> <circle cx="12" cy="12" r="6"/> <circle cx="12" cy="12" r="2"/></symbol>',
    '<symbol id="i-scale" viewBox="0 0 24 24"><path d="M12 3v18"/> <path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/> <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/> <path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/> <path d="M7 21h10"/></symbol>',
    '<symbol id="i-list" viewBox="0 0 24 24"><path d="M3 5h.01"/> <path d="M3 12h.01"/> <path d="M3 19h.01"/> <path d="M8 5h13"/> <path d="M8 12h13"/> <path d="M8 19h13"/></symbol>',
    '<symbol id="i-sigma" viewBox="0 0 24 24"><path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/></symbol>',
    '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></symbol>',
    '<symbol id="i-trending-up" viewBox="0 0 24 24"><path d="M16 7h6v6"/> <path d="m22 7-8.5 8.5-5-5L2 17"/></symbol>',
    '<symbol id="i-handshake" viewBox="0 0 24 24"><path d="m11 17 2 2a1 1 0 1 0 3-3"/> <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/> <path d="m21 3 1 11h-2"/> <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/> <path d="M3 4h8"/></symbol>',
    '<symbol id="i-wallet" viewBox="0 0 24 24"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/> <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></symbol>',
    '<symbol id="i-trophy" viewBox="0 0 24 24"><path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/> <path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/> <path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/> <path d="M4 22h16"/> <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/> <path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/></symbol>',
    '<symbol id="i-scroll-text" viewBox="0 0 24 24"><path d="M15 12h-5"/> <path d="M15 8h-5"/> <path d="M19 17V5a2 2 0 0 0-2-2H4"/> <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></symbol>',
    '<symbol id="i-message-circle" viewBox="0 0 24 24"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></symbol>',
    '<symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/> <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/> <path d="M2 12h20"/></symbol>',
    '<symbol id="i-credit-card" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/> <line x1="2" x2="22" y1="10" y2="10"/> <path d="M6 14h2"/></symbol>',
    '<symbol id="i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48"/> <path d="M15 6h1v4"/> <path d="m6.134 14.768.866-.5 2 3.464"/> <circle cx="16" cy="8" r="6"/></symbol>',
    '<symbol id="i-chart-column" viewBox="0 0 24 24"><path d="M3 3v16a2 2 0 0 0 2 2h16"/> <path d="M18 17V9"/> <path d="M13 17V5"/> <path d="M8 17v-3"/></symbol>',
    '<symbol id="i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16-4 4-4-4"/> <path d="M17 20V4"/> <path d="m3 8 4-4 4 4"/> <path d="M7 4v16"/></symbol>',
    '<symbol id="i-lightbulb" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/> <path d="M9 18h6"/> <path d="M10 22h4"/></symbol>',
    '<symbol id="i-cog" viewBox="0 0 24 24"><path d="M11 10.27 7 3.34"/> <path d="m11 13.73-4 6.93"/> <path d="M12 22v-2"/> <path d="M12 2v2"/> <path d="M14 12h8"/> <path d="m17 20.66-1-1.73"/> <path d="m17 3.34-1 1.73"/> <path d="M2 12h2"/> <path d="m20.66 17-1.73-1"/> <path d="m20.66 7-1.73 1"/> <path d="m3.34 17 1.73-1"/> <path d="m3.34 7 1.73 1"/> <circle cx="12" cy="12" r="2"/> <circle cx="12" cy="12" r="8"/></symbol>',
    '<symbol id="i-zap" viewBox="0 0 24 24"><path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/></symbol>',
    '<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>',
    '<symbol id="i-whistle" viewBox="0 0 24 24"><path d="M10 6v4"/> <path d="M21 6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.675A7 7 0 1 1 9 6z"/></symbol>',
    '<symbol id="i-goal" viewBox="0 0 24 24"><path d="M12 13V2l8 4-8 4"/> <path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/> <path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/></symbol>',
    '<symbol id="i-gauge" viewBox="0 0 24 24"><path d="m12 14 4-4"/> <path d="M3.34 19a10 10 0 1 1 17.32 0"/></symbol>',
    '<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/> <circle cx="12" cy="7" r="4"/></symbol>',
    '<symbol id="i-send" viewBox="0 0 24 24"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/> <path d="m21.854 2.147-10.94 10.939"/></symbol>',
    '<symbol id="i-badge-percent" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/> <path d="m15 9-6 6"/> <path d="M9 9h.01"/> <path d="M15 15h.01"/></symbol>',
    '<symbol id="i-ball" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m12 7.5 4.3 3.1-1.6 5H9.3l-1.6-5z"/><path d="M12 7.5V2.2M16.3 10.6l4.8-1.6M14.7 15.6l2.9 4.1M9.3 15.6l-2.9 4.1M7.7 10.6 2.9 9"/></symbol>',
    '<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/> <path d="M12 2v2"/> <path d="M12 20v2"/> <path d="m4.93 4.93 1.41 1.41"/> <path d="m17.66 17.66 1.41 1.41"/> <path d="M2 12h2"/> <path d="M20 12h2"/> <path d="m6.34 17.66-1.41 1.41"/> <path d="m19.07 4.93-1.41 1.41"/></symbol>',
    '<symbol id="i-moon" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></symbol>',
    '<symbol id="i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <circle cx="9" cy="7" r="4"/> <path d="M22 21v-2a4 4 0 0 0-3-3.87"/> <path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>',
    '<symbol id="i-ticket" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/> <path d="M13 5v2"/> <path d="M13 17v2"/> <path d="M13 11v2"/></symbol>',
    '<symbol id="i-landmark" viewBox="0 0 24 24"><path d="M10 18v-7"/> <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/> <path d="M14 18v-7"/> <path d="M18 18v-7"/> <path d="M3 22h18"/> <path d="M6 18v-7"/></symbol>',
    '<symbol id="i-gem" viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 13L2 9Z"/> <path d="M11 3 8 9l4 13 4-13-3-6"/> <path d="M2 9h20"/></symbol>',
    '<symbol id="i-tag" viewBox="0 0 24 24"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/> <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></symbol>',
    '<symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/> <path d="M12 16v-4"/> <path d="M12 8h.01"/></symbol>',
    '<symbol id="i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/> <path d="M12 9v4"/> <path d="M12 17h.01"/></symbol>',
    '<symbol id="i-circle-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/> <path d="M12 8v4"/> <path d="M12 16h.01"/></symbol>',
    '<symbol id="i-circle-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/> <path d="m9 12 2 2 4-4"/></symbol>',
    '<symbol id="i-trending-down" viewBox="0 0 24 24"><path d="M16 17h6v-6"/> <path d="m22 17-8.5-8.5-5 5L2 7"/></symbol>',
    '<symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>',
    ];

    const sprite =
        '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden" ' +
        'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        symbols.join('') +
        '</svg>';

    document.body.insertAdjacentHTML('afterbegin', sprite);
})();
