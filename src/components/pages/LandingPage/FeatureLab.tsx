import React, { useEffect, useRef, useState } from "react";
import Translate, { translate } from "@docusaurus/Translate";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link";
import { ArrowRight, PlayFill } from "@gravity-ui/icons";
import { WorkerDiagram } from "./WorkerDiagram";
import styles from "./landing.module.scss";

function GuideLink({ path, children }: { path: string; children: React.ReactNode }) {
    return (
        <Link className={styles.guideLink} to={"/docs/basic-guides/" + path}>
            {children}
            <ArrowRight />
        </Link>
    );
}

// The single cluster reported by looks-same in the 430 × 206 field-card screenshots.
const periodCluster = { left: 170, top: 177, right: 241, bottom: 190 };
const bubblePosition = {
    left: `${((periodCluster.left + periodCluster.right) / 2 / 430) * 100}%`,
    top: `${((periodCluster.top + periodCluster.bottom) / 2 / 206) * 100}%`,
    width: `${(Math.hypot(periodCluster.right - periodCluster.left + 1, periodCluster.bottom - periodCluster.top + 1) / 430) * 100}%`,
};

function DiffDiagram() {
    const [position, setPosition] = useState(52);
    const [pixels, setPixels] = useState(false);
    const root = useBaseUrl("/img/landing/atlas-");
    const [pulse, setPulse] = useState(0);
    const drag = useRef<{ id: number; start: number; moved: boolean } | null>(null);

    useEffect(() => {
        if (!pulse) return;
        const timer = window.setTimeout(() => setPulse(0), 1000);
        return () => window.clearTimeout(timer);
    }, [pulse]);
    return (
        <div className={styles.diffDemo}>
            <div
                className={styles.segmented}
                role="group"
                aria-label={translate({ id: "landing.diff.mode", message: "Comparison mode" })}
            >
                <button type="button" aria-pressed={!pixels} onClick={() => setPixels(false)}>
                    <Translate id="landing.diff.swipe">Swipe</Translate>
                </button>
                <button type="button" aria-pressed={pixels} onClick={() => setPixels(true)}>
                    <Translate id="landing.diff.pixels">Pixel diff</Translate>
                </button>
            </div>
            <div className={styles.diffImage}>
                <img
                    src={root + (pixels ? "diff" : "current") + ".webp"}
                    width="430"
                    height="206"
                    loading="lazy"
                    alt={
                        pixels
                            ? translate({
                                  id: "landing.diff.alt",
                                  message: "Highlighted pixels on the changed orbital period",
                              })
                            : translate({
                                  id: "landing.diff.actual",
                                  message: "Current Saturn field card",
                              })
                    }
                />
                {!pixels && (
                    <>
                        <img
                            src={root + "reference.webp"}
                            alt=""
                            width="430"
                            height="206"
                            loading="lazy"
                            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
                        />
                        <span
                            className={styles.wipeHandle}
                            style={{ left: position + "%" }}
                            aria-hidden="true"
                        >
                            <i>‹ ›</i>
                        </span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={position}
                            onChange={e => setPosition(Number(e.target.value))}
                            aria-label={translate({
                                id: "landing.lab.compare",
                                message: "Compare reference and current screenshot",
                            })}
                        />
                    </>
                )}
                <button
                    type="button"
                    className={styles.diffSurface}
                    aria-label={translate({
                        id: "landing.diff.locate",
                        message: "Circle the changed pixels",
                    })}
                    aria-describedby="diff-bubble-hint"
                    onPointerDown={event => {
                        drag.current = null;
                        if (pixels || !event.isPrimary || event.button !== 0) return;
                        drag.current = { id: event.pointerId, start: event.clientX, moved: false };
                        event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={event => {
                        const gesture = drag.current;
                        if (!gesture || gesture.id !== event.pointerId || !event.buttons) return;
                        if (!gesture.moved && Math.abs(event.clientX - gesture.start) < 4) return;
                        gesture.moved = true;
                        const rect = event.currentTarget.getBoundingClientRect();
                        setPosition(
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    Math.round((100 * (event.clientX - rect.left)) / rect.width),
                                ),
                            ),
                        );
                    }}
                    onPointerCancel={() => {
                        drag.current = null;
                    }}
                    onClick={event => {
                        if (event.detail === 0 || !drag.current?.moved) setPulse(n => n + 1);
                        drag.current = null;
                    }}
                />
                {pulse > 0 && (
                    <span
                        key={pulse}
                        className={styles.diffBubbleAnchor}
                        style={bubblePosition}
                        aria-hidden="true"
                    >
                        <span className={styles.diffBubble} />
                    </span>
                )}
            </div>
            <p id="diff-bubble-hint" className={styles.diffHint}>
                <Translate id="landing.diff.hint">Click the image to circle the change</Translate>
            </p>
        </div>
    );
}

const commands = ["url('/catalog')", "setValue('Saturn')", "click()"];
function SnapshotDiagram() {
    const [frame, setFrame] = useState(0);
    const [playing, setPlaying] = useState(false);
    useEffect(() => {
        if (!playing) return;
        const timer = window.setTimeout(() => {
            if (frame === 2) {
                setPlaying(false);
            } else {
                setFrame(frame + 1);
            }
        }, 850);
        return () => window.clearTimeout(timer);
    }, [frame, playing]);
    return (
        <div className={styles.snapshot}>
            <svg viewBox="0 0 420 120" aria-hidden="true">
                <g fill="none" stroke="var(--line-strong)">
                    <rect x="67" y="8" width="287" height="105" rx="6" fill="var(--card)" />
                    <path d="M67 26h287" />
                    {[79, 85, 91].map(cx => (
                        <circle key={cx} cx={cx} cy="17" r="1.3" />
                    ))}
                </g>
                <g>
                    <rect
                        x="81"
                        y="37"
                        width="162"
                        height="20"
                        rx="4"
                        fill="var(--diagram-bg)"
                        stroke="var(--line)"
                    />
                    <circle cx="94" cy="46" r="3" fill="none" stroke="var(--muted)" />
                    <path d="m96 49 3 3" stroke="var(--muted)" />
                    {frame > 0 && (
                        <text x="106" y="51" fill="var(--ink)" fontSize="11">
                            Saturn
                        </text>
                    )}
                    {(frame === 0 ? [0, 1, 2] : [0]).map(i => (
                        <g key={i} transform={`translate(${81 + i * 88} 66)`}>
                            <rect
                                width="80"
                                height="34"
                                rx="4"
                                fill={frame === 2 ? "var(--ink)" : "var(--diagram-bg)"}
                                stroke="var(--line)"
                            />
                            <circle
                                cx="17"
                                cy="17"
                                r={6 + i}
                                fill={frame === 2 ? "var(--card)" : "var(--muted)"}
                            />
                            <path
                                d="M32 14h34m-34 6h23"
                                stroke="var(--line-strong)"
                                strokeWidth="2"
                            />
                        </g>
                    ))}
                    <path
                        d="m0 0 3 14 3-5 5-1Z"
                        className={styles.frameCursor}
                        style={{
                            transform: `translate(${[266, 200, 141][frame]}px,${[83, 47, 81][frame]}px)`,
                        }}
                        stroke="var(--card)"
                        fill="var(--ink)"
                    />
                </g>
            </svg>
            <div className={styles.timeline}>
                <button
                    type="button"
                    onClick={() => {
                        setFrame(0);
                        setPlaying(true);
                    }}
                    aria-label={translate({
                        id: "landing.lab.play",
                        message: "Replay the three snapshots",
                    })}
                >
                    <PlayFill />
                </button>
                <div className={styles.frames}>
                    {commands.map((cmd, i) => (
                        <button
                            key={cmd}
                            type="button"
                            aria-pressed={frame === i}
                            aria-label={cmd}
                            onClick={() => {
                                setPlaying(false);
                                setFrame(i);
                            }}
                        >
                            <span />
                        </button>
                    ))}
                </div>
                <span className={styles.commandLabel}>{commands[frame]}</span>
            </div>
        </div>
    );
}

export function FeatureLab() {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.setAttribute("data-visible", "true");
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return (
        <section className={styles.lab} ref={ref}>
            <h2>
                <Translate id="landing.lab.title">Inside a test run</Translate>
            </h2>
            <article className={styles.parallel}>
                <div className={styles.featureCopy}>
                    <h3>
                        <Translate id="landing.lab.parallel">Run tests in parallel</Translate>
                    </h3>
                    <p>
                        <Translate id="landing.lab.parallelBody">
                            Each worker can run several browser sessions at once. Set concurrency
                            limits per browser and shard large suites across CI jobs.
                        </Translate>
                    </p>
                    <GuideLink path="parallelism">
                        <Translate id="landing.guide.parallel">Explore parallelism</Translate>
                    </GuideLink>
                </div>
                <WorkerDiagram />
            </article>
            <div className={styles.pair}>
                <article>
                    <DiffDiagram />
                    <div className={styles.featureCopy}>
                        <h3>
                            <Translate id="landing.lab.diff">Catch the visual change</Translate>
                        </h3>
                        <p>
                            <Translate
                                id="landing.atlas.diffBody"
                                values={{ command: <code>assertView</code> }}
                            >
                                {
                                    "Compare an element or the whole viewport against a reference screenshot with {command}. Ignore dynamic regions, review changed pixels, and approve new references in Testplane UI."
                                }
                            </Translate>
                        </p>
                        <GuideLink path="visual-testing">
                            <Translate id="landing.guide.visual">Explore visual testing</Translate>
                        </GuideLink>
                    </div>
                </article>
                <article>
                    <SnapshotDiagram />
                    <div className={styles.featureCopy}>
                        <h3>
                            <Translate id="landing.lab.time">Rewind to a command</Translate>
                        </h3>
                        <p>
                            <Translate id="landing.lab.timeBody">
                                Pick a point on the timeline. Time travel records DOM snapshots so
                                you can inspect the browser at each step.
                            </Translate>
                        </p>
                        <GuideLink path="time-travel">
                            <Translate id="landing.guide.replay">Explore Time Travel</Translate>
                        </GuideLink>
                    </div>
                </article>
            </div>
        </section>
    );
}
