export function IntroLotusArt() {
  return (
    <svg
      className="zhaowu-lotus-vector"
      viewBox="0 0 1080 1920"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden
    >
      <defs>
        <linearGradient id="intro-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7e9c9" />
          <stop offset="0.56" stopColor="#f2dfb8" />
          <stop offset="1" stopColor="#dfbf83" />
        </linearGradient>
        <radialGradient id="intro-sun" cx="50%" cy="52%" r="48%">
          <stop offset="0" stopColor="#fff8d9" stopOpacity="0.98" />
          <stop offset="0.26" stopColor="#ffd978" stopOpacity="0.52" />
          <stop offset="0.64" stopColor="#f2bf53" stopOpacity="0.12" />
          <stop offset="1" stopColor="#f2bf53" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="intro-petal" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff1be" />
          <stop offset="0.56" stopColor="#ffd7bd" />
          <stop offset="1" stopColor="#e88791" />
        </linearGradient>
        <linearGradient id="intro-petal-soft" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff6d7" />
          <stop offset="0.7" stopColor="#f8c8b8" />
          <stop offset="1" stopColor="#e88b96" />
        </linearGradient>
        <linearGradient id="intro-stem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#657847" />
          <stop offset="0.5" stopColor="#96a15e" />
          <stop offset="1" stopColor="#5e7444" />
        </linearGradient>
        <linearGradient id="intro-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3dfae" stopOpacity="0.02" />
          <stop offset="1" stopColor="#be9658" stopOpacity="0.42" />
        </linearGradient>
        <filter id="intro-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>

      <rect width="1080" height="1920" fill="url(#intro-paper)" />
      <circle className="intro-vector-glow" cx="540" cy="1030" r="390" fill="url(#intro-sun)" />

      <g className="intro-vector-branch" fill="none" stroke="#896f47" strokeLinecap="round">
        <path d="M1140 110 C960 150 930 258 792 278 C685 294 634 348 552 405" strokeWidth="11" />
        <path d="M900 243 C838 205 794 166 728 153" strokeWidth="5" />
        <path d="M770 285 C716 249 670 240 613 255" strokeWidth="4" />
        <path d="M655 340 C592 318 530 326 462 370" strokeWidth="4" />
        <path d="M565 400 C507 411 450 454 407 507" strokeWidth="3" />
      </g>
      <g className="intro-vector-leaves" fill="#a88a51">
        <ellipse cx="786" cy="170" rx="20" ry="39" transform="rotate(-54 786 170)" />
        <ellipse cx="739" cy="153" rx="17" ry="34" transform="rotate(-24 739 153)" />
        <ellipse cx="830" cy="213" rx="18" ry="34" transform="rotate(51 830 213)" />
        <ellipse cx="691" cy="251" rx="18" ry="35" transform="rotate(-65 691 251)" />
        <ellipse cx="625" cy="279" rx="17" ry="33" transform="rotate(48 625 279)" />
        <ellipse cx="579" cy="346" rx="17" ry="34" transform="rotate(-53 579 346)" />
        <ellipse cx="492" cy="390" rx="15" ry="31" transform="rotate(58 492 390)" />
        <ellipse cx="441" cy="460" rx="14" ry="29" transform="rotate(-34 441 460)" />
      </g>
      <g className="intro-vector-seeds" fill="#a67d3f">
        {[
          [796, 233], [808, 260], [800, 288], [811, 315],
          [637, 315], [646, 343], [639, 371], [649, 398],
          [478, 435], [487, 462], [481, 489], [489, 516],
        ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" />)}
      </g>

      <rect y="1325" width="1080" height="595" fill="url(#intro-water)" />
      <g className="intro-vector-pads" fill="#8f8b60" opacity="0.28">
        <ellipse cx="150" cy="1540" rx="150" ry="44" transform="rotate(-8 150 1540)" />
        <ellipse cx="936" cy="1508" rx="132" ry="40" transform="rotate(7 936 1508)" />
        <ellipse cx="66" cy="1745" rx="170" ry="50" transform="rotate(6 66 1745)" />
        <ellipse cx="1000" cy="1738" rx="160" ry="47" transform="rotate(-4 1000 1738)" />
      </g>

      <g className="intro-vector-ripples" fill="none" stroke="#d8a94c" strokeWidth="5">
        <ellipse className="intro-vector-ripple intro-vector-ripple--1" cx="540" cy="1580" rx="116" ry="31" />
        <ellipse className="intro-vector-ripple intro-vector-ripple--2" cx="540" cy="1580" rx="205" ry="53" />
        <ellipse className="intro-vector-ripple intro-vector-ripple--3" cx="540" cy="1580" rx="306" ry="77" />
      </g>

      <path d="M540 1590 C540 1425 540 1230 540 1090" stroke="url(#intro-stem)" strokeWidth="22" fill="none" strokeLinecap="round" />
      <path d="M540 1165 C522 1110 495 1065 452 1022" stroke="url(#intro-stem)" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M540 1165 C560 1110 588 1064 630 1022" stroke="url(#intro-stem)" strokeWidth="18" fill="none" strokeLinecap="round" />

      <g className="intro-lotus-stage intro-lotus-stage--1">
        <g className="intro-bud intro-bud--left">
          <path d="M452 1044 C385 992 392 878 452 780 C512 878 519 992 452 1044Z" fill="url(#intro-petal)" />
          <path d="M451 1032 C413 978 421 892 451 823 C481 892 489 978 451 1032Z" fill="url(#intro-petal-soft)" />
        </g>
        <g className="intro-bud intro-bud--right">
          <path d="M628 1044 C561 992 568 878 628 780 C688 878 695 992 628 1044Z" fill="url(#intro-petal)" />
          <path d="M629 1032 C591 978 599 892 629 823 C659 892 667 978 629 1032Z" fill="url(#intro-petal-soft)" />
        </g>
      </g>

      <g className="intro-lotus-stage intro-lotus-stage--2" fill="url(#intro-petal)">
        <g className="intro-flower intro-flower--left">
          <ellipse cx="452" cy="905" rx="46" ry="137" transform="rotate(0 452 1016)" />
          <ellipse cx="424" cy="927" rx="44" ry="126" transform="rotate(-24 452 1016)" />
          <ellipse cx="481" cy="927" rx="44" ry="126" transform="rotate(24 452 1016)" />
          <ellipse cx="398" cy="963" rx="39" ry="110" transform="rotate(-44 452 1016)" />
          <ellipse cx="506" cy="963" rx="39" ry="110" transform="rotate(44 452 1016)" />
        </g>
        <g className="intro-flower intro-flower--right">
          <ellipse cx="628" cy="905" rx="46" ry="137" transform="rotate(0 628 1016)" />
          <ellipse cx="600" cy="927" rx="44" ry="126" transform="rotate(-24 628 1016)" />
          <ellipse cx="657" cy="927" rx="44" ry="126" transform="rotate(24 628 1016)" />
          <ellipse cx="574" cy="963" rx="39" ry="110" transform="rotate(-44 628 1016)" />
          <ellipse cx="682" cy="963" rx="39" ry="110" transform="rotate(44 628 1016)" />
        </g>
      </g>

      <g className="intro-lotus-stage intro-lotus-stage--3" fill="url(#intro-petal-soft)">
        <g className="intro-flower intro-flower--left">
          {[-65, -45, -25, 0, 25, 45, 65].map((angle) => (
            <ellipse key={`l3-${angle}`} cx="452" cy="898" rx="42" ry="145" transform={`rotate(${angle} 452 1018)`} />
          ))}
        </g>
        <g className="intro-flower intro-flower--right">
          {[-65, -45, -25, 0, 25, 45, 65].map((angle) => (
            <ellipse key={`r3-${angle}`} cx="628" cy="898" rx="42" ry="145" transform={`rotate(${angle} 628 1018)`} />
          ))}
        </g>
      </g>

      <g className="intro-lotus-stage intro-lotus-stage--4">
        <g className="intro-flower intro-flower--left" fill="url(#intro-petal-soft)">
          {[-78, -60, -42, -24, -8, 8, 24, 42, 60, 78].map((angle) => (
            <ellipse key={`l4-${angle}`} cx="452" cy="900" rx="40" ry="150" transform={`rotate(${angle} 452 1020)`} />
          ))}
          <ellipse cx="452" cy="1000" rx="58" ry="30" fill="#ddb654" />
          <circle cx="452" cy="995" r="25" fill="#f0cf70" />
        </g>
        <g className="intro-flower intro-flower--right" fill="url(#intro-petal-soft)">
          {[-78, -60, -42, -24, -8, 8, 24, 42, 60, 78].map((angle) => (
            <ellipse key={`r4-${angle}`} cx="628" cy="900" rx="40" ry="150" transform={`rotate(${angle} 628 1020)`} />
          ))}
          <ellipse cx="628" cy="1000" rx="58" ry="30" fill="#ddb654" />
          <circle cx="628" cy="995" r="25" fill="#f0cf70" />
        </g>
      </g>

      <g className="intro-vector-sparkles" fill="#fff7cf">
        <circle cx="540" cy="786" r="6" />
        <circle cx="497" cy="838" r="4" />
        <circle cx="586" cy="850" r="5" />
        <circle cx="520" cy="718" r="3" />
        <circle cx="613" cy="755" r="3" />
      </g>
    </svg>
  );
}
