import React, { useState } from "react";
import Translate, { translate } from "@docusaurus/Translate";
import Link from "@docusaurus/Link";
import { ArrowRight, Terminal } from "@gravity-ui/icons";
import styles from "./landing.module.scss";

const workflows = [
    {
        title: translate({ id: "landing.agent.browse", message: "Explore an app" }),
        commands: ["navigate http://localhost:3000", "snapshot", "click '[data-planet=Saturn]'"],
        output: 'await browser.$("[data-planet=Saturn]").click();',
        outputTitle: "Testplane Code",
    },
    {
        title: translate({ id: "landing.agent.triage", message: "Investigate a run" }),
        commands: ["test-results ./report --status failed --fields name,browser"],
        output: "Total tests: 4; total attempts: 4; matched tests: 1\n\n1. chrome\n   Orbital Atlas Visual checks matches the Saturn reference",
        outputTitle: "Test results in report: ./report",
    },
];

export function AgentConsole() {
    const [selected, setSelected] = useState(0);
    return (
        <section className={styles.agentSection}>
            <div className={styles.agentWrap}>
                <div className={styles.agentCopy}>
                    <h2>
                        <Translate id="landing.agent.title">A CLI for coding agents</Translate>
                    </h2>
                    <p>
                        <Translate id="landing.agent.copy">
                            Give your agent a real browser and a compact DOM snapshot. It can try a
                            selector, read the equivalent Testplane code, or investigate a failed
                            run straight from its HTML report.
                        </Translate>
                    </p>
                    <Link className={styles.guideLink} to="/docs/ai/toolkit/testplane-cli">
                        <Translate id="landing.agent.guide">Explore Testplane CLI</Translate>
                        <ArrowRight />
                    </Link>
                </div>
                <div className={styles.shell}>
                    <div className={styles.shellBar}>
                        <Terminal />
                        @testplane/cli
                    </div>
                    <div
                        className={styles.shellChoices}
                        role="group"
                        aria-label={translate({
                            id: "landing.agent.control",
                            message: "CLI workflow",
                        })}
                    >
                        {workflows.map(({ title }, i) => (
                            <button
                                type="button"
                                key={title}
                                aria-pressed={selected === i}
                                onClick={() => setSelected(i)}
                            >
                                {title}
                            </button>
                        ))}
                    </div>
                    <div className={styles.shellPanels}>
                        {workflows.map((flow, index) => (
                            <div
                                key={flow.title}
                                aria-hidden={selected !== index}
                                className={styles.shellBody}
                            >
                                {flow.commands.map((command, i) => (
                                    <div key={command} style={{ animationDelay: i * 0.07 + "s" }}>
                                        <b aria-hidden="true">$ </b>
                                        <code>npx @testplane/cli {command}</code>
                                    </div>
                                ))}
                                <div className={styles.shellOutput}>
                                    <span>{flow.outputTitle}</span>
                                    <pre>{flow.output}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
