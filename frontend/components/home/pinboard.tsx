"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

import { GarmentPrint } from "@/components/home/garment-print";
import { project, rubberband, Spring } from "@/lib/spring";
import { cn } from "@/lib/utils";
import type { Garment } from "@/lib/wardrobe";

// Board slots for md and up, as % of the board: two columns, the right one dropped a little.
const SLOTS = [
  { left: 3, top: 1, width: 43, tilt: -3 },
  { left: 54, top: 8, width: 43, tilt: 2.5 },
  { left: 3, top: 50, width: 43, tilt: 2 },
  { left: 54, top: 57, width: 43, tilt: -2.5 },
];

const HOME = { dampingRatio: 1, response: 0.42 }; // settling into a slot: no overshoot
const THROWN = { dampingRatio: 0.72, response: 0.42 }; // released with momentum: a little give
const TILT = { dampingRatio: 0.6, response: 0.32 };
const PUSHED = { dampingRatio: 0.9, response: 0.48 }; // a print nudged out of its slot by a swap

type Print = { x: Spring; y: Spring; r: Spring; el: HTMLDivElement | null };
type Drag = {
  index: number;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  history: { x: number; y: number; t: number }[];
};

/**
 * The hero's pinboard. Each print can be picked up and thrown: it follows the pointer 1:1
 * from where it was grabbed, tilts toward where it's heading, resists past the board's
 * edge, and on release hands its velocity to a spring. A throw toward another slot
 * swaps the two prints. Below md the prints sit in a plain grid and don't move.
 */
export function Pinboard({ garments, className }: { garments: Garment[]; className?: string }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const prints = useRef<Print[]>([]);
  const slotOf = useRef<number[]>(garments.map((_, i) => i));
  const drag = useRef<Drag | null>(null);
  const frame = useRef<number | null>(null);
  const lastTime = useRef(0);
  const zTop = useRef(30);
  const enabled = useRef(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    prints.current = garments.map((_, i) => ({
      x: new Spring(0, HOME),
      y: new Spring(0, HOME),
      r: new Spring(SLOTS[i].tilt, TILT),
      el: prints.current[i]?.el ?? null,
    }));

    const wide = window.matchMedia("(min-width: 48rem)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      enabled.current = wide.matches;
      reduceMotion.current = reduce.matches;
      // Re-seat every print in its current slot at the new board size, without animating.
      prints.current.forEach((print, i) => {
        const [x, y] = enabled.current ? offsetFor(i, slotOf.current[i]) : [0, 0];
        print.x.value = print.x.target = x;
        print.y.value = print.y.target = y;
        print.r.value = print.r.target = enabled.current ? SLOTS[slotOf.current[i]].tilt : 0;
        print.x.velocity = print.y.velocity = print.r.velocity = 0;
        write(i);
      });
    };
    sync();
    wide.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    const resize = new ResizeObserver(sync);
    if (boardRef.current) resize.observe(boardRef.current);
    return () => {
      wide.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      resize.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
    // Mount-only: the springs live in refs and the garments never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Offset (px) that moves print `home` from its own slot to `slot`. */
  function offsetFor(home: number, slot: number): [number, number] {
    const board = boardRef.current;
    if (!board) return [0, 0];
    const { clientWidth: w, clientHeight: h } = board;
    return [((SLOTS[slot].left - SLOTS[home].left) / 100) * w, ((SLOTS[slot].top - SLOTS[home].top) / 100) * h];
  }

  function write(i: number) {
    const print = prints.current[i];
    if (!print?.el) return;
    if (!enabled.current) {
      print.el.style.translate = "";
      print.el.style.rotate = "";
      return;
    }
    print.el.style.translate = `${print.x.value.toFixed(2)}px ${print.y.value.toFixed(2)}px`;
    print.el.style.rotate = `${print.r.value.toFixed(2)}deg`;
  }

  function loop(time: number) {
    const dt = Math.min(0.064, (time - lastTime.current) / 1000 || 1 / 60);
    lastTime.current = time;
    let moving = false;
    prints.current.forEach((print, i) => {
      const held = drag.current?.index === i;
      if (!held) {
        print.x.step(dt);
        print.y.step(dt);
      }
      print.r.step(dt);
      write(i);
      if (held || !print.x.settled || !print.y.settled || !print.r.settled) moving = true;
    });
    frame.current = moving ? requestAnimationFrame(loop) : null;
  }

  function run() {
    if (frame.current !== null) return;
    lastTime.current = performance.now();
    frame.current = requestAnimationFrame(loop);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>, index: number) {
    // One print at a time; a second finger doesn't steal the drag.
    if (!enabled.current || drag.current || event.button !== 0) return;
    const print = prints.current[index];
    const el = print.el!;
    el.setPointerCapture(event.pointerId);
    el.getAnimations().forEach((animation) => animation.finish()); // grabbed mid-entrance
    el.dataset.dragging = "";
    el.style.zIndex = String(++zTop.current);
    // Start from where it is on screen right now, even mid-flight.
    drag.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: print.x.value,
      originY: print.y.value,
      history: [{ x: event.clientX, y: event.clientY, t: event.timeStamp }],
    };
    print.x.velocity = print.y.velocity = 0;
    run();
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    const print = prints.current[current.index];
    const el = print.el!;
    const board = boardRef.current!;

    // Where it would be, then soften anything past the board's edge.
    let x = current.originX + (event.clientX - current.startX);
    let y = current.originY + (event.clientY - current.startY);
    const minX = -el.offsetLeft;
    const maxX = board.clientWidth - el.offsetLeft - el.offsetWidth;
    const minY = -el.offsetTop;
    const maxY = board.clientHeight - el.offsetTop - el.offsetHeight;
    if (x < minX) x = minX + rubberband(x - minX, el.offsetWidth);
    if (x > maxX) x = maxX + rubberband(x - maxX, el.offsetWidth);
    if (y < minY) y = minY + rubberband(y - minY, el.offsetHeight);
    if (y > maxY) y = maxY + rubberband(y - maxY, el.offsetHeight);
    print.x.value = print.x.target = x;
    print.y.value = print.y.target = y;

    current.history.push({ x: event.clientX, y: event.clientY, t: event.timeStamp });
    while (current.history.length > 2 && event.timeStamp - current.history[0].t > 100) current.history.shift();

    // Lean into the direction of travel, like a card held by its top edge.
    if (!reduceMotion.current) {
      const { vx } = releaseVelocity(current);
      print.r.target = SLOTS[slotOf.current[current.index]].tilt + Math.max(-10, Math.min(10, vx / 90));
    }
  }

  function releaseVelocity({ history }: Drag) {
    const first = history[0];
    const last = history[history.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt <= 0) return { vx: 0, vy: 0 };
    return { vx: (last.x - first.x) / dt, vy: (last.y - first.y) / dt };
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    drag.current = null;
    const { index } = current;
    const print = prints.current[index];
    const el = print.el!;
    delete el.dataset.dragging;

    // Release velocity, ignoring a pause before letting go.
    const stale = event.timeStamp - current.history[current.history.length - 1].t > 80;
    const { vx, vy } = stale ? { vx: 0, vy: 0 } : releaseVelocity(current);

    // Where the throw is heading decides the slot, not where it was let go.
    const board = boardRef.current!;
    const cx = el.offsetLeft + print.x.value + el.offsetWidth / 2 + project(vx, 0.99);
    const cy = el.offsetTop + print.y.value + el.offsetHeight / 2 + project(vy, 0.99);
    let target = slotOf.current[index];
    let best = Infinity;
    SLOTS.forEach((slot, s) => {
      const sx = ((slot.left + slot.width / 2) / 100) * board.clientWidth;
      const sy = (slot.top / 100) * board.clientHeight + el.offsetHeight / 2;
      const distance = Math.hypot(sx - cx, sy - cy);
      if (distance < best) {
        best = distance;
        target = s;
      }
    });

    const from = slotOf.current[index];
    if (target !== from) {
      // Swap: whoever held that slot moves into the one just vacated.
      const other = slotOf.current.indexOf(target);
      slotOf.current[other] = from;
      const otherPrint = prints.current[other];
      const [ox, oy] = offsetFor(other, from);
      otherPrint.x.configure(PUSHED);
      otherPrint.y.configure(PUSHED);
      otherPrint.x.target = ox;
      otherPrint.y.target = oy;
      otherPrint.r.target = SLOTS[from].tilt;
    }
    slotOf.current[index] = target;
    const [tx, ty] = offsetFor(index, target);

    if (reduceMotion.current) {
      // No flight path: fade out, re-seat, fade back in.
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease-out" }).finished.then(() => {
        prints.current.forEach((p, i) => {
          p.x.value = p.x.target;
          p.y.value = p.y.target;
          p.r.value = p.r.target;
          p.x.velocity = p.y.velocity = p.r.velocity = 0;
          write(i);
        });
        print.x.value = print.x.target = tx;
        print.y.value = print.y.target = ty;
        print.r.value = print.r.target = SLOTS[target].tilt;
        write(index);
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: "ease-out" });
      });
      return;
    }

    // Bounce only if it was thrown; a gentle release just settles.
    const thrown = Math.hypot(vx, vy) > 700;
    print.x.configure(thrown ? THROWN : HOME);
    print.y.configure(thrown ? THROWN : HOME);
    print.x.target = tx;
    print.y.target = ty;
    print.x.velocity = vx;
    print.y.velocity = vy;
    print.r.target = SLOTS[target].tilt;
    print.r.velocity = vx / 40;
    run();
  }

  return (
    <div
      ref={boardRef}
      className={cn(
        "isolate grid w-full grid-cols-2 gap-3 md:relative md:mx-auto md:block md:aspect-[10/13] md:max-w-[520px]",
        className,
      )}
    >
      {garments.map((garment, i) => (
        <div
          key={garment.name}
          ref={(el) => {
            if (prints.current[i]) prints.current[i].el = el;
            else prints.current[i] = { x: new Spring(0, HOME), y: new Spring(0, HOME), r: new Spring(0, TILT), el };
          }}
          onPointerDown={(event) => onPointerDown(event, i)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "group animate-rise md:absolute md:top-(--top) md:left-(--left) md:w-(--width) md:rotate-(--tilt) md:cursor-grab md:touch-none md:select-none",
            "[&>figure]:transition-[scale,box-shadow] [&>figure]:duration-150 [&>figure]:ease-out",
            "data-dragging:cursor-grabbing data-dragging:[&>figure]:scale-[1.04] data-dragging:[&>figure]:shadow-lift",
            i % 2 === 0 ? "z-20" : "z-10",
          )}
          style={
            {
              "--left": `${SLOTS[i].left}%`,
              "--top": `${SLOTS[i].top}%`,
              "--width": `${SLOTS[i].width}%`,
              // The resting tilt before the springs take over, so nothing shifts on hydration.
              "--tilt": `${SLOTS[i].tilt}deg`,
              "--delay": `${140 + i * 90}ms`,
            } as CSSProperties
          }
        >
          {/* The pin: comes out while the print is held. */}
          <span
            aria-hidden="true"
            className="absolute -top-1.5 left-1/2 z-10 hidden size-3 -translate-x-1/2 rounded-full bg-thread shadow-[0_2px_3px_oklch(0.2_0.04_262/0.35)] transition-[opacity,scale] duration-150 group-data-dragging:scale-50 group-data-dragging:opacity-0 md:block"
          />
          <GarmentPrint garment={garment} eager />
        </div>
      ))}
    </div>
  );
}
