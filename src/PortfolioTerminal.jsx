import { useEffect, useRef, useState } from "react";
import { Terminal, Minus, Square, X } from "lucide-react";

const LINES = [
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
];

const TYPE_SPEED = 34;
const LINE_PAUSE = 180;
const HOLD = 2800;
const CLEAR = 700;

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
  const [lineIndex, setLineIndex] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    const clearTimers = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };

    if (reducedMotion) {
      clearTimers();
      setLineIndex(LINES.length - 1);
      setCharIndex(LINES[LINES.length - 1].text.length);
      return clearTimers;
    }

    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timers.current.push(id);
    };

    const run = () => {
      clearTimers();
      setLineIndex(-1);
      setCharIndex(0);

      const type = (index, chars) => {
        if (index >= LINES.length) {
          schedule(run, HOLD);
          return;
        }

        const line = LINES[index];
        setLineIndex(index);
        setCharIndex(chars);

        if (line.type === "blank" || chars >= line.text.length) {
          schedule(() => type(index + 1, 0), LINE_PAUSE);
          return;
        }

        schedule(() => type(index, chars + 1), TYPE_SPEED + Math.random() * 24);
      };

      schedule(() => type(0, 0), CLEAR);
    };

    run();
    return clearTimers;
  }, [reducedMotion]);

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
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
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
        className="min-h-[340px] px-5 py-5 sm:px-6"
        style={{
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: "clamp(11px, 1.25vw, 13px)",
          lineHeight: 1.75,
        }}
      >
        {LINES.map((line, i) => {
          const isPast = i < lineIndex || reducedMotion;
          const isCurrent = i === lineIndex && !reducedMotion;
          const visible = isPast ? line.text : isCurrent ? line.text.slice(0, charIndex) : "";
          const cursor = (isCurrent || (reducedMotion && i === LINES.length - 1));

          return (
            <div key={i} className="min-h-[1.75em] whitespace-pre-wrap break-words">
              {line.type === "blank" ? "\u00A0" : (
                <>
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
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-4 py-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">interactive shell</span>
        <span className="font-mono text-[9px] text-emerald-300/70">● online</span>
      </div>

      <style>{`
        @keyframes terminalBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
