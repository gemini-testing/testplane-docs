import React, { useState } from "react";
import Translate, { translate } from "@docusaurus/Translate";
import Link from "@docusaurus/Link";
import { ArrowRight, Cloud, Display, Smartphone } from "@gravity-ui/icons";
import styles from "./landing.module.scss";

const environments = [
    {
        kind: "local",
        description: translate({
            id: "landing.network.localAlt",
            message: "Four browsers on a local machine",
        }),
        label: translate({ id: "landing.network.local", message: "Local machine" }),
        icon: Display,
        targets: ["Chrome", "Firefox", "Edge", "Safari"],
        connection: 'gridUrl: "local"',
    },
    {
        kind: "grid",
        description: translate({
            id: "landing.network.gridAlt",
            message:
                "Example remote grid with 12 sessions each for Chrome, Firefox, Edge, and Safari",
        }),
        label: translate({ id: "landing.network.grid", message: "Remote grid" }),
        icon: Cloud,
        targets: ["Chrome", "Firefox", "Edge", "Safari"],
        connection: "gridUrl: process.env.GRID_URL",
    },
    {
        kind: "devices",
        description: translate({
            id: "landing.network.devicesAlt",
            message: "Chrome on Android and Safari on iOS",
        }),
        label: translate({ id: "landing.network.device", message: "Real devices" }),
        icon: Smartphone,
        targets: ["Android · Chrome", "iOS · Safari"],
        connection: "gridUrl: process.env.APPIUM_URL",
    },
];

const anchors = [
    [130, 60],
    [454, 66],
    [107, 185],
    [472, 196],
];
const paths = [
    "M262 116Q222 61 130 60",
    "M314 118Q360 64 454 66",
    "M259 151Q213 184 107 185",
    "M315 151Q388 202 472 196",
];

const pools = [
    [115, 62],
    [465, 62],
    [115, 178],
    [465, 178],
];
const gridRoutes = [
    "M249 132H220Q212 132 212 124V70Q212 62 204 62H185",
    "M325 132H360Q368 132 368 124V70Q368 62 376 62H391",
    "M249 132H220Q212 132 212 140V170Q212 178 204 178H185",
    "M325 132H360Q368 132 368 140V170Q368 178 376 178H391",
];
const poolSize = 12;

function BrowserLabel({ name, x, y = 0 }: { name: string; x: number; y?: number }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <circle r="2.7" fill="var(--accent)" />
            <text x="10" dominantBaseline="central" fontSize="12" fill="var(--ink)">
                {name}
            </text>
        </g>
    );
}

function GridPool({ name }: { name: string }) {
    return (
        <g transform="translate(-77 -37)">
            <rect width="154" height="74" rx="8" fill="var(--card)" stroke="var(--line-strong)" />
            <BrowserLabel name={name} x={13} y={15} />
            <text
                x="142"
                y="15"
                dominantBaseline="central"
                textAnchor="end"
                fill="var(--muted)"
                fontSize="11"
            >
                ×{poolSize}
            </text>
            {Array.from({ length: poolSize }, (_, i) => (
                <g
                    key={i}
                    transform={`translate(${12 + (i % 6) * 23} ${31 + Math.floor(i / 6) * 17})`}
                >
                    <rect
                        width="17"
                        height="12"
                        rx="2"
                        fill="var(--selection)"
                        stroke="var(--route)"
                        strokeWidth=".9"
                    />
                    <path d="M1 4h15" fill="none" stroke="var(--route)" strokeWidth=".9" />
                </g>
            ))}
        </g>
    );
}

export function BrowserNetwork() {
    const [selected, setSelected] = useState(() =>
        environments.findIndex(env => env.kind === "grid"),
    );
    const { targets, connection, kind, description, icon: Icon } = environments[selected];
    const grid = kind === "grid";
    return (
        <section className={styles.networkSection}>
            <div className={styles.networkWrap}>
                <div className={styles.networkCopy}>
                    <h2>
                        <Translate id="landing.network.title">One suite, any browser</Translate>
                    </h2>
                    <p>
                        <Translate id="landing.network.copy">
                            Run Chrome, Firefox, Edge, and Safari on the platforms you support. Keep
                            the same tests when you move from your laptop to a CI grid or a real
                            phone.
                        </Translate>
                    </p>
                    <Link className={styles.guideLink} to="/docs/basic-guides/browsers-overview">
                        <Translate id="landing.network.guide">
                            Explore browser environments
                        </Translate>
                        <ArrowRight />
                    </Link>
                </div>
                <div className={styles.networkMap}>
                    <div
                        className={styles.networkChoices}
                        role="group"
                        aria-label={translate({
                            id: "landing.network.control",
                            message: "Execution environment",
                        })}
                    >
                        {environments.map(({ label, icon: Item }, i) => (
                            <button
                                type="button"
                                key={label}
                                aria-pressed={i === selected}
                                onClick={() => setSelected(i)}
                            >
                                <Item />
                                {label}
                            </button>
                        ))}
                    </div>
                    <svg
                        viewBox="0 0 580 236"
                        role="img"
                        aria-label={description}
                        className={styles.networkChart}
                    >
                        <defs>
                            <pattern
                                id="atlas-cross"
                                width="31"
                                height="31"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M15 13v4m-2-2h4"
                                    stroke="var(--line-strong)"
                                    strokeWidth=".65"
                                />
                            </pattern>
                        </defs>
                        <rect width="580" height="236" fill="url(#atlas-cross)" opacity=".5" />
                        {!grid && (
                            <g
                                fill="none"
                                stroke="var(--line-strong)"
                                transform="translate(287 132) rotate(-20)"
                                strokeWidth=".8"
                            >
                                <circle r="83" strokeDasharray="2 6" />
                                <ellipse rx="192" ry="59" strokeDasharray="3 5" />
                                <ellipse rx="238" ry="76" opacity=".45" />
                            </g>
                        )}
                        <g key={selected} className={styles.routeGroup}>
                            {targets.map((name, i) => {
                                const node = kind === "devices" ? i * 3 : i;
                                const [x, y] = grid ? pools[i] : anchors[node];
                                const route = grid ? gridRoutes[i] : paths[node];
                                const width = kind === "devices" ? 144 : 94;
                                return (
                                    <g key={name}>
                                        <path
                                            d={route}
                                            fill="none"
                                            stroke="var(--route)"
                                            strokeWidth="1.5"
                                        />
                                        <path
                                            d={route}
                                            className={styles.routeLight}
                                            pathLength="100"
                                            fill="none"
                                            stroke="var(--accent)"
                                            strokeWidth="2.6"
                                            strokeLinecap="round"
                                            strokeDasharray="4 100"
                                            style={{ animationDelay: -0.45 * i + "s" }}
                                        />
                                        <g transform={`translate(${x} ${y})`}>
                                            {grid ? (
                                                <GridPool name={name} />
                                            ) : (
                                                <>
                                                    <rect
                                                        x={-width / 2}
                                                        y="-15"
                                                        width={width}
                                                        height="30"
                                                        rx="15"
                                                        fill="var(--card)"
                                                        stroke="var(--line-strong)"
                                                    />
                                                    <BrowserLabel name={name} x={13 - width / 2} />
                                                </>
                                            )}
                                        </g>
                                    </g>
                                );
                            })}
                        </g>
                        <g transform="translate(287 132)">
                            <circle r="39" fill="var(--wash)" stroke="var(--route)" />
                            <circle r="31" fill="var(--ink)" />
                            <Icon
                                key={selected}
                                x="-15"
                                y="-15"
                                width="30"
                                height="30"
                                color="var(--card)"
                                className={styles.nodeIcon}
                            />
                        </g>
                    </svg>
                    <div className={styles.networkConfig}>
                        <span>testplane.config.ts</span>
                        <code key={connection}>{connection}</code>
                    </div>
                </div>
            </div>
        </section>
    );
}
