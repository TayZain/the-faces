import * as React from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useProgress } from "@react-three/drei";
import styles from "./style.module.css";

gsap.registerPlugin(SplitText);

// Prevent GSAP from "catching up" after a lag spike — keeps animations smooth
gsap.ticker.lagSmoothing(0);

const MIN_DISPLAY_MS = 2800;

export function PageLoader({ onDone }: { onDone?: () => void }) {
  const { progress } = useProgress();

  const overlayRef = React.useRef<HTMLDivElement>(null);
  const tubeRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const counterRef = React.useRef<HTMLSpanElement>(null);

  const mainTl = React.useRef<gsap.core.Timeline | null>(null);
  const endTriggered = React.useRef(false);
  const progressDone = React.useRef(false);
  const minTimeDone = React.useRef(false);
  const gsapCount = React.useRef({ val: 0 });

  // Stable ref so the exit function always reads fresh state
  const onDoneRef = React.useRef(onDone);
  React.useEffect(() => {
    onDoneRef.current = onDone;
  });

  const runExit = React.useRef(() => {
    if (!progressDone.current || !minTimeDone.current || endTriggered.current) return;
    endTriggered.current = true;

    mainTl.current?.pause();

    gsap.timeline()
      // Step 1 — dissolve the content (text + counter)
      .to(contentRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
      })
      // Step 2 — the whole panel slides up, revealing the canvas (Awwwards curtain)
      .to(overlayRef.current, {
        yPercent: -100,
        duration: 1.0,
        ease: "expo.inOut",
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = "none";
          onDoneRef.current?.();
        },
      });
  });

  // Minimum display time — ensures the loader is always seen
  React.useEffect(() => {
    const t = setTimeout(() => {
      minTimeDone.current = true;
      runExit.current();
    }, MIN_DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Progress gate — fires when textures are fully loaded
  React.useEffect(() => {
    if (progress < 100) return;
    progressDone.current = true;
    runExit.current();
  }, [progress]);

  // Smooth counter — direct DOM mutation, zero React re-renders
  React.useEffect(() => {
    const obj = gsapCount.current;
    gsap.to(obj, {
      val: progress,
      duration: 0.7,
      ease: "power3.out",
      overwrite: "auto",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent =
            `${Math.floor(obj.val).toString().padStart(3, "0")}%`;
        }
      },
    });
  }, [progress]);

  // SplitText 3D rotation — runs once on mount
  React.useEffect(() => {
    const tube = tubeRef.current;
    const overlay = overlayRef.current;
    if (!tube || !overlay) return;

    const lines = tube.querySelectorAll(`.${styles.line}`);

    const splits = Array.from(lines).map(
      (line) => new SplitText(line, { type: "chars", charsClass: styles.char })
    );

    const depth = -window.innerWidth / 8;
    const transformOrigin = `50% 50% ${depth}`;

    gsap.set(lines, { perspective: 700, transformStyle: "preserve-3d" });
    gsap.set(overlay, { visibility: "visible" });

    const tl = gsap.timeline({ repeat: -1 });
    mainTl.current = tl;

    splits.forEach((split, i) => {
      tl.fromTo(
        split.chars,
        { rotationX: -90 },
        {
          rotationX: 90,
          stagger: 0.08,
          duration: 0.9,
          ease: "none",
          transformOrigin,
          force3D: true,
        },
        i * 0.45
      );
    });

    return () => {
      tl.kill();
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <div ref={overlayRef} className={styles.overlay} style={{ visibility: "hidden" }}>
      <div ref={contentRef} className={styles.content}>
        <div ref={tubeRef} className={styles.tube}>
          <h1 className={styles.line}>THE FACES</h1>
          <h1 className={styles.line}>THE FACES</h1>
          <h1 className={styles.line}>THE FACES</h1>
          <h1 className={styles.line}>THE FACES</h1>
        </div>
        <div className={styles.counter}>
          <span ref={counterRef}>000%</span>
        </div>
      </div>
    </div>
  );
}
