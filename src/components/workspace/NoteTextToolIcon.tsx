type NoteTextToolIconName =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'bullet-list'
  | 'numbered-list'
  | 'code'

type NoteTextToolIconProps = {
  name: NoteTextToolIconName
}

function NoteTextToolIcon({ name }: NoteTextToolIconProps) {
  switch (name) {
    case 'bold':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M8 5.5h5.1a3.4 3.4 0 0 1 0 6.8H8Zm0 6.8h6.1a3.6 3.6 0 0 1 0 7.2H8Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </svg>
      )
    case 'italic':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M14.8 5.5h-4.2M13.4 18.5H9.2M14.3 5.5l-4.6 13"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.9"
          />
        </svg>
      )
    case 'underline':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M8 5.5v5.2a4 4 0 0 0 8 0V5.5M6.5 18.5h11"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.9"
          />
        </svg>
      )
    case 'strike':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M16.4 7.2c-.8-1.1-2.1-1.7-3.9-1.7-2.4 0-4 1.1-4 2.8 0 4.2 8.9 1.8 8.9 6 0 2-1.8 3.8-5 3.8-1.9 0-3.7-.6-4.8-1.8M6.3 12h11.4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'bullet-list':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="6.3" cy="7.1" r="1.4" fill="currentColor" />
          <circle cx="6.3" cy="12" r="1.4" fill="currentColor" />
          <circle cx="6.3" cy="16.9" r="1.4" fill="currentColor" />
          <path
            d="M10.2 7.1H18M10.2 12H18M10.2 16.9H18"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'numbered-list':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5.2 6.1h1.5v4.1M4.7 10.2h2.5M5 13.8h2a1.1 1.1 0 0 1 .8 1.9L5 18h3M10.2 7.1H18M10.2 12H18M10.2 16.9H18"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      )
    case 'code':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m9.2 8.2-3.6 3.8 3.6 3.8M14.8 8.2l3.6 3.8-3.6 3.8M13.1 6.6l-2.2 10.8"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      )
  }
}

export default NoteTextToolIcon
