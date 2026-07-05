import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type Lenis from "lenis"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The app stashes its active Lenis smooth-scroll instance on `window` so
 * imperative scrolls (e.g. nav links) can reach it. The `lenis` package also
 * augments `window.lenis` with an unrelated feature-detection object, so we
 * read/write through `unknown` to our own instance type rather than fight it.
 */
export function setLenisInstance(instance: Lenis): void {
  (window as unknown as { __lenis?: Lenis }).__lenis = instance
}

export function getLenisInstance(): Lenis | undefined {
  return (window as unknown as { __lenis?: Lenis }).__lenis
}
