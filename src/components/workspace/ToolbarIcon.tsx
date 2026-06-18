import type { ReactNode } from 'react'

type ToolbarIconName =
  | 'heading'
  | 'note'
  | 'todo'
  | 'link'
  | 'image'
  | 'document'
  | 'table'
  | 'column'
  | 'connector'
  | 'back'
  | 'crop'
  | 'swatch'
  | 'draw'
  | 'marker'
  | 'eraser'
  | 'color-black'
  | 'color-red'
  | 'color-custom'
  | 'size-small'
  | 'size-medium'
  | 'size-large'
  | 'done'
  | 'style'
  | 'title'
  | 'cell-type'
  | 'formula'
  | 'align'
  | 'add-column'
  | 'add-row'
  | 'fit'
  | 'open'
  | 'duplicate'
  | 'delete'
  | 'settings'

type ToolbarIconProps = {
  name: ToolbarIconName
}

const roundedStroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 2.15,
}

const roundedStrokeStrong = {
  ...roundedStroke,
  strokeWidth: 2.35,
}

const roundedStrokeSoft = {
  ...roundedStroke,
  strokeWidth: 1.95,
}

const framedStroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinejoin: 'round' as const,
  strokeWidth: 2.05,
}

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  )
}

function ToolbarIcon({ name }: ToolbarIconProps) {
  switch (name) {
    case 'heading':
      return (
        <IconFrame>
          <path d="M7 5.75v12.5M17 5.75v12.5M7 12h10" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'note':
      return (
        <IconFrame>
          <path
            d="M8 4.75h6.25L18.75 9v9.25A1.75 1.75 0 0 1 17 20H8a1.75 1.75 0 0 1-1.75-1.75V6.5A1.75 1.75 0 0 1 8 4.75Z"
            {...framedStroke}
          />
          <path d="M14.25 4.75V9h4.5M9 12h6.25M9 15.25h6.25M9 18.5h4.25" {...roundedStroke} />
        </IconFrame>
      )
    case 'todo':
      return (
        <IconFrame>
          <rect x="5.5" y="5.75" width="3.75" height="3.75" rx="0.95" {...framedStroke} />
          <path d="m6.6 7.65 1 1 1.75-2" {...roundedStrokeSoft} />
          <path d="M11.25 7.65H18" {...roundedStrokeStrong} />
          <rect x="5.5" y="10.95" width="3.75" height="3.75" rx="0.95" {...framedStroke} />
          <path d="M11.25 12.85H18" {...roundedStrokeStrong} />
          <rect x="5.5" y="16.15" width="3.75" height="3.75" rx="0.95" {...framedStroke} />
          <path d="M11.25 18.05H18" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'link':
      return (
        <IconFrame>
          <path
            d="M10.35 13.65 8.55 15.45a3.15 3.15 0 0 1-4.45-4.45l2.45-2.45A3.15 3.15 0 0 1 11 8.55"
            {...roundedStroke}
          />
          <path
            d="m13.65 10.35 1.8-1.8a3.15 3.15 0 0 1 4.45 4.45l-2.45 2.45A3.15 3.15 0 0 1 13 15.45"
            {...roundedStroke}
          />
          <path d="M9.6 14.4h4.8" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'image':
      return (
        <IconFrame>
          <rect x="4.75" y="5.25" width="14.5" height="13.5" rx="2.25" {...framedStroke} />
          <circle cx="9" cy="9.75" r="1.45" fill="currentColor" />
          <path d="m7 16.4 3.35-3.65 2.55 2.55 2.5-3 2.6 4.1" {...roundedStroke} />
        </IconFrame>
      )
    case 'document':
      return (
        <IconFrame>
          <path
            d="M8 4.75h7L19.25 9v9.25A1.75 1.75 0 0 1 17.5 20h-9A1.75 1.75 0 0 1 6.75 18.25V6.5A1.75 1.75 0 0 1 8 4.75Z"
            {...framedStroke}
          />
          <path d="M15 4.75V9h4.25" {...roundedStrokeSoft} />
          <path d="M9 12.1h6.2M9 15.35h6.2M9 18.6h4.1" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'table':
      return (
        <IconFrame>
          <rect x="4.75" y="5.25" width="14.5" height="13.5" rx="2" {...framedStroke} />
          <path d="M4.75 9.9h14.5M4.75 14.45h14.5M9.6 5.25v13.5M14.5 5.25v13.5" {...roundedStrokeSoft} />
        </IconFrame>
      )
    case 'column':
      return (
        <IconFrame>
          <rect x="5.5" y="4.75" width="13" height="14.5" rx="2.25" {...framedStroke} />
          <path d="M5.5 8.35h13" {...roundedStrokeSoft} />
          <rect x="8" y="10.45" width="8" height="2.2" rx="1.1" {...framedStroke} />
          <rect x="8" y="14.25" width="5.8" height="2.2" rx="1.1" {...framedStroke} />
        </IconFrame>
      )
    case 'connector':
      return (
        <IconFrame>
          <circle cx="7" cy="7.5" r="2.2" {...framedStroke} />
          <circle cx="17" cy="16.5" r="2.2" {...framedStroke} />
          <path d="M9.3 8.8c2.25 0 3.95.8 5.25 2.1 1.3 1.3 2.05 2.95 2.15 5.3" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'back':
      return (
        <IconFrame>
          <path d="M18 12H7.7M11.7 7.5 7.2 12l4.5 4.5" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'crop':
      return (
        <IconFrame>
          <path d="M7 4.75v9.5A2.75 2.75 0 0 0 9.75 17H19.25M4.75 7h9.5A2.75 2.75 0 0 1 17 9.75v9.5" {...roundedStroke} />
        </IconFrame>
      )
    case 'swatch':
      return (
        <IconFrame>
          <circle cx="12" cy="12" r="6.35" fill="currentColor" stroke="rgba(29, 45, 40, 0.26)" strokeWidth="2.1" />
        </IconFrame>
      )
    case 'draw':
      return (
        <IconFrame>
          <path
            d="m5.2 18.8 4.05-.95 8.35-8.35a1.95 1.95 0 0 0 0-2.75l-.35-.35a1.95 1.95 0 0 0-2.75 0L6.15 14.75 5.2 18.8Z"
            {...roundedStroke}
          />
          <path d="m13.4 7.45 3.15 3.15" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'marker':
      return (
        <IconFrame>
          <path
            d="m5.45 18.7 4.95-1.25 7.1-7.1-3.9-3.9-7.1 7.1-1.05 5.15Z"
            {...roundedStroke}
          />
          <path d="m13.55 6.45 3.9 3.9" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'eraser':
      return (
        <IconFrame>
          <path
            d="m8.65 5.85 8.5 8.5a1.8 1.8 0 0 1 0 2.55l-1.9 1.9a1.8 1.8 0 0 1-2.55 0l-8.5-8.5a1.8 1.8 0 0 1 0-2.55l1.9-1.9a1.8 1.8 0 0 1 2.55 0Z"
            {...roundedStroke}
          />
          <path d="M13.2 18.45H19.2" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'color-black':
    case 'color-red':
      return (
        <IconFrame>
          <circle cx="12" cy="12" r="6.3" fill="currentColor" stroke="currentColor" strokeWidth="2.1" />
        </IconFrame>
      )
    case 'color-custom':
      return (
        <IconFrame>
          <circle cx="12" cy="12" r="5.95" fill="currentColor" stroke="currentColor" strokeWidth="2.1" />
          <path d="M17.65 6.35h3.1M19.2 4.8v3.1" fill="none" stroke="#fffdf9" strokeLinecap="round" strokeWidth="1.9" />
        </IconFrame>
      )
    case 'size-small':
      return (
        <IconFrame>
          <path d="M6 12h12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
        </IconFrame>
      )
    case 'size-medium':
      return (
        <IconFrame>
          <path d="M5.5 12h13" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4.8" />
        </IconFrame>
      )
    case 'size-large':
      return (
        <IconFrame>
          <path d="M5 12h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="6.8" />
        </IconFrame>
      )
    case 'done':
      return (
        <IconFrame>
          <path d="m6.25 12.55 3.25 3.25 8.2-8.55" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'style':
      return (
        <IconFrame>
          <path
            d="M12.25 4.9c4.35 0 7.45 2.75 7.45 6.7 0 3-2.05 5.2-4.8 5.2h-1.75a1.2 1.2 0 0 0-1.2 1.2c0 .3.1.6.28.85.32.48.42.92.42 1.35 0 1.08-.95 1.8-2.15 1.8-4.28 0-8-3.72-8-8.25 0-5.02 4.23-8.85 9.75-8.85Z"
            {...roundedStroke}
          />
          <circle cx="8.2" cy="11.35" r="1.05" fill="currentColor" />
          <circle cx="11.2" cy="8.7" r="1.05" fill="currentColor" />
          <circle cx="14.75" cy="9.15" r="1.05" fill="currentColor" />
        </IconFrame>
      )
    case 'title':
      return (
        <IconFrame>
          <path d="M6 7.25h12M12 7.25v9.5M9.3 16.75h5.4" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'cell-type':
      return (
        <IconFrame>
          <rect x="5.25" y="4.8" width="13.5" height="14.4" rx="2.05" {...framedStroke} />
          <path d="M8.75 9.2h6.5M8.75 13.15h6.5" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'formula':
      return (
        <IconFrame>
          <path d="m8.15 7.1 3.1 4.9-3.1 4.9M15.85 7.1l-3.1 4.9 3.1 4.9M6 12h12" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'align':
      return (
        <IconFrame>
          <path d="M6 7h12M6 11.2h9.4M6 15.4h12M6 19.6h7.8" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'add-column':
      return (
        <IconFrame>
          <rect x="4.8" y="5" width="10.8" height="14" rx="2" {...framedStroke} />
          <path d="M10.2 5v14M18.4 9.05v5.9M15.45 12h5.9" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'add-row':
      return (
        <IconFrame>
          <rect x="5" y="4.8" width="14" height="10.8" rx="2" {...framedStroke} />
          <path d="M5 10.2h14M9.05 18.45h5.9M12 15.5v5.9" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'fit':
      return (
        <IconFrame>
          <rect x="7" y="7" width="10" height="10" rx="2" {...framedStroke} />
          <path
            d="M9 4.75H4.75V9M15 4.75h4.25V9M9 19.25H4.75V15M15 19.25h4.25V15"
            {...roundedStrokeStrong}
          />
        </IconFrame>
      )
    case 'open':
      return (
        <IconFrame>
          <path d="M14 5h5v5M10 14 19 5" {...roundedStrokeStrong} />
          <path d="M19 13v4.5A1.5 1.5 0 0 1 17.5 19h-11A1.5 1.5 0 0 1 5 17.5v-11A1.5 1.5 0 0 1 6.5 5H11" {...roundedStroke} />
        </IconFrame>
      )
    case 'duplicate':
      return (
        <IconFrame>
          <rect x="8" y="8" width="10.5" height="10.5" rx="2.2" {...framedStroke} />
          <path d="M15.5 8V7A2.5 2.5 0 0 0 13 4.5H7A2.5 2.5 0 0 0 4.5 7v6A2.5 2.5 0 0 0 7 15.5h1" {...roundedStroke} />
        </IconFrame>
      )
    case 'delete':
      return (
        <IconFrame>
          <path d="M5.5 7.5h13M9.5 4.5h5M8 7.5v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-10" {...roundedStroke} />
          <path d="M10 10.5v5.5M14 10.5v5.5" {...roundedStrokeStrong} />
        </IconFrame>
      )
    case 'settings':
      return (
        <IconFrame>
          <circle cx="12" cy="12" r="2.9" {...framedStroke} />
          <path
            d="M12 4.8v2.05M12 17.15v2.05M19.2 12h-2.05M6.85 12H4.8M17.1 6.9l-1.45 1.45M8.35 15.65 6.9 17.1M17.1 17.1l-1.45-1.45M8.35 8.35 6.9 6.9"
            {...roundedStrokeStrong}
          />
        </IconFrame>
      )
  }
}

function CropIcon() {
  return (
    <IconFrame>
      <path d="M7 4.75v9.5A2.75 2.75 0 0 0 9.75 17h9.5M4.75 7h9.5A2.75 2.75 0 0 1 17 9.75v9.5" {...roundedStroke} />
      <path d="M7 19.25H4.75M7 19.25v2.25M19.25 7h2.25M19.25 7V4.75" {...roundedStrokeStrong} />
    </IconFrame>
  )
}

function CaptionIcon() {
  return (
    <IconFrame>
      <path
        d="M6 7.5A2.5 2.5 0 0 1 8.5 5h7A2.5 2.5 0 0 1 18 7.5v5a2.5 2.5 0 0 1-2.5 2.5h-4l-4 3.25V15H8.5A2.5 2.5 0 0 1 6 12.5Z"
        {...roundedStroke}
      />
      <path d="M9 9.5h6M9 12h4.5" {...roundedStrokeStrong} />
    </IconFrame>
  )
}

export { CaptionIcon, CropIcon, ToolbarIcon }
