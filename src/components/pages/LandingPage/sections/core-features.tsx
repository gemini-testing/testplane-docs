import { AnimatedAppear } from "@site/src/components/AnimatedAppear";
import { Heading } from "@site/src/components/FeaturesDemo/AnimatedHeading";
import { FeatureBlock, FeatureBlockLayout } from "@site/src/components/FeatureBlock";
import { GradientUnderline } from "@site/src/components/GradientUnderline";
import useBaseUrl from "@docusaurus/core/lib/client/exports/useBaseUrl";
import React from "react";
import Translate, { translate } from "@docusaurus/Translate";

export const CoreFeaturesSection = () => {
    return (
        <section className="bg-white">
            <div className="container !max-w-screen-lg py-6">
                <AnimatedAppear>
                    <Heading>
                        <div className="mb-3 text-neutral-700">
                            <Translate
                                id="landing.core-features.heading"
                                values={{
                                    highlight: (
                                        <span className="bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-transparent">
                                            <Translate id="landing.core-features.heading.highlight">
                                                everything
                                            </Translate>
                                        </span>
                                    ),
                                }}
                            >
                                {"Accelerate {highlight} with testplane"}
                            </Translate>
                        </div>
                    </Heading>
                </AnimatedAppear>
                <AnimatedAppear>
                    <FeatureBlock
                        heading={
                            <span>
                                <Translate
                                    id="landing.core-features.browsers.heading"
                                    values={{
                                        underline: (
                                            <GradientUnderline className="rotate-[2deg]">
                                                <Translate id="landing.core-features.browsers.heading.underline">
                                                    browser
                                                </Translate>
                                            </GradientUnderline>
                                        ),
                                    }}
                                >
                                    {"Run your tests in any {underline}"}
                                </Translate>
                            </span>
                        }
                        description={translate({
                            id: "landing.core-features.browsers.descr",
                            message:
                                "Test in environment your users have, not just in the latest Chrome builds.",
                        })}
                        items={[
                            translate({
                                id: "landing.core-features.browsers.modern",
                                message: "All modern browsers",
                            }),
                            translate({
                                id: "landing.core-features.browsers.devices",
                                message: "Real Android/iOS devices",
                            }),
                            translate({
                                id: "landing.core-features.browsers.appium",
                                message: "Smart TVs or IoT devices via Appium",
                            }),
                            translate({
                                id: "landing.core-features.browsers.protocols",
                                message: "All modern protocols",
                            }),
                            translate({
                                id: "landing.core-features.browsers.versions",
                                message: "Independent of browser versions",
                            }),
                            translate({
                                id: "landing.core-features.browsers.ancient",
                                message: "Ancient browsers, like Internet Explorer",
                            }),
                        ]}
                        layout={FeatureBlockLayout.PictureOnTheRight}
                        imgSrc={useBaseUrl("/img/landing/browsers.svg")}
                        className="py-8"
                    />
                </AnimatedAppear>
                <AnimatedAppear>
                    <FeatureBlock
                        heading={
                            <span>
                                <Translate
                                    id="landing.core-features.scale.heading"
                                    values={{
                                        underline: (
                                            <GradientUnderline className="rotate-[2deg]">
                                                <Translate id="landing.core-features.browsers.scale.underline">
                                                    scale
                                                </Translate>
                                            </GradientUnderline>
                                        ),
                                    }}
                                >
                                    {"Run your tests reliably at any {underline}"}
                                </Translate>
                            </span>
                        }
                        description={translate({
                            id: "landing.core-features.scale.descr",
                            message:
                                "Regardless of how many tests you have, testplane is a perfect fit.",
                        })}
                        items={[
                            translate({
                                id: "landing.core-features.scale.grid",
                                message: "Remote browser grid (e.g. BrowserStack)",
                            }),
                            translate({
                                id: "landing.core-features.scale.local",
                                message: "Blazing-fast local execution",
                            }),
                            translate({
                                id: "landing.core-features.scale.sharding",
                                message: "Sharding",
                            }),
                            translate({
                                id: "landing.core-features.scale.parallel",
                                message: "Parallel execution",
                            }),
                            translate({
                                id: "landing.core-features.scale.isolation",
                                message: "Test isolation",
                            }),
                        ]}
                        layout={FeatureBlockLayout.PictureOnTheLeft}
                        imgSrc={useBaseUrl("/img/landing/scale.svg")}
                        className="py-8"
                    />
                </AnimatedAppear>
                <AnimatedAppear>
                    <FeatureBlock
                        heading={
                            <span>
                                <Translate
                                    id="landing.core-features.extend.heading"
                                    values={{
                                        underline: (
                                            <GradientUnderline className="rotate-[2deg]">
                                                <Translate id="landing.core-features.browsers.extend.underline">
                                                    extend
                                                </Translate>
                                            </GradientUnderline>
                                        ),
                                    }}
                                >
                                    {"Customise and {underline} the way you want"}
                                </Translate>
                            </span>
                        }
                        description={translate({
                            id: "landing.core-features.extend.descr",
                            message:
                                "Thanks to testplane’s multiple extenstion points, you may adapt the framework even to the most exotic needs.",
                        })}
                        items={[
                            translate({
                                id: "landing.core-features.extend.plugin-system",
                                message: "Rich plugin system",
                            }),
                            translate({
                                id: "landing.core-features.extend.plugin-opensource",
                                message: "Dozens of open source plugins",
                            }),
                            translate({
                                id: "landing.core-features.extend.reporters",
                                message: "Custom reporters",
                            }),
                            translate({
                                id: "landing.core-features.extend.execution",
                                message: "Custom execution logic",
                            }),
                            translate({
                                id: "landing.core-features.extend.commands",
                                message: "Custom commands",
                            }),
                        ]}
                        layout={FeatureBlockLayout.PictureOnTheRight}
                        imgSrc={useBaseUrl("/img/landing/extensibility.svg")}
                        className="py-8"
                    />
                </AnimatedAppear>
            </div>
        </section>
    );
};
