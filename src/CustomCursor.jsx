import React, { useEffect, useRef } from "react";

/**
 * Premium editorial cursor (we-flow-style), built to the CoSTAR spec:
 * - Core: a small precision dot, near-instant lerp.
 * - Ring: a lagging outer ring with subtle inertia.
 * - Each interaction state gets a genuinely distinct silhouette rather than
 *   a uniform scale bump, so hover / magnetic / text read as different
 *   things at a glance:
 *     default  -> thin hairline ring + small solid dot
 *     hover    -> ring expands into a soft "target lock", dot recedes
 *     magnetic -> ring collapses onto the element as a soft filled disc,
 *                 dot disappears (the element itself is doing the moving)
 *     text     -> ring hides, dot elongates into a thin vertical caret
 */
export default function CustomCursor({ active = true }) {
  const coreRef = useRef(null);
  const ringRef = useRef(null);

  // Position + physics live in refs so mousemove never triggers React renders
  const mouse = useRef({ x: -100, y: -100 });
  const corePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  // Non-uniform core scale lets the dot squash into a caret for text state
  const coreScaleX = useRef(1);
  const coreScaleY = useRef(1);
  const targetCoreScaleX = useRef(1);
  const targetCoreScaleY = useRef(1);

  const ringScale = useRef(1);
  const targetRingScale = useRef(1);

  const ringFill = useRef(0);
  const targetRingFill = useRef(0);
  const ringBorder = useRef(1);
  const targetRingBorder = useRef(1);

  const opacity = useRef(0);
  const targetOpacity = useRef(0);

  const cursorState = useRef("default"); // default | hover | magnetic | text | hidden
  const isMouseDown = useRef(false);
  const magneticElement = useRef(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isFinePointer || prefersReducedMotion) {
      return;
    }

    document.body.classList.add("has-custom-cursor");

    // Discrete (non-lerped) shape swap — only flips on state change, not every frame
    if (coreRef.current) {
      coreRef.current.style.transition = "border-radius 0.22s ease";
    }

    let rafId;

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      targetOpacity.current = 1;

      if (magneticElement.current) {
        const rect = magneticElement.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        const maxDist = 14;
        const pullX = Math.max(-maxDist, Math.min(maxDist, dx * 0.28));
        const pullY = Math.max(-maxDist, Math.min(maxDist, dy * 0.28));

        magneticElement.current.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
      }
    };

    const onMouseEnter = () => {
      targetOpacity.current = 1;
    };

    const onMouseLeave = () => {
      targetOpacity.current = 0;
    };

    const onMouseDown = () => {
      isMouseDown.current = true;
      updateCursorState();
    };

    const onMouseUp = () => {
      isMouseDown.current = false;
      updateCursorState();
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== "function") return;

      const magneticTarget = target.closest('[data-cursor="magnetic"]');
      if (magneticTarget) {
        magneticElement.current = magneticTarget;
        cursorState.current = "magnetic";
        updateCursorState();
        return;
      }

      // Interactive elements take priority over generic text detection so a
      // link sitting inside a paragraph still reads as "hover", not "text".
      const interactiveTarget = target.closest(
        'a, button, [role="button"], input[type="submit"], input[type="button"], [data-cursor="hover"], .link-underline, .row-hover'
      );
      if (interactiveTarget) {
        cursorState.current = "hover";
        updateCursorState();
        return;
      }

      const textTarget = target.closest('input, textarea, p, [data-cursor="text"]');
      if (textTarget) {
        cursorState.current = "text";
        updateCursorState();
        return;
      }

      cursorState.current = "default";
      updateCursorState();
    };

    const onMouseOut = (e) => {
      if (magneticElement.current && !magneticElement.current.contains(e.relatedTarget)) {
        magneticElement.current.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
        magneticElement.current.style.transform = "translate3d(0, 0, 0)";
        setTimeout(() => {
          if (magneticElement.current) {
            magneticElement.current.style.transition = "";
          }
        }, 350);
        magneticElement.current = null;
      }

      if (!e.relatedTarget) {
        targetOpacity.current = 0;
      }
    };

    const updateCursorState = () => {
      // Shape swap happens immediately (CSS transition on border-radius
      // handles the smoothing) — everything else lerps in the RAF loop.
      const isText = cursorState.current === "text" && !isMouseDown.current;
      if (coreRef.current) {
        coreRef.current.style.borderRadius = isText ? "2px" : "999px";
      }

      if (isMouseDown.current) {
        targetCoreScaleX.current = 0.6;
        targetCoreScaleY.current = 0.6;
        targetRingScale.current = 0.82;
        targetRingFill.current = 0.1;
        targetRingBorder.current = 1;
        return;
      }

      switch (cursorState.current) {
        case "magnetic":
          // Ring folds onto the element as a soft filled disc; the dot
          // disappears since the element itself carries the motion now.
          targetCoreScaleX.current = 0;
          targetCoreScaleY.current = 0;
          targetRingScale.current = 2.1;
          targetRingFill.current = 0.14;
          targetRingBorder.current = 0;
          break;
        case "hover":
          // "Target lock": ring opens up, dot recedes to a pinprick so the
          // ring reads as the primary signal.
          targetCoreScaleX.current = 0.35;
          targetCoreScaleY.current = 0.35;
          targetRingScale.current = 1.9;
          targetRingFill.current = 0.06;
          targetRingBorder.current = 1.5;
          break;
        case "text":
          // Ring hides entirely; dot elongates into a thin vertical caret.
          targetCoreScaleX.current = 0.55;
          targetCoreScaleY.current = 3.2;
          targetRingScale.current = 0;
          targetRingFill.current = 0;
          targetRingBorder.current = 1;
          break;
        case "default":
        default:
          targetCoreScaleX.current = 1;
          targetCoreScaleY.current = 1;
          targetRingScale.current = 1;
          targetRingFill.current = 0;
          targetRingBorder.current = 1;
          break;
      }
    };

    const loop = () => {
      // Primary core: ultra-responsive, near-instant
      corePos.current.x += (mouse.current.x - corePos.current.x) * 0.65;
      corePos.current.y += (mouse.current.y - corePos.current.y) * 0.65;

      // Ring: silky inertia lag
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.16;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.16;

      coreScaleX.current += (targetCoreScaleX.current - coreScaleX.current) * 0.22;
      coreScaleY.current += (targetCoreScaleY.current - coreScaleY.current) * 0.22;
      ringScale.current += (targetRingScale.current - ringScale.current) * 0.18;
      ringFill.current += (targetRingFill.current - ringFill.current) * 0.15;
      ringBorder.current += (targetRingBorder.current - ringBorder.current) * 0.2;

      opacity.current += (targetOpacity.current - opacity.current) * 0.15;

      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${corePos.current.x}px, ${corePos.current.y}px, 0) translate(-50%, -50%) scale(${coreScaleX.current}, ${coreScaleY.current})`;
        coreRef.current.style.opacity = opacity.current;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${ringScale.current})`;
        ringRef.current.style.opacity = opacity.current;
        ringRef.current.style.borderWidth = `${ringBorder.current}px`;
        ringRef.current.style.backgroundColor = `rgba(255, 255, 255, ${ringFill.current})`;
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseenter", onMouseEnter, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });

    rafId = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none hidden md:block"
      style={{ display: active ? undefined : 'none' }}
      aria-hidden="true"
    >
      {/* Outer ring — lags behind, carries the state's silhouette (hairline / target-lock / filled disc) */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-9 h-9 rounded-full border pointer-events-none will-change-transform"
        style={{
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
          mixBlendMode: "difference",
          borderColor: "rgba(255, 255, 255, 0.7)",
          borderWidth: "1px",
          backgroundColor: "rgba(255, 255, 255, 0)",
        }}
      />

      {/* Core dot — near-instant, morphs into a caret for text state */}
      <div
        ref={coreRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none will-change-transform"
        style={{
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
          backgroundColor: "#111113",
        }}
      />
    </div>
  );
}
