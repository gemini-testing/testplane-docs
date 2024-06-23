import { AnimatedAppear } from "@site/src/components/AnimatedAppear";
import { Heading } from "@site/src/components/FeaturesDemo/AnimatedHeading";
import React, { useRef } from "react";
import Typed from "typed.js";
import useBaseUrl from "@docusaurus/core/lib/client/exports/useBaseUrl";
import Link from "@docusaurus/Link";
import { useLatestVersion } from "@docusaurus/plugin-content-docs/client";
import Translate from "@docusaurus/Translate";

export const InstallationPromptSection = () => {
    const consoleRef = useRef(null);
    const hasAlreadyTyped = useRef(false);
    const type = () => {
        if (consoleRef.current && !hasAlreadyTyped.current) {
            hasAlreadyTyped.current = true;
            // eslint-disable-next-line no-new
            new Typed(consoleRef.current, {
                typeSpeed: 50,
                cursorChar: "▊",
                strings: ["npm init testplane@latest"],
            });
        }
    };
    const docsPluginId = undefined; // using default plugin
    const latestVersion = useLatestVersion(docsPluginId);

    return (
        <section className="relative overflow-hidden bg-gray-50">
            <div className="hidden xl:block">
                <img
                    className={"absolute left-[16%] top-[20%] size-16 rotate-[15deg]"}
                    src={useBaseUrl("/img/landing/shard-multi.svg")}
                    alt={"Star"}
                />
                <img
                    className={"absolute left-[77%] top-[10%] size-28"}
                    src={useBaseUrl("/img/landing/star-4-sharp.svg")}
                    alt="Star"
                />
            </div>
            <AnimatedAppear onAppear={type}>
                <div className="container !max-w-screen-lg pb-16 pt-10">
                    <Heading>
                        <div className="mb-3 text-gray-700">
                            <Translate
                                id="landing.installation-prompt.heading"
                                values={{
                                    testplane: (
                                        <span className="mt-3 bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-transparent">
                                            testplane
                                        </span>
                                    ),
                                }}
                            >
                                {"Start using {testplane} in minutes"}
                            </Translate>
                        </div>
                    </Heading>
                    <div className="text-center text-lg font-medium text-gray-500">
                        <Translate
                            id="landing.installation-prompt.description"
                            values={{
                                docsLink: (
                                    <Link to={latestVersion.path}>
                                        <Translate id="landing.installation-prompt.description.docs-link">
                                            the docs
                                        </Translate>
                                    </Link>
                                ),
                            }}
                        >
                            {
                                "Visit {docsLink} and tinker with your first testplane test after running CLI command below."
                            }
                        </Translate>
                    </div>
                    <div className="mx-12 mt-5 rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-0.5 sm:mx-24">
                        <div className="min-h-12 rounded-md bg-gray-800 p-3 font-mono text-gray-200">
                            <span ref={consoleRef}></span>
                        </div>
                    </div>
                </div>
            </AnimatedAppear>
        </section>
    );
};
