import { ViewTransition, type ReactNode } from "react";

const directions = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

/**
 * Wrap a page's content so links tagged `transitionTypes={["nav-forward"]}` slide it in from
 * the right (deeper) and `["nav-back"]` from the left (back out). Untagged navigations,
 * like switching tabs or the browser's back button, don't animate. The app chrome stays put.
 */
export function DirectionalPage({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={directions} exit={directions} default="none">
      {children}
    </ViewTransition>
  );
}
