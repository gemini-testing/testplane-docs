import React, { useState } from "react";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "./landing.module.scss";

const browserIcons = {
    Chrome: (
        <>
            <circle cx="8" cy="8" r="6.1" />
            <circle cx="8" cy="8" r="2.4" />
            <path d="M8 5.6h5.6M5.95 9.3 3 4.4m6.85 5.16-2.8 4.45" />
        </>
    ),
    Firefox: (
        <path d="M11.8 2.2c.3 2.4 2.6 3.4 2.4 6.7-.2 3.1-2.9 5.4-6.2 5.3-3.3-.1-5.9-2.4-6-5.5 0-1.3.4-2.7 1.1-3.9l.7 2.1c.4-1.1 1.4-2.1 2.6-2.9l-.1 2.5c.8-.3 1.6-.3 2.4.1-1.6.3-2.5 1.4-2.2 2.9.3 1.5 2 2.4 3.5 1.9 1.5-.5 2.1-1.8 1.8-3.1-.2-1.1-1-2-1.3-3.2-.3-1 .2-2.1 1.3-2.9Z" />
    ),
    Safari: (
        <>
            <circle cx="8" cy="8" r="6.1" />
            <path d="m10.9 5.1-1.8 4-4 1.8 1.8-4Z" />
        </>
    ),
} as const;

const sessionPairs = [
    ["Chrome", "Firefox"],
    ["Firefox", "Safari"],
    ["Safari", "Chrome"],
] as const;

const workerRows = sessionPairs.map((_, i) => 59 + i * 63);
const middleRow = workerRows[1];
const sessions = sessionPairs.flatMap((pair, worker) =>
    pair.map((name, slot) => ({ name, worker, y: workerRows[worker] + (slot === 0 ? -14 : 14) })),
);

const workerX = 108;
const workerWidth = 100;
const workerRight = workerX + workerWidth;
const sessionX = 266;

function Connection({ path, outbound = false }: { path: string; outbound?: boolean }) {
    return (
        <g>
            <path d={path} fill="none" stroke="var(--route)" strokeWidth="1.1" />
            <circle
                r="2.3"
                className={outbound ? styles.sessionPacket : styles.workerPacket}
                fill="var(--accent)"
                style={{ offsetPath: `path('${path}')` }}
            />
        </g>
    );
}

export function WorkerDiagram() {
    const [count, setCount] = useState(3);
    const workers = count === 1 ? [middleRow] : workerRows;
    return (
        <div className={styles.workbench}>
            <div className={styles.diagramControls}>
                <div
                    className={styles.segmented}
                    role="group"
                    aria-label={translate({
                        id: "landing.lab.workersLabel",
                        message: "Worker count",
                    })}
                >
                    {[1, 3].map(n => (
                        <button
                            key={n}
                            type="button"
                            aria-pressed={count === n}
                            onClick={() => setCount(n)}
                        >
                            {n === 1 ? (
                                <Translate id="landing.lab.one">1 worker</Translate>
                            ) : (
                                <Translate id="landing.lab.three">3 workers</Translate>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <svg
                key={count}
                viewBox="0 0 388 223"
                className={styles.pipeline}
                role="img"
                aria-label={
                    count === 1
                        ? translate({
                              id: "landing.workers.single",
                              message: "One worker drives all six browser sessions concurrently",
                          })
                        : translate({
                              id: "landing.workers.multiple",
                              message: "Three workers each drive two browser sessions concurrently",
                          })
                }
            >
                <g fontSize="11" fill="var(--muted)" textAnchor="middle">
                    <text x="36" y="15">
                        <Translate id="landing.workers.suite">Suite</Translate>
                    </text>
                    <text x={workerX + workerWidth / 2} y="15">
                        <Translate id="landing.workers.processes">Workers</Translate>
                    </text>
                    <text x={sessionX + 53} y="15">
                        <Translate id="landing.workers.sessions">Browser sessions</Translate>
                    </text>
                </g>
                {workers.map(y => (
                    <Connection
                        key={y}
                        path={`M56 ${middleRow} C80 ${middleRow} 84 ${y} ${workerX} ${y}`}
                    />
                ))}
                {sessions.map(({ name, worker, y }) => {
                    const from = count === 1 ? middleRow : workerRows[worker];
                    return (
                        <Connection
                            key={worker + name}
                            outbound
                            path={`M${workerRight} ${from} C236 ${from} 238 ${y} ${sessionX} ${y}`}
                        />
                    );
                })}
                <g transform={`translate(16 ${middleRow - 19})`}>
                    <rect
                        width="40"
                        height="38"
                        rx="6"
                        fill="var(--card)"
                        stroke="var(--line-strong)"
                    />
                    <g
                        transform="translate(10 9)"
                        fill="none"
                        stroke="var(--ink)"
                        strokeWidth="1.1"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    >
                        <path d="M2 4v13a1 1 0 0 0 1 1h11M5 2h9l4 4v9H5ZM13 2v5h5M8 10h6" />
                    </g>
                </g>
                {workers.map((y, i) => (
                    <g key={i} transform={`translate(${workerX} ${y})`}>
                        <rect
                            y="-16"
                            width={workerWidth}
                            height="32"
                            rx="5"
                            fill="var(--card)"
                            stroke="var(--line-strong)"
                        />
                        <g
                            transform="translate(10 -8)"
                            fill="none"
                            stroke="var(--muted)"
                            strokeWidth="1"
                            strokeLinecap="round"
                        >
                            <rect x="3.2" y="3.2" width="9.6" height="9.6" rx="1.8" />
                            <path d="M6 1v2m4-2v2M6 13v2m4-2v2M1 6h2m-2 4h2m10-4h2m-2 4h2" />
                        </g>
                        <text x="34" dominantBaseline="central" fontSize="11" fill="var(--ink)">
                            <Translate id="landing.workers.worker" values={{ n: i + 1 }}>
                                {"Worker {n}"}
                            </Translate>
                        </text>
                    </g>
                ))}
                {sessions.map(({ name, worker, y }) => (
                    <g key={worker + name} transform={`translate(${sessionX} ${y})`}>
                        <rect
                            y="-11.5"
                            width="106"
                            height="23"
                            rx="5"
                            fill="var(--card)"
                            stroke="var(--route)"
                        />
                        <g
                            transform="translate(9 -8)"
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="1.05"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        >
                            {browserIcons[name]}
                        </g>
                        <text x="32" dominantBaseline="central" fontSize="12" fill="var(--ink)">
                            {name}
                        </text>
                        <circle cx="94" r="2" fill="var(--accent)" opacity=".55" />
                        <circle
                            cx="94"
                            r="4.5"
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth=".85"
                            className={styles.sessionSignal}
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}
