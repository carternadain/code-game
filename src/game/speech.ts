import { useEffect, useRef, useState } from 'react'

/**
 * Speech-to-text with the browser's built-in Web Speech API (Chrome, Edge, Safari; not Firefox).
 * Nothing to install and no key needed. In Chrome, the audio is transcribed by Google's servers.
 */

interface RecognitionResult {
  isFinal: boolean
  0: { transcript: string }
}
interface RecognitionEvent {
  resultIndex: number
  results: ArrayLike<RecognitionResult>
}
interface Recognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}
type RecognitionCtor = new () => Recognition

const Ctor: RecognitionCtor | undefined =
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: RecognitionCtor }).webkitSpeechRecognition)

export const speechSupported = !!Ctor

/** `onFinal` receives each finished phrase; `interim` is the phrase still being heard. */
export function useSpeech(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const rec = useRef<Recognition | null>(null)
  const onFinalRef = useRef(onFinal)
  useEffect(() => {
    onFinalRef.current = onFinal
  })

  useEffect(() => () => rec.current?.stop(), [])

  function start() {
    if (!Ctor || listening) return
    const r = new Ctor()
    r.continuous = true
    r.interimResults = true
    r.lang = navigator.language || 'en-US'
    r.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) onFinalRef.current(res[0].transcript.trim())
        else live += res[0].transcript
      }
      setInterim(live)
    }
    r.onerror = (e) => {
      setError(
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? "Microphone access was blocked. Allow it in your browser's site settings (the icon left of the address bar)."
          : e.error === 'no-speech'
            ? "Didn't hear anything. Check your mic and try again."
            : `Voice input stopped (${e.error}). You can keep typing instead.`,
      )
    }
    r.onend = () => {
      setListening(false)
      setInterim('')
    }
    rec.current = r
    setError(null)
    setListening(true)
    r.start()
  }

  function stop() {
    rec.current?.stop()
  }

  return { listening, interim, error, start, stop }
}
