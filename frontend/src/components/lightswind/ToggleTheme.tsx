"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "../lib/utils"

// Define the possible animation types
type AnimationType =
    | "none"
    | "circle-spread"
    | "round-morph"
    | "swipe-left"
    | "swipe-up"
    | "diag-down-right"
    | "fade-in-out"
    | "shrink-grow"
    | "flip-x-in"
    | "split-vertical"
    | "swipe-right"
    | "swipe-down"
    | "wave-ripple"

interface ToggleThemeProps
    extends React.ComponentPropsWithoutRef<"button"> {
    duration?: number
    animationType?: AnimationType
}

export const ToggleTheme = ({
    className,
    duration = 400,
    animationType = "circle-spread",
    ...props
}: ToggleThemeProps) => {
    const [isDark, setIsDark] = useState(true)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"))
        }

        updateTheme()

        const observer = new MutationObserver(updateTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        })

        return () => observer.disconnect()
    }, [])

    const applyThemeChange = useCallback(() => {
        const newTheme = !isDark
        setIsDark(newTheme)
        if (newTheme) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
        localStorage.setItem("theme", newTheme ? "dark" : "light")
    }, [isDark])

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return

        // Check if View Transitions API is supported
        if (typeof document.startViewTransition !== 'function') {
            // Fallback for browsers without View Transitions API
            applyThemeChange()
            return
        }

        try {
            // Wait for the DOM update to complete within the View Transition
            const transition = document.startViewTransition(() => {
                flushSync(() => {
                    applyThemeChange()
                })
            })

            await transition.ready

            // Calculate coordinates and dimensions for spatial animations
            const { top, left, width, height } =
                buttonRef.current.getBoundingClientRect()
            const x = left + width / 2
            const y = top + height / 2
            const maxRadius = Math.hypot(
                Math.max(left, window.innerWidth - left),
                Math.max(top, window.innerHeight - top)
            )
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            // Apply the selected animation
            switch (animationType) {
                case "circle-spread":
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `circle(0px at ${x}px ${y}px)`,
                                `circle(${maxRadius}px at ${x}px ${y}px)`,
                            ],
                        },
                        {
                            duration,
                            easing: "ease-in-out",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    )
                    break

                case "round-morph":
                    document.documentElement.animate(
                        [
                            { opacity: 0, transform: "scale(0.8) rotate(5deg)" },
                            { opacity: 1, transform: "scale(1) rotate(0deg)" },
                        ],
                        {
                            duration: duration * 1.2,
                            easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    )
                    break

                case "swipe-left":
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `inset(0 0 0 ${viewportWidth}px)`,
                                `inset(0 0 0 0)`,
                            ],
                        },
                        {
                            duration,
                            easing: "cubic-bezier(0.2, 0, 0, 1)",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    )
                    break

                case "swipe-up":
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `inset(${viewportHeight}px 0 0 0)`,
                                `inset(0 0 0 0)`,
                            ],
                        },
                        {
                            duration,
                            easing: "cubic-bezier(0.2, 0, 0, 1)",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    )
                    break

                case "fade-in-out":
                    document.documentElement.animate(
                        {
                            opacity: [0, 1],
                        },
                        {
                            duration: duration * 0.5,
                            easing: "ease-in-out",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    )
                    break

                case "swipe-right":
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `inset(0 ${viewportWidth}px 0 0)`,
                                `inset(0 0 0 0)`,
                            ],
                        },
                        {
                            duration,
                            easing: "cubic-bezier(0.2, 0, 0, 1)",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    )
                    break

                case "swipe-down":
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `inset(0 0 ${viewportHeight}px 0)`,
                                `inset(0 0 0 0)`,
                            ],
                        },
                        {
                            duration,
                            easing: "cubic-bezier(0.2, 0, 0, 1)",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    )
                    break

                case "wave-ripple":
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `circle(0% at 50% 50%)`,
                                `circle(${maxRadius}px at 50% 50%)`,
                            ],
                        },
                        {
                            duration: duration * 1.5,
                            easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    )
                    break

                case "none":
                default:
                    break
            }
        } catch (error) {
            // If View Transition fails, apply theme change directly
            console.warn('View Transition failed, applying theme directly:', error)
            applyThemeChange()
        }
    }, [isDark, duration, animationType, applyThemeChange])

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleTheme}
                className={cn(
                    "p-2 rounded-full transition-colors duration-300",
                    "bg-[var(--background-card)] border border-[var(--border)] hover:border-[var(--border-hover)]",
                    isDark ? "hover:text-amber-400 text-[var(--accent-cream)]" : "hover:text-blue-500 text-[var(--primary)]",
                    className
                )}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                {...props}
            >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Override default view transition animation */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        ::view-transition-old(root),
                        ::view-transition-new(root) {
                            animation: none;
                            mix-blend-mode: normal;
                        }
                    `,
                }}
            />
        </>
    )
}

export default ToggleTheme
