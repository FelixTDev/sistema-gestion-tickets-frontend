import type { ReactElement, ReactNode, SVGProps } from 'react'

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }
export type IconComponent = (props: IconProps) => ReactElement

function icon(path: ReactNode): IconComponent {
  return function GnbIcon({ size = 20, ...props }: IconProps) {
    return (
      <svg
        {...props}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {path}
      </svg>
    )
  }
}

export const Icon = {
  home: icon(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>),
  ticket: icon(<><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 1 0-4Z" /><path d="M15 6v12" strokeDasharray="2 2" /></>),
  plus: icon(<path d="M12 5v14M5 12h14" />),
  chat: icon(<><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" /><path d="M8 9h8M8 12.5h5" /></>),
  bot: icon(<><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 8V4M9 4h6" /><circle cx="9" cy="13" r="1" fill="currentColor" /><circle cx="15" cy="13" r="1" fill="currentColor" /></>),
  chart: icon(<><path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="8" rx="1" /><rect x="12.5" y="6" width="3" height="12" rx="1" /><rect x="18" y="13" width="3" height="5" rx="1" /></>),
  report: icon(<><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /><path d="M9 13h7M9 17h5" /></>),
  users: icon(<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5M22 20a6 6 0 0 0-4-5.6" /></>),
  book: icon(<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 5v14" /></>),
  search: icon(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></>),
  filter: icon(<path d="M3 5h18l-7 8v6l-4 2v-8z" />),
  bell: icon(<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
  logout: icon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>),
  menu: icon(<path d="M3 6h18M3 12h18M3 18h18" />),
  x: icon(<path d="M6 6l12 12M18 6 6 18" />),
  check: icon(<path d="M20 6 9 17l-5-5" />),
  chevron: icon(<path d="m6 9 6 6 6-6" />),
  chevronR: icon(<path d="m9 6 6 6-6 6" />),
  arrowL: icon(<path d="M19 12H5M12 19l-7-7 7-7" />),
  clock: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  info: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
  warn: icon(<><path d="M10.3 3.7 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>),
  alert: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></>),
  eye: icon(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>),
  eyeOff: icon(<><path d="M3 3l18 18" /><path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a15 15 0 0 1-3.3 3.9M6.6 6.7A15 15 0 0 0 2 12s3.5 6 10 6c1.3 0 2.5-.2 3.6-.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>),
  send: icon(<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />),
  edit: icon(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>),
  trash: icon(<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />),
  tag: icon(<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></>),
  flag: icon(<path d="M4 22V4M4 4h13l-2 4 2 4H4" />),
  mail: icon(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m3 6 9 7 9-7" /></>),
  lock: icon(<><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>),
  shield: icon(<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="m9 12 2 2 4-4" /></>),
  inbox: icon(<><path d="M3 12h5l2 3h4l2-3h5" /><path d="M4 5h16l1 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" /></>),
  grid: icon(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  calendar: icon(<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>),
  refresh: icon(<path d="M21 12a9 9 0 1 1-3-6.7M21 4v4h-4" />),
  compass: icon(<><circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-4 1 2-5z" /></>),
} as const
