import { CircleQuestion } from "@gravity-ui/icons";
import clsx from "clsx";
import React from "react";
import { createPortal } from "react-dom";

import styles from "./styles.module.scss";

interface HelpMarkProps {
    children: React.ReactNode;
    className?: string;
    side?: "top" | "bottom" | "left" | "right";
    maxWidth?: number;
}

const GAP = 8;
const SCREEN_PADDING = 8;

const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export function HelpMark({
    children,
    className,
    side = "top",
    maxWidth = 280,
}: HelpMarkProps): React.ReactElement {
    const id = React.useId();

    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const tooltipRef = React.useRef<HTMLDivElement | null>(null);
    const closeTimerRef = React.useRef<number | null>(null);

    const [isOpen, setIsOpen] = React.useState(false);
    const [position, setPosition] = React.useState<{
        top: number;
        left: number;
        ready: boolean;
    }>({
        top: 0,
        left: 0,
        ready: false,
    });

    const clearCloseTimer = React.useCallback(() => {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, []);

    const open = React.useCallback(() => {
        clearCloseTimer();
        setIsOpen(true);
    }, [clearCloseTimer]);

    const close = React.useCallback(() => {
        clearCloseTimer();

        closeTimerRef.current = window.setTimeout(() => {
            setIsOpen(false);
            setPosition(prev => ({ ...prev, ready: false }));
        }, 80);
    }, [clearCloseTimer]);

    const updatePosition = React.useCallback(() => {
        const trigger = triggerRef.current;
        const tooltip = tooltipRef.current;

        if (!trigger || !tooltip) {
            return;
        }

        const triggerRect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const fitsTop = triggerRect.top >= tooltipRect.height + GAP + SCREEN_PADDING;
        const fitsBottom =
            viewportHeight - triggerRect.bottom >= tooltipRect.height + GAP + SCREEN_PADDING;
        const fitsLeft = triggerRect.left >= tooltipRect.width + GAP + SCREEN_PADDING;
        const fitsRight =
            viewportWidth - triggerRect.right >= tooltipRect.width + GAP + SCREEN_PADDING;

        let resolvedSide = side;

        if (side === "top" && !fitsTop && fitsBottom) resolvedSide = "bottom";
        if (side === "bottom" && !fitsBottom && fitsTop) resolvedSide = "top";
        if (side === "left" && !fitsLeft && fitsRight) resolvedSide = "right";
        if (side === "right" && !fitsRight && fitsLeft) resolvedSide = "left";

        let top = 0;
        let left = 0;

        switch (resolvedSide) {
            case "top":
                top = triggerRect.top - tooltipRect.height - GAP;
                left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                break;

            case "bottom":
                top = triggerRect.bottom + GAP;
                left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                break;

            case "left":
                top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                left = triggerRect.left - tooltipRect.width - GAP;
                break;

            case "right":
                top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                left = triggerRect.right + GAP;
                break;
        }

        top = clamp(top, SCREEN_PADDING, viewportHeight - tooltipRect.height - SCREEN_PADDING);
        left = clamp(left, SCREEN_PADDING, viewportWidth - tooltipRect.width - SCREEN_PADDING);

        setPosition({
            top,
            left,
            ready: true,
        });
    }, [side]);

    useIsomorphicLayoutEffect(() => {
        if (!isOpen) {
            return;
        }

        updatePosition();

        let frameId: number | null = null;

        const scheduleUpdate = () => {
            if (frameId !== null) {
                return;
            }

            frameId = window.requestAnimationFrame(() => {
                frameId = null;
                updatePosition();
            });
        };

        window.addEventListener("scroll", scheduleUpdate, true);
        window.addEventListener("resize", scheduleUpdate);

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }

            window.removeEventListener("scroll", scheduleUpdate, true);
            window.removeEventListener("resize", scheduleUpdate);
        };
    }, [isOpen, updatePosition]);

    React.useEffect(() => {
        return clearCloseTimer;
    }, [clearCloseTimer]);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className={clsx(styles.trigger, className)}
                aria-describedby={isOpen ? id : undefined}
                onMouseEnter={open}
                onMouseLeave={close}
                onFocus={open}
                onBlur={close}
            >
                <CircleQuestion />
            </button>

            {isOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        id={id}
                        ref={tooltipRef}
                        role="tooltip"
                        onMouseEnter={open}
                        onMouseLeave={close}
                        className={clsx(styles.tooltip, position.ready && styles.ready)}
                        style={{
                            maxWidth,
                            top: position.top,
                            left: position.left,
                        }}
                    >
                        {children}
                    </div>,
                    document.body,
                )}
        </>
    );
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
