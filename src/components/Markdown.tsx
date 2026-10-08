import { Fragment, type ReactNode } from 'react'

/** Inline: **bold**, *italic*, `code`. */
function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    return <Fragment key={i}>{part}</Fragment>
  })
}

/**
 * A deliberately tiny markdown renderer for lesson text:
 * paragraphs, `##` headings, `-` / `1.` lists, ``` code blocks, `>` callouts, and inline styles.
 */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++])
      i++
      blocks.push(
        <pre key={blocks.length} className="md-pre">
          <code>{body.join('\n')}</code>
        </pre>,
      )
    } else if (line.startsWith('## ')) {
      blocks.push(<h3 key={blocks.length}>{inline(line.slice(3))}</h3>)
      i++
    } else if (/^\s*([-*]|\d+\.) /.test(line)) {
      const ordered = /^\s*\d+\./.test(line)
      const items: string[] = []
      while (i < lines.length && /^\s*([-*]|\d+\.) /.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+\.) /, ''))
      const L = ordered ? 'ol' : 'ul'
      blocks.push(
        <L key={blocks.length}>
          {items.map((t, j) => (
            <li key={j}>{inline(t)}</li>
          ))}
        </L>,
      )
    } else if (line.startsWith('> ')) {
      const body: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) body.push(lines[i++].slice(2))
      blocks.push(
        <div key={blocks.length} className="callout">
          {inline(body.join(' '))}
        </div>,
      )
    } else if (!line.trim()) {
      i++
    } else {
      const body: string[] = []
      while (i < lines.length && lines[i].trim() && !/^(```|## |> |\s*([-*]|\d+\.) )/.test(lines[i])) body.push(lines[i++])
      blocks.push(<p key={blocks.length}>{inline(body.join(' '))}</p>)
    }
  }
  return <div className="md">{blocks}</div>
}
