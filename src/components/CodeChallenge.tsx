import '../monacoSetup'
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'
import { runJs } from '../engine/runJs'
import { runPython, warmUpPython } from '../engine/runPython'
import { runReact } from '../engine/runReact'
import { runSql } from '../engine/runSql'
import { useGame } from '../game/GameContext'
import type { CodeStep, RunResult } from '../types'
import { checkpointNames } from '../engine/checkpoints'
import { Icon } from './Icon'
import { Markdown } from './Markdown'

type EditorInstance = Parameters<OnMount>[0]

const MONACO_LANG = { javascript: 'javascript', typescript: 'typescript', react: 'typescript', python: 'python', sql: 'sql' } as const
const EXT = { javascript: 'js', typescript: 'ts', react: 'tsx', python: 'py', sql: 'sql' } as const
const FILE_NAME = { javascript: 'main.js', typescript: 'main.ts', react: 'App.tsx', python: 'main.py', sql: 'query.sql' } as const

const LANG_LABEL = { javascript: 'JavaScript', typescript: 'TypeScript', react: 'React + TSX', python: 'Python', sql: 'SQL (SQLite)' } as const

interface CompileError {
  line: number
  message: string
}

/* Monaco moved its TypeScript namespace between versions; support both locations. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tsApi = (monaco: Monaco): any => (monaco as any).typescript ?? (monaco.languages as any).typescript

let configured = false
function configureMonaco(monaco: Monaco) {
  if (configured) return
  configured = true
  // Match the editor to the app's code bench instead of VS Code's default grey.
  monaco.editor.defineTheme('quest-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#0c1020', 'editor.lineHighlightBackground': '#151b36', 'editorGutter.background': '#0c1020' },
  })
  const ts = tsApi(monaco)
  if (!ts) return
  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    strict: true,
    noImplicitAny: true,
    allowNonTsExtensions: true,
    jsx: ts.JsxEmit.React,
    lib: ['es2022', 'dom'],
  })
}

/** Ask the real TypeScript compiler (running in Monaco's worker) for errors — same as `tsc --noEmit`. */
async function typeCheck(monaco: Monaco, editor: EditorInstance): Promise<CompileError[]> {
  const ts = tsApi(monaco)
  const model = editor.getModel()
  if (!ts || !model) return []
  const getWorker = await ts.getTypeScriptWorker()
  const client = await getWorker(model.uri)
  const uri = model.uri.toString()
  const diags = [...(await client.getSyntacticDiagnostics(uri)), ...(await client.getSemanticDiagnostics(uri))]
  const flatten = (m: string | { messageText: string; next?: unknown[] }): string => (typeof m === 'string' ? m : m.messageText)
  return diags.map((d: { start?: number; messageText: string | { messageText: string } }) => ({
    line: d.start != null ? model.getPositionAt(d.start).lineNumber : 0,
    message: flatten(d.messageText),
  }))
}

export function CodeChallenge({
  step,
  stepKey,
  onPass,
}: {
  step: CodeStep
  stepKey: string
  onPass: (info: { usedHint: boolean; usedSolution: boolean }) => void
}) {
  const { p, update } = useGame()
  const [code, setCode] = useState(() => p.drafts[stepKey] ?? step.starter)
  const [result, setResult] = useState<RunResult | null>(null)
  const [compileErrors, setCompileErrors] = useState<CompileError[]>([])
  const [running, setRunning] = useState(false)
  const [usedHint, setUsedHint] = useState(false)
  const [usedSolution, setUsedSolution] = useState(false)
  const [fails, setFails] = useState(0)
  const [passed, setPassed] = useState(false)
  const monacoRef = useRef<Monaco | null>(null)
  const editorRef = useRef<EditorInstance | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const runRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (step.lang === 'python') warmUpPython()
  }, [step.lang])

  useEffect(() => {
    const ts = monacoRef.current && tsApi(monacoRef.current)
    // React previews don't have React's type definitions loaded, so only syntax-check them.
    ts?.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: step.lang === 'react', noSyntaxValidation: false })
  }, [step.lang, stepKey])

  async function run() {
    if (running) return
    setRunning(true)
    setCompileErrors([])
    update((prev) => ({ ...prev, drafts: { ...prev.drafts, [stepKey]: code } }))
    try {
      // Step 1 for TypeScript: compile. Type errors stop you, exactly like a real build.
      if (step.lang === 'typescript' && monacoRef.current && editorRef.current) {
        const errors = await typeCheck(monacoRef.current, editorRef.current)
        if (errors.length) {
          setCompileErrors(errors)
          setResult(null)
          setFails((f) => f + 1)
          return
        }
      }
      let r: RunResult
      if (step.lang === 'javascript' || step.lang === 'typescript') r = await runJs(code, step.tests, step.lang)
      else if (step.lang === 'react') r = await runReact(code, step.tests, iframeRef.current!)
      else if (step.lang === 'python') r = await runPython(code, step.tests)
      else r = await runSql(code, step.setup ?? '', step.tests, step.solution)
      setResult(r)
      const ok = !r.error && r.tests.length > 0 && r.tests.every((t) => t.pass)
      if (ok && !passed) {
        setPassed(true)
        onPass({ usedHint, usedSolution })
      } else if (!ok) setFails((f) => f + 1)
    } finally {
      setRunning(false)
    }
  }
  useEffect(() => {
    runRef.current = run
  })

  const handleMount: OnMount = (editor, monaco) => {
    monacoRef.current = monaco
    editorRef.current = editor
    configureMonaco(monaco)
    // Monaco type-checks all open models as one project; drop old lessons' files so
    // `function area` in lesson 3 doesn't clash with `function area` in lesson 1.
    monaco.editor.getModels().forEach((m) => m !== editor.getModel() && m.dispose())
    tsApi(monaco)?.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: step.lang === 'react', noSyntaxValidation: false })
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current())
  }

  const checkpoints = checkpointNames(step)
  const status = (name: string, i: number): 'pass' | 'fail' | 'idle' => {
    if (!result || result.error) return 'idle'
    const t = result.tests.find((x) => x.name === name) ?? result.tests[i]
    return t ? (t.pass ? 'pass' : 'fail') : 'idle'
  }
  const hasOutput = result || compileErrors.length > 0

  return (
    <div className={`workspace ${step.lang === 'react' ? 'has-preview' : ''}`}>
      <section className="learn-pane" aria-label="Instructions">
        <span className={`lang-badge lang-${step.lang}`}>{LANG_LABEL[step.lang]}</span>
        <h2>{step.title}</h2>
        <Markdown text={step.instructions} />

        <h3 className="pane-title">Checkpoints</h3>
        <ol className="checkpoints">
          {checkpoints.map((name, i) => {
            const st = passed ? 'pass' : status(name, i)
            const fail = result?.tests.find((x) => x.name === name)?.message
            return (
              <li key={name} className={`cp cp-${st}`}>
                <span className="cp-mark">{st === 'pass' ? <Icon name="check" size={14} /> : st === 'fail' ? <Icon name="x" size={14} /> : i + 1}</span>
                <span>
                  {name}
                  {st === 'fail' && fail && <span className="cp-why">{fail}</span>}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="help-row">
          <button className="btn small" onClick={() => setUsedHint(true)} disabled={usedHint}>
            <Icon name="bulb" size={16} /> {usedHint ? 'Hint shown' : 'Get a hint (−10 XP)'}
          </button>
          {fails >= 2 && !passed && (
            <button
              className="btn small"
              onClick={() => {
                setUsedSolution(true)
                setCode(step.solution)
              }}
            >
              <Icon name="flag" size={16} /> Show solution
            </button>
          )}
        </div>
        {usedHint && <div className="callout hint">{step.hint}</div>}
        {usedSolution && (
          <div className="callout warn">
            Solution loaded. Read it line by line, then <strong>reset and retype it from memory</strong>. That's where the learning happens.
          </div>
        )}
      </section>

      <section className="work-pane" aria-label="Code editor">
        <div className="editor-bar">
          <span className="file-tab">{FILE_NAME[step.lang]}</span>
          <span className="spacer" />
          <button
            className="ghost-dark"
            onClick={() => {
              setCode(step.starter)
              setResult(null)
              setCompileErrors([])
            }}
          >
            <Icon name="reset" size={14} /> Reset
          </button>
          <span className="kbd-hint hide-sm">Ctrl/⌘ Enter</span>
          <button className="run-btn" onClick={run} disabled={running}>
            <Icon name="play" size={14} /> {running ? 'Running…' : step.lang === 'typescript' ? 'Compile & run' : 'Run'}
          </button>
        </div>
        <div className="editor-wrap">
          <Editor
            height="100%"
            theme="quest-dark"
            beforeMount={configureMonaco}
            path={`file:///quest/${stepKey.replace(/[^a-z0-9]/gi, '_')}.${EXT[step.lang]}`}
            language={MONACO_LANG[step.lang]}
            value={code}
            onChange={(v) => setCode(v ?? '')}
            onMount={handleMount}
            options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, tabSize: 2, automaticLayout: true, padding: { top: 12 } }}
          />
        </div>
        <div className="output-row">
          {step.lang === 'react' && (
            <div className="preview">
              <div className="out-title">Browser preview</div>
              <iframe ref={iframeRef} title="Preview of your component" sandbox="allow-scripts allow-forms allow-modals" />
            </div>
          )}
          <div className="console" aria-live="polite">
            <div className="out-title">Output</div>
            {!hasOutput && <div className="log dim">Press Run to execute your code and check the checkpoints.</div>}
            {compileErrors.length > 0 && (
              <>
                <div className="log err strong">Compile failed: {compileErrors.length} type error(s). Nothing ran.</div>
                {compileErrors.map((e, i) => (
                  <div key={i} className="log err">
                    line {e.line}: {e.message}
                  </div>
                ))}
              </>
            )}
            {result?.logs.map((l, i) => (
              <div key={i} className="log">
                {l}
              </div>
            ))}
            {result?.table && result.table.columns.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {result.table.columns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.table.values.slice(0, 50).map((row, i) => (
                      <tr key={i}>
                        {row.map((v, j) => (
                          <td key={j}>{v === null ? 'NULL' : String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {result?.error && <div className="log err">{result.error}</div>}
            {result && !result.error && result.tests.length > 0 && (
              <div className={`log strong ${result.tests.every((t) => t.pass) ? 'ok' : 'err'}`}>
                {result.tests.filter((t) => t.pass).length}/{result.tests.length} checkpoints passed
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
