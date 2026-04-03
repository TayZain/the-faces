import * as React from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useProgress } from "@react-three/drei";
import styles from "./style.module.css";

gsap.registerPlugin(SplitText);
// Let GSAP sync with the native display refresh rate (120Hz, 144Hz, etc.)
gsap.ticker.lagSmoothing(0);

const MIN_DISPLAY_MS = 2600;

export function PageLoader({
  onDone,
  onReveal,
  navTitleRef,
}: {
  onDone?: () => void;
  onReveal?: () => void;
  navTitleRef?: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { progress } = useProgress();

  const overlayRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  const endTriggered = React.useRef(false);
  const progressDone = React.useRef(false);
  const minTimeDone = React.useRef(false);

  const onDoneRef = React.useRef(onDone);
  const onRevealRef = React.useRef(onReveal);
  React.useEffect(() => { onDoneRef.current = onDone; });
  React.useEffect(() => { onRevealRef.current = onReveal; });

  // Split text and apply CSS animation via inline style on mount
  // CSS animations run on the compositor thread — zero JS per frame
  React.useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const split = new SplitText(title, { type: "chars" });

    split.chars.forEach((char, i) => {
      // Wrap in overflow:hidden clip — created once, never touched again
      const clip = document.createElement("span");
      clip.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;";
      char.parentNode!.insertBefore(clip, char);
      clip.appendChild(char);

      // CSS animation with staggered delay — compositor thread only
      (char as HTMLElement).style.cssText =
        `display:inline-block;` +
        `animation:charReveal 1.2s cubic-bezier(0.16,1,0.3,1) forwards;` +
        `animation-delay:${0.05 + i * 0.045}s;` +
        `transform:translateY(110%);`;
    });

    return () => split.revert();
  }, []);

  const runExit = React.useRef(() => {
    if (!progressDone.current || !minTimeDone.current || endTriggered.current) return;
    endTriggered.current = true;

    const title = titleRef.current;
    const nav = navTitleRef?.current;
    const overlay = overlayRef.current;

    const tl = gsap.timeline({ paused: true });

    if (title && nav) {
      const fromRect = title.getBoundingClientRect();
      const toRect = nav.getBoundingClientRect();
      const scaleRatio = toRect.height / fromRect.height;
      const dx = toRect.left - fromRect.left;
      const dy = toRect.top - fromRect.top;

      tl.to(title, {
        x: dx,
        y: dy,
        scale: scaleRatio,
        transformOrigin: "top left",
        duration: 1.0,
        ease: "expo.inOut",
        force3D: true,
      });
    }

    tl.to(overlay, {
      yPercent: -100,
      duration: 1.1,
      ease: "expo.inOut",
      onStart: () => onRevealRef.current?.(),
      onComplete: () => {
        if (overlay) overlay.style.display = "none";
        onDoneRef.current?.();
      },
    }, "<");

    tl.play();
  });

  React.useEffect(() => {
    const t = setTimeout(() => {
      minTimeDone.current = true;
      runExit.current();
    }, MIN_DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (progress < 100) return;
    progressDone.current = true;
    runExit.current();
  }, [progress]);

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <h1 ref={titleRef} className={styles.title}>THE FACES</h1>
    </div>
  );
}
