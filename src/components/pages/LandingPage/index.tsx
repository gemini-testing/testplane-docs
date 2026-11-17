import React from "react";
import Translate from "@docusaurus/Translate";
import Link from "@docusaurus/Link";
import { ArrowRight, ChevronRight, Terminal } from "@gravity-ui/icons";
import { useLatestVersion } from "@docusaurus/plugin-content-docs/client";
import CopyButton from "@site/src/theme/CodeBlock/CopyButton";
import { GlyphVignette } from "./GlyphVignette";
import { Selectivity } from "./Selectivity";
import { OrbitField } from "./OrbitField";
import { ReportPreview } from "./ReportPreview";
import { BrowserNetwork } from "./BrowserNetwork";
import { TestExample } from "./TestExample";
import { AgentConsole } from "./AgentConsole";
import { FeatureLab } from "./FeatureLab";
import styles from "./landing.module.scss";

const installCommand = "npm init testplane@latest";

const horizonStars = Array.from({ length: 66 }, (_, i) => ({
    x: (83 + 613 * i + 17 * i * i) % 1201,
    y: (19 + 79 * i + 5 * i * i) % 287,
}));

export function LandingPage() {
    const version = useLatestVersion(undefined);
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.space}>
                    <GlyphVignette seed={7} />
                    <OrbitField />
                </div>
                <div className={styles.intro}>
                    <Link to="/docs" className={styles.release}>
                        <span />
                        Testplane {version.label}
                        <ChevronRight />
                    </Link>
                    <h1>
                        <Translate id="landing.studio.head">From code</Translate>
                        <br />
                        <em>
                            <Translate id="landing.studio.headEnd">to confidence.</Translate>
                        </em>
                    </h1>
                    <p>
                        <Translate id="landing.studio.intro">
                            Build and ship better web apps with end-to-end tests in real browsers.
                            Compare screenshots and rewind to the step that failed.
                        </Translate>
                    </p>
                    <div className={styles.actions}>
                        <Link to="/docs/quickstart" className={styles.primary}>
                            <Translate id="landing.getStartedButton">Get started</Translate>
                            <ArrowRight />
                        </Link>
                        <Link to="/docs" className={styles.secondary}>
                            <Translate id="landing.studio.docs">Read the docs</Translate>
                            <ChevronRight />
                        </Link>
                    </div>
                </div>
                <div className={styles.showcase}>
                    <ReportPreview />
                </div>
            </section>
            <div className={styles.blueprint}>
                <BrowserNetwork />
                <TestExample />
                <Selectivity />
                <FeatureLab />
                <AgentConsole />
            </div>
            <section className={styles.install}>
                <GlyphVignette seed={23} />
                <svg
                    viewBox="0 0 1200 290"
                    preserveAspectRatio="xMidYMax slice"
                    className={styles.horizon}
                    aria-hidden="true"
                >
                    <g className={styles.horizonStars} fill="currentColor">
                        {horizonStars.map(({ x, y }, i) => (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={i % 6 === 0 ? 1.05 : 0.65}
                                opacity={0.28 + (i % 4) * 0.11}
                            />
                        ))}
                    </g>
                    <g fill="none">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <ellipse
                                key={i}
                                cx="600"
                                cy={480 + i * 9}
                                rx={555 + i * 20}
                                ry="231"
                                stroke={i === 0 ? "#b39bff" : "#706583"}
                                opacity={i === 0 ? 0.75 : 0.26}
                                strokeWidth={i === 0 ? 1.2 : 0.7}
                            />
                        ))}
                    </g>
                </svg>
                <h2>
                    <Translate id="landing.install.title">Run your first test</Translate>
                </h2>
                <div className={styles.command}>
                    <Terminal aria-hidden="true" />
                    <span>{installCommand}</span>
                    <CopyButton code={installCommand} className={styles.copy} />
                </div>
                <Link className={styles.guideLink} to="/docs/quickstart">
                    <Translate id="landing.install.guide">Follow the quickstart</Translate>
                    <ArrowRight />
                </Link>
            </section>
        </main>
    );
}
