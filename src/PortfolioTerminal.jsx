import { useEffect, useRef, useState } from "react";
import { Terminal, Minus, Square, X } from "lucide-react";

// Three "screens" that type in, hold, then erase themselves before the next
// screen types in — an infinite loop so the terminal always feels alive.
const SCREENS = [
  [
    { text: "parth@portfolio:~$ whoami", type: "command" },
    { text: "Parth Mahato", type: "output" },
    { text: "AI/ML Engineer | Open Source Enthusiast", type: "output" },
    { text: "", type: "blank" },
    { text: "parth@portfolio:~$ cat stack.txt", type: "command" },
    { text: "Python  •  C  •  SQL  •  React.js", type: "output" },
    { text: "AI/ML  •  Computer Vision  •  LLMs", type: "output" },
    { text: "", type: "blank" },
    { text: "parth@portfolio:~$ status", type: "command" },
    { text: "BUILDING REAL-WORLD AI SYSTEMS", type: "success" },
  ],
  [
    { text: "$ ./parth.sh", type: "command" },
    { text: "[+] Initializing developer...", type: "output" },
    { text: "[+] Python        : active", type: "output" },
    { text: "[+] AI/ML         : exploring", type: "output" },
    { text: "[+] Computer Vision: building", type: "output" },
    { text: "[+] LLMs          : integrating", type: "output" },
    { text: "[+] Full Stack    : shipping", type: "output" },
    { text: "[+] Open Source   : learning", type: "output" },
    { text: "> status: turning ideas into working systems", type: "success" },
  ],
  [
    { text: "$ cat mission.txt", type: "command" },
    { text: "Build things that shouldn't exist yet.", type: "output" },
    { text: "Learn the technology.", type: "output" },
    { text: "Understand the problem.", type: "output" },
    { text: "Build the prototype.", type: "output" },
    { text: "Break it.", type: "output" },
    { text: "Fix it.", type: "output" },
    { text: "Ship it.", type: "output" },
    { text: "$ echo $NEXT", type: "command" },
    { text: "something better", type: "success" },
  ],
];

// Every screen renders this many line-slots (padded with blank filler rows
// when a screen has fewer lines), so the terminal's height never shifts as
// it cycles between screens.
const MAX_LINES = Math.max(...SCREENS.map((s) => s.length));

const TYPE_SPEED = 34;
const ERASE_SPEED = 16;
const LINE_PAUSE = 180;
const HOLD = 2600;
const CLEAR = 500;
const THINKING = 750; // how long the "..." indicator shows between commands

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export default function PortfolioTerminal() {
  const reducedMotion = useReducedMotion();
  const [screenIndex, setScreenIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState("typing"); // 'typing' | 'erasing' | 'thinking'
  const timers = useRef([]);

  useEffect(() => {
    const clearTimers = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };

    if (reducedMotion) {
      clearTimers();
      const lines = SCREENS[0];
      setScreenIndex(0);
      setPhase("typing");
      setLineIndex(lines.length - 1);
      setCharIndex(lines[lines.length - 1].text.length);
      return clearTimers;
    }

    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timers.current.push(id);
    };

    const runScreen = (sIndex, opts = {}) => {
      const lines = SCREENS[sIndex];

      const type = (index, chars) => {
        if (index >= lines.length) {
          schedule(() => erase(lines.length - 1, lines[lines.length - 1].text.length), HOLD);
          return;
        }

        const line = lines[index];
        setPhase("typing");
        setLineIndex(index);
        setCharIndex(chars);

        if (line.type === "blank" || chars >= line.text.length) {
          schedule(() => type(index + 1, 0), LINE_PAUSE);
          return;
        }

        schedule(() => type(index, chars + 1), TYPE_SPEED + Math.random() * 24);
      };

      const erase = (index, chars) => {
        if (index < 0) {
          const next = (sIndex + 1) % SCREENS.length;
          // Classic shell "..." indicator while the next command "loads",
          // instead of jumping straight from empty to typing.
          setPhase("thinking");
          schedule(() => runScreen(next, { skipPause: true }), THINKING);
          return;
        }

        setPhase("erasing");
        setLineIndex(index);
        setCharIndex(chars);

        if (chars <= 0) {
          const prevIndex = index - 1;
          const prevChars = prevIndex >= 0 ? lines[prevIndex].text.length : 0;
          schedule(() => erase(prevIndex, prevChars), LINE_PAUSE);
          return;
        }

        schedule(() => erase(index, chars - 1), ERASE_SPEED + Math.random() * 10);
      };

      clearTimers();
      setScreenIndex(sIndex);
      setLineIndex(-1);
      setCharIndex(0);
      setPhase("typing");
      schedule(() => type(0, 0), opts.skipPause ? 0 : CLEAR);
    };

    runScreen(0);
    return clearTimers;
  }, [reducedMotion]);

  const lines = SCREENS[screenIndex];

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-black/10"
      style={{
        background: "#090909",
        boxShadow: "0 28px 70px rgba(0,0,0,.22), 0 1px 0 rgba(255,255,255,.08) inset",
      }}
      aria-label="Interactive terminal portfolio preview"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-3.5 w-3.5 rounded-full"
            style={{ background: "radial-gradient(circle at 32% 28%, #ff8a80, #ff5f57 55%, #e0443e)", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.15)" }}
          />
          <span
            className="h-3.5 w-3.5 rounded-full"
            style={{ background: "radial-gradient(circle at 32% 28%, #ffe08a, #febc2e 55%, #dea123)", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.15)" }}
          />
          <span
            className="h-3.5 w-3.5 rounded-full"
            style={{ background: "radial-gradient(circle at 32% 28%, #6fe888, #28c840 55%, #1aab32)", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.15)" }}
          />
        </div>
        <div className="flex items-center gap-2 text-white/35">
          <Terminal size={13} />
          <span className="font-mono text-[10px] tracking-wider">zsh</span>
        </div>
        <div className="flex items-center gap-2 text-white/30">
          <Minus size={12} />
          <Square size={10} />
          <X size={12} />
        </div>
      </div>

      <div className="border-b border-white/5 px-4 py-2">
        <span className="font-mono text-[10px] text-white/35">~/portfolio</span>
      </div>

      <div
        className="px-5 py-5 sm:px-6"
        style={{
          height: "400px",
          overflow: "hidden",
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: "clamp(10px, 1.3vw, 13px)",
          lineHeight: 1.75,
        }}
      >
        {/* Always render MAX_LINES slots — shorter screens get blank filler
            rows appended — so the box height never changes between screens. */}
        {Array.from({ length: MAX_LINES }).map((_, i) => {
          if (phase === "thinking") {
            if (i === 0) {
              return (
                <div key={i} className="min-h-[1.75em] whitespace-pre-wrap break-words text-white/45">
                  <span className="thinking-dot" style={{ animationDelay: "0s" }}>.</span>
                  <span className="thinking-dot" style={{ animationDelay: "0.18s" }}>.</span>
                  <span className="thinking-dot" style={{ animationDelay: "0.36s" }}>.</span>
                </div>
              );
            }
            return (
              <div key={i} className="min-h-[1.75em] whitespace-pre-wrap break-words">
                {"\u00A0"}
              </div>
            );
          }

          const line = lines[i];

          if (!line) {
            return (
              <div key={i} className="min-h-[1.75em] whitespace-pre-wrap break-words">
                {"\u00A0"}
              </div>
            );
          }

          if (line.type === "blank") {
            return (
              <div key={i} className="min-h-[1.75em] whitespace-pre-wrap break-words">
                {"\u00A0"}
              </div>
            );
          }

          const visible = reducedMotion
            ? line.text
            : i < lineIndex
              ? line.text
              : i === lineIndex
                ? line.text.slice(0, charIndex)
                : "";

          const cursor = !reducedMotion && i === lineIndex;

          return (
            <div key={i} className="min-h-[1.75em] whitespace-pre-wrap break-words">
              <span
                className={
                  line.type === "command"
                    ? "text-white"
                    : line.type === "success"
                      ? "text-emerald-300"
                      : "text-white/55"
                }
              >
                {visible}
              </span>
              {cursor && (
                <span
                  className="ml-1 inline-block align-[-2px] bg-white/80"
                  style={{ width: "7px", height: "14px", animation: reducedMotion ? "none" : "terminalBlink 1s steps(1) infinite" }}
                />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes terminalBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes thinkingDotPulse {
          0%, 80%, 100% { opacity: 0.25; }
          40% { opacity: 1; }
        }
        .thinking-dot {
          animation: thinkingDotPulse 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
