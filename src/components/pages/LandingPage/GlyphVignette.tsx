import React, { useEffect, useRef } from "react";
import styles from "./landing.module.scss";

const alphabet = Array.from("01Z7<>:∴∆⌁⋮+×/アイカサタナハミメユヨラリ");
const character = (n: number) => alphabet[Math.floor(n * alphabet.length)];

function makeField(width: number, height: number, seed: number, right: boolean) {
    let state = seed;
    const random = () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
    const cells = [];
    for (let x = 5; x < width; x += 11) {
        const u = (right ? width - x : x) / width;
        const center = height * (0.51 + 0.16 * Math.sin(5 * u + seed));
        const spread = height * (0.23 + 0.13 * random()) * (1 - u * u);
        const drift = Math.round(random() * 5);
        for (let y = 6 + drift; y < height; y += 14) {
            const weight = Math.max(0, 1 - Math.abs(y - center) / spread) * (1 - u * u);
            if (weight < 0.04 || random() > 0.47 + 0.5 * weight) continue;
            cells.push({
                x,
                y,
                glyph: character(random()),
                alpha: weight * (0.1 + 0.15 * random()),
            });
        }
    }
    return cells;
}

function GlyphPatch({ seed, right = false }: { seed: number; right?: boolean }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        const section = canvas?.closest("section");
        if (!canvas || !ctx || !section) return;

        let field: ReturnType<typeof makeField> = [];
        let lit = new Set<number>();
        let frame = 0;
        let change: { index: number; from: string; started: number } | undefined;
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

        const paint = (now: number) => {
            frame = 0;
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            const progress = change ? Math.min(1, (now - change.started) / 900) : 1;
            for (const [i, cell] of field.entries()) {
                const alpha = cell.alpha + (lit.has(i) ? 0.23 : 0);
                ctx.globalAlpha = alpha;
                if (i === change?.index && progress < 1) {
                    ctx.globalAlpha = alpha * (1 - progress);
                    ctx.fillText(change.from, cell.x, cell.y);
                    ctx.globalAlpha = alpha * progress;
                }
                ctx.fillText(cell.glyph, cell.x, cell.y);
            }
            if (progress < 1) frame = requestAnimationFrame(paint);
            else change = undefined;
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(paint);
        };
        const resize = () => {
            const { clientWidth: width, clientHeight: height } = canvas;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.fillStyle = getComputedStyle(canvas).color;
            ctx.font = "10px ui-monospace, monospace";
            ctx.textAlign = "center";
            field = makeField(width, height, seed, right);
            change = undefined;
            lit.clear();
            schedule();
        };
        const clear = () => {
            if (!lit.size) return;
            lit.clear();
            schedule();
        };
        const point = (event: PointerEvent) => {
            if (motion.matches || event.pointerType === "touch") return;
            const box = canvas.getBoundingClientRect();
            const x = event.clientX - box.left,
                y = event.clientY - box.top;
            if (x < 0 || x > box.width || y < 0 || y > box.height) return clear();
            const near = field
                .map((cell, i) => ({ i, d: (cell.x - x) ** 2 + (cell.y - y) ** 2 }))
                .filter(({ d }) => d < 46 ** 2)
                .sort((a, b) => a.d - b.d)
                .slice(0, 8);
            if (near.length === lit.size && near.every(({ i }) => lit.has(i))) return;
            lit = new Set(near.map(({ i }) => i));
            schedule();
        };

        const size = new ResizeObserver(resize);
        size.observe(canvas);
        // Swap just one visible character per interval. Idle fields need no render loop.
        const interval = window.setInterval(
            () => {
                if (motion.matches || document.hidden || !field.length) return;
                const box = canvas.getBoundingClientRect();
                if (box.bottom < 0 || box.top > window.innerHeight) return;
                const i = Math.floor(Math.random() * field.length);
                change = { index: i, from: field[i].glyph, started: performance.now() };
                field[i].glyph = character(Math.random());
                schedule();
            },
            10500 + seed * 93,
        );
        section.addEventListener("pointermove", point, { passive: true });
        section.addEventListener("pointerleave", clear);
        motion.addEventListener("change", clear);
        return () => {
            cancelAnimationFrame(frame);
            clearInterval(interval);
            size.disconnect();
            section.removeEventListener("pointermove", point);
            section.removeEventListener("pointerleave", clear);
            motion.removeEventListener("change", clear);
        };
    }, [right, seed]);

    return (
        <canvas
            aria-hidden="true"
            ref={ref}
            className={styles.glyphPatch}
            data-edge={right ? "right" : "left"}
        />
    );
}

export function GlyphVignette({ seed }: { seed: number }) {
    return (
        <>
            <GlyphPatch seed={seed} />
            <GlyphPatch seed={seed + 13} right />
        </>
    );
}
