import MobileBg from "@site/static/img/landing/mobile-bg.svg";
import Star4Pink from "@site/static/img/landing/star-4-pink.svg";
import Star4Violet from "@site/static/img/landing/star-4-violet.svg";
import Cone from "@site/static/img/landing/cone.svg";
import clsx from "clsx";
import styles from "@site/src/pages/index.module.scss";
import HighlightRoundSvg from "@site/static/img/landing/highlight-round.svg";
import ArrowHandDrawn from "@site/static/img/landing/arrow.svg";
import { AnimatedPlanet } from "@site/src/components/AnimatedPlanet";
import React from "react";
import { LinkBadge } from "@site/src/components/LinkBadge";
import Translate from "@docusaurus/Translate";
import Link from "@docusaurus/Link";
import { useLatestVersion } from "@docusaurus/plugin-content-docs/client";

export const LandingHeadSection = () => {
    const docsPluginId = undefined; // using default plugin
    const latestVersion = useLatestVersion(docsPluginId);

    return (
        <section className="overflow-hidden bg-white">
            <MobileBg className="absolute top-0 w-full sm:hidden" />
            <div className="relative container mx-auto">
                <Star4Pink className={"absolute top-[20%] left-[35%] hidden size-28 sm:block"} />
                <Star4Violet
                    className={
                        "absolute top-[70%] left-[25%] hidden size-24 rotate-[30deg] sm:block"
                    }
                />
                <Cone className={"absolute top-[50%] left-[68%] size-24 scale-75 sm:hidden"} />
                <div className="mt-16 flex items-center py-8 sm:mt-0 2xl:py-16">
                    <div className="flex flex-grow basis-full flex-col items-start">
                        <LinkBadge
                            link="https://github.com/gemini-testing/testplane/"
                            leftTitle={
                                <Translate id="landing.landing-head.badge.leftTitle">
                                    Testplane is open source!
                                </Translate>
                            }
                            rightTitle={
                                <Translate id="landing.landing-head.badge.rightTitle">
                                    Star on github
                                </Translate>
                            }
                        />
                        <h1
                            className={clsx(
                                styles["text-glow"],
                                "z-40 mt-2 text-5xl leading-[1.1] font-bold text-neutral-700 md:leading-none 2xl:text-7xl",
                            )}
                        >
                            <Translate
                                id="landing.landing-head.heading"
                                values={{
                                    testplane: (
                                        <span
                                            className={clsx(
                                                "bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-transparent",
                                                styles["no-text-glow"],
                                            )}
                                        >
                                            testplane
                                            <br />
                                        </span>
                                    ),
                                    highlight: (
                                        <span className="relative inline-block">
                                            <HighlightRoundSvg className="absolute top-0 left-0 -translate-y-0.5 scale-[1.15]" />
                                            <Translate id="landing.landing-head.heading.highlight">
                                                ultimate
                                            </Translate>
                                        </span>
                                    ),
                                }}
                            >
                                {
                                    "{testplane} is an {highlight} solution for end-to-end testing workflows"
                                }
                            </Translate>
                        </h1>
                        <div
                            className={clsx(
                                styles["text-glow"],
                                "z-40 mt-5 text-lg text-neutral-500 xl:text-xl",
                            )}
                        >
                            <Translate
                                id="landing.landing-head.description"
                                values={{
                                    anyScale: (
                                        <b>
                                            <Translate id="landing.landing-head.description.anyScale">
                                                any scale
                                            </Translate>
                                        </b>
                                    ),
                                    anyBrowser: (
                                        <b>
                                            <Translate id="landing.landing-head.description.anyBrowser">
                                                any browser
                                            </Translate>
                                        </b>
                                    ),
                                    anyPlatform: (
                                        <b>
                                            <Translate id="landing.landing-head.description.anyPlatform">
                                                any platform
                                            </Translate>
                                        </b>
                                    ),
                                }}
                            >
                                {
                                    "Testplane is a battle-hardened framework for creating tests at {anyScale}, {anyBrowser}, {anyPlatform}."
                                }
                            </Translate>
                        </div>
                        <Link to={latestVersion.path}>
                            <button className="mt-5 flex items-center rounded-xl border-0 bg-[#6C47FF] px-6 py-3 font-[Jost] text-lg font-bold text-white transition-colors hover:bg-[#7b59ff] active:bg-[#5e34ff]">
                                <Translate id="landing.getStartedButton">Get started</Translate>
                                <ArrowHandDrawn className="ml-1 size-6" />
                            </button>
                        </Link>
                    </div>
                    <div className="-ml-6 hidden flex-grow basis-full overflow-hidden sm:block">
                        <AnimatedPlanet />
                    </div>
                </div>
            </div>
        </section>
    );
};
