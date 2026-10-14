/**
 * Below `xl` the form and the result stack, so on a phone the result lands a screen or
 * more below the button that asked for it. Bring it into view as soon as styling starts.
 */
export function revealResult(section: HTMLElement | null) {
  if (!section || window.matchMedia("(min-width: 80rem)").matches) return;
  const top = section.getBoundingClientRect().top;
  if (top > 0 && top < window.innerHeight * 0.6) return; // already in view
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
