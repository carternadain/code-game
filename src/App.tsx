import { useEffect, useState } from 'react'
import { ExplainPage } from './components/ExplainPage'
import { Header } from './components/Header'
import { LessonPlayer } from './components/LessonPlayer'
import { Profile, RealmView, Review, Today, WorldMap } from './components/Pages'
import { ProjectPage } from './components/ProjectPage'
import { Roadmap } from './components/Roadmap'
import { SkillTree } from './components/SkillTree'
import { ALL_LESSONS, REALMS, findLesson } from './content'
import { GameProvider, useGame } from './game/GameContext'

function useHashRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/'
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => {
      setRoute(read())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

function Toasts() {
  const { toasts } = useGame()
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          <span>{t.icon}</span> {t.text}
        </div>
      ))}
    </div>
  )
}

function Router({ route }: { route: string }) {
  const [, section, id] = route.split('/')

  if (section === 'lesson' && id) {
    const found = findLesson(id)
    if (found) {
      return (
        <LessonPlayer
          key={id}
          realm={found.realm}
          lesson={found.lesson}
          onExit={(goNext) => {
            if (!goNext) {
              window.location.hash = `#/realm/${found.realm.id}`
              return
            }
            const idx = ALL_LESSONS.findIndex((x) => x.lesson.id === id)
            const next = ALL_LESSONS[idx + 1]
            window.location.hash = next ? `#/lesson/${next.lesson.id}` : '#/map'
          }}
        />
      )
    }
  }
  if (section === 'realm' && id) {
    const realm = REALMS.find((r) => r.id === id)
    if (realm) return <RealmView realm={realm} />
  }
  if (section === 'map') return <WorldMap />
  if (section === 'tree') return <SkillTree />
  if (section === 'project') return <ProjectPage />
  if (section === 'review') return <Review />
  if (section === 'explain') return <ExplainPage />
  if (section === 'profile') return <Profile />
  if (section === 'roadmap') return <Roadmap />
  return <Today />
}

export default function App() {
  const route = useHashRoute()
  return (
    <GameProvider>
      <Header route={route} />
      <main className={route.startsWith('/lesson/') ? 'is-lesson' : undefined}>
        <Router route={route} />
      </main>
      <Toasts />
    </GameProvider>
  )
}
