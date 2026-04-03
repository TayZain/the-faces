import * as React from 'react'
import { InfiniteCanvas } from './infinite-canvas'
import { PageLoader } from './loader'
import type { MediaItem } from './infinite-canvas/types'
import { manifest } from './manifest'
import styles from './App.module.css'

function App() {
  const [media] = React.useState<MediaItem[]>(manifest)
  const [loaderDone, setLoaderDone] = React.useState(false)
  const [canvasActive, setCanvasActive] = React.useState(false)
  const navTitleRef = React.useRef<HTMLHeadingElement>(null)

  return (
    <>
      <InfiniteCanvas
        media={media}
        backgroundColor="#0a0a0a"
        paused={!canvasActive}
      />

      <h1
        ref={navTitleRef}
        className={styles.navTitle}
        style={{ opacity: loaderDone ? 1 : 0 }}
        aria-label="The Faces"
      >
        THE FACES
      </h1>

      {!loaderDone && (
        <PageLoader
          navTitleRef={navTitleRef}
          onReveal={() => setCanvasActive(true)}  
          onDone={() => setLoaderDone(true)}     
        />
      )}
    </>
  )
}

export default App
