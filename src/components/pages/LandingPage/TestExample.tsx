import React, { useState } from "react";
import Translate, { translate } from "@docusaurus/Translate";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import { ArrowRight, CircleCheck, FileCode } from "@gravity-ui/icons";
import styles from "./landing.module.scss";

const example = `it("opens Saturn’s field notes", async ({ browser }) => {
    await browser.url("/");
    await browser.$('[data-planet="Saturn"]').click();

    await expect(browser.$("h1")).toHaveText("Saturn");
    await browser.assertView("saturn-field-notes", "#catalogue");
});`;
const steps = [
    {
        title: translate({ id: "landing.spec.open", message: "Open the catalogue" }),
        lines: "{2}",
    },
    {
        title: translate({ id: "landing.spec.select", message: "Select Saturn" }),
        lines: "{3}",
    },
    {
        title: translate({ id: "landing.spec.check", message: "Check the view" }),
        lines: "{5-6}",
    },
];
export function TestExample() {
    const [step, setStep] = useState(0);
    const item = steps[step];
    const imageRoot = useBaseUrl("/img/landing/studio/");
    return (
        <section className={styles.specSection}>
            <div className={styles.specHeader}>
                <div>
                    <h2>
                        <Translate id="landing.spec.title">A browser test, line by line</Translate>
                    </h2>
                    <p>
                        <Translate id="landing.spec.intro">
                            Step through the catalogue test from the report. Each command runs
                            against the page your users see.
                        </Translate>
                    </p>
                </div>
                <Link className={styles.guideLink} to="/docs/quickstart/writing-tests">
                    <Translate id="landing.spec.guide">Write a test</Translate>
                    <ArrowRight />
                </Link>
            </div>
            <div className={styles.specBoard}>
                <div className={styles.specEditor}>
                    <div className={styles.fileBar}>
                        <FileCode />
                        catalogue.testplane.ts
                    </div>
                    <CodeBlock language="typescript" metastring={item.lines}>
                        {example}
                    </CodeBlock>
                    <div
                        className={styles.specControls}
                        role="group"
                        aria-label={translate({ id: "landing.spec.control", message: "Test step" })}
                    >
                        {steps.map(({ title }, i) => (
                            <button
                                type="button"
                                key={title}
                                aria-pressed={step === i}
                                onClick={() => setStep(i)}
                            >
                                <span>{i + 1}</span>
                                {title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.specApp}>
                    <img
                        src={imageRoot + "atlas-jupiter.webp"}
                        alt={
                            step === 0
                                ? translate({
                                      id: "landing.spec.jupiter",
                                      message: "Orbital Atlas showing Jupiter",
                                  })
                                : ""
                        }
                        width="800"
                        height="500"
                        loading="lazy"
                    />
                    <img
                        className={styles.saturnImage}
                        data-visible={step !== 0}
                        src={imageRoot + "atlas-saturn.webp"}
                        alt={
                            step !== 0
                                ? translate({
                                      id: "landing.spec.saturn",
                                      message: "Orbital Atlas showing Saturn",
                                  })
                                : ""
                        }
                        width="800"
                        height="500"
                        loading="lazy"
                    />
                    {step === 2 && (
                        <span className={styles.asserted}>
                            <CircleCheck />
                            saturn-field-notes
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}
