import * as React from 'react'
import { InfiniteCanvas } from './infinite-canvas'
import { PageLoader } from './loader'
import type { MediaItem } from './infinite-canvas/types'
import { manifest } from './manifest'
import styles from './App.module.css'

type Theme = 'light' | 'dark'

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = React.useState<Theme>('light')

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = React.useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  return [theme, toggle]
}

function App() {
  const [theme, toggleTheme] = useTheme()
  const [media] = React.useState<MediaItem[]>(manifest)
  const [loaderDone, setLoaderDone] = React.useState(false)

  const bgColor = theme === 'dark' ? '#0a0a0a' : '#ffffff'
  const label = theme === 'dark' ? 'Light' : 'Dark'

  return (
    <>
      {/* Loader manages its own progress via useProgress internally */}
      <PageLoader onDone={() => setLoaderDone(true)} />

      <InfiniteCanvas media={media} backgroundColor={bgColor} />

      {/* Header toggle — permanent, top-right */}
      <header className={styles.header}>
        <button className={styles.themeBtn} onClick={toggleTheme} aria-label="Toggle theme">
          {label}
        </button>
      </header>
    </>
  )
}

export default App
