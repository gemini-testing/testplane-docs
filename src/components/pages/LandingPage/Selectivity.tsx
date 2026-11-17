import React, { useState } from "react";
import Translate, { translate } from "@docusaurus/Translate";
import Link from "@docusaurus/Link";
import { ArrowRight, BranchesRight, Check, CirclePlay, FileCode, Minus } from "@gravity-ui/icons";
import styles from "./selectivity.module.scss";
import landing from "./landing.module.scss";

const tests = [
    translate({ id: "landing.selectivity.home", message: "Open home" }),
    translate({ id: "landing.selectivity.about", message: "Visit About from home" }),
    translate({ id: "landing.selectivity.contact", message: "Open Contact" }),
];
const files = [
    { name: "home.js", tests: [0, 1] },
    { name: "about.js", tests: [1] },
    { name: "contact.js", tests: [2] },
];

export function Selectivity() {
    const [changed, setChanged] = useState(["about.js"]);
    const affected = new Set(
        files.filter(file => changed.includes(file.name)).flatMap(file => file.tests),
    );

    function toggle(name: string) {
        setChanged(previous =>
            previous.includes(name) ? previous.filter(item => item !== name) : [...previous, name],
        );
    }

    return (
        <section>
            <div className={styles.wrap}>
                <div className={styles.copy}>
                    <h2>
                        <Translate id="landing.selectivity.title">
                            Rerun only the affected tests
                        </Translate>
                    </h2>
                    <p>
                        <Translate id="landing.selectivity.copy">
                            Selectivity records which Node.js modules each test loads and which
                            source files it executes in the browser. Choose the files that changed
                            to see which tests run next.
                        </Translate>
                    </p>
                    <Link className={landing.guideLink} to="/docs/guides/selectivity">
                        <Translate id="landing.selectivity.guide">Explore Selectivity</Translate>
                        <ArrowRight />
                    </Link>
                </div>
                <div className={styles.board}>
                    <div className={styles.bar}>
                        <span>
                            <BranchesRight aria-hidden="true" />
                            Selectivity
                        </span>
                        <output aria-live="polite">
                            <Translate
                                id="landing.selectivity.count"
                                values={{ count: affected.size, total: tests.length }}
                            >
                                {"{count} of {total} tests selected"}
                            </Translate>
                        </output>
                    </div>
                    <div className={styles.map}>
                        <span className={styles.fileLabel} id="changed-file-label">
                            <Translate id="landing.selectivity.files">Changed files</Translate>
                        </span>
                        <span className={styles.testLabel}>
                            <Translate id="landing.selectivity.next">Next run</Translate>
                        </span>
                        <div
                            className={styles.files}
                            role="group"
                            aria-labelledby="changed-file-label"
                        >
                            {files.map(file => (
                                <button
                                    key={file.name}
                                    type="button"
                                    aria-pressed={changed.includes(file.name)}
                                    onClick={() => toggle(file.name)}
                                >
                                    <FileCode aria-hidden="true" />
                                    <code>{file.name}</code>
                                    <span className={styles.check} aria-hidden="true">
                                        {changed.includes(file.name) && <Check />}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className={styles.connectors}>
                            <svg
                                className={styles.edges}
                                viewBox="0 0 100 300"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                            >
                                {files.map((file, i) =>
                                    file.tests.map(j => {
                                        const from = 50 + 100 * i,
                                            to = 50 + 100 * j;
                                        const d = `M0 ${from} C50 ${from}, 50 ${to}, 100 ${to}`;
                                        return (
                                            <g
                                                key={file.name + j}
                                                data-active={changed.includes(file.name)}
                                            >
                                                <path d={d} />
                                                <path d={d} className={styles.selectedEdge} />
                                            </g>
                                        );
                                    }),
                                )}
                            </svg>
                        </div>
                        <ul className={styles.results}>
                            {tests.map((test, i) => (
                                <li key={test} data-active={affected.has(i)}>
                                    {affected.has(i) ? (
                                        <CirclePlay aria-hidden="true" />
                                    ) : (
                                        <Minus aria-hidden="true" />
                                    )}
                                    <span>{test}</span>
                                    <small>
                                        {affected.has(i) ? (
                                            <Translate id="landing.selectivity.run">Run</Translate>
                                        ) : (
                                            <Translate id="landing.selectivity.skip">
                                                Skip
                                            </Translate>
                                        )}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
