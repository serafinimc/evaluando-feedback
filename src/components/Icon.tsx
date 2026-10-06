import type { ReactNode } from 'react'

interface IconProps {
  name:
      | 'questions'
      | 'history'
      | 'plus'
      | 'close'
      | 'more'
      | 'download'
      | 'upload'
      | 'trash'
      | 'lock'
      | 'check'
  size?: number
}

export function Icon({ name, size = 24 }: IconProps) {
  const paths: Record<IconProps['name'], ReactNode> = {
    questions: (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M4 5.5v15A2.5 2.5 0 0 1 6.5 18" />
          <path d="M8 7h8M8 11h6" />
        </>
    ),

    history: (
        <>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5M12 7v5l3 2" />
        </>
    ),

    plus: <path d="M12 5v14M5 12h14" />,

    close: <path d="m6 6 12 12M18 6 6 18" />,

    more: (
        <>
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </>
    ),

    download: (
        <>
          <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
          <path d="M5 19h14" />
        </>
    ),

    upload: (
        <>
          <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
          <path d="M5 20h14" />
        </>
    ),

    trash: (
        <>
          <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
          <path d="M10 11v5M14 11v5" />
        </>
    ),

    lock: (
        <>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </>
    ),

    check: (
        <>
          {/* Hoja */}
          <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="2.5"
          />

          {/* Primera caja */}
          <rect
              x="4.5"
              y="5"
              width="5"
              height="5"
              rx=".6"
          />

          {/* Check */}
          <path
              d="M5.5 7.4 6.9 8.7 9.2 6"
              stroke="#28a99e"
              strokeWidth="1.6"
          />

          {/* Primera línea */}
          <path d="M12 7.5h6.5" />

          {/* Segunda caja */}
          <rect
              x="4.5"
              y="14"
              width="5"
              height="5"
              rx=".6"
          />

          {/* Segunda línea */}
          <path d="M12 16.5h6.5" />
        </>
    ),
  }

  return (
      <svg
          className="icon"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
      >
        {paths[name]}
      </svg>
  )
}