import { AnimatedAppear } from "@site/src/components/AnimatedAppear";
import { Heading } from "@site/src/components/FeaturesDemo/AnimatedHeading";
import { FeatureBlock, FeatureBlockLayout } from "@site/src/components/FeatureBlock";
import { GradientUnderline } from "@site/src/components/GradientUnderline";
import useBaseUrl from "@docusaurus/core/lib/client/exports/useBaseUrl";
import React from "react";

export const CoreFeaturesSection = () => {
    return (
        <section className="bg-gray-100">
            <div className="container max-w-screen-lg py-6">
                <AnimatedAppear>
                    <Heading>
                        <div className="mb-3 text-gray-700">
                            Accelerate{" "}
                            <span className="bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-transparent">
                                everything
                            </span>{" "}
                            with testplane
                        </div>
                    </Heading>
                </AnimatedAppear>
                <AnimatedAppear>
                    <FeatureBlock
                        heading={
                            <span>
                                Run your tests in any{" "}
                                <GradientUnderline className=" rotate-[2deg]">
                                    browser
                                </GradientUnderline>
                            </span>
                        }
                        description="Test in environment your users have, not just in the latest Chrome builds."
                        items={[
                            "All modern browsers",
                            "Real Android/iOS devices",
                            "Smart TVs or IoT devices via Appium",
                            "All modern protocols",
                            "Independent of browser versions",
                            "Ancient browsers, like Internet Explorer",
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
                                Run your tests reliably at any{" "}
                                <GradientUnderline className=" rotate-[-2deg]">
                                    scale
                                </GradientUnderline>
                            </span>
                        }
                        description="Regardless of how many tests you have, testplane is a perfect fit."
                        items={[
                            "Remote browser grid (e.g. BrowserStack)",
                            "Blazing-fast local execution",
                            "Sharding",
                            "Parallel execution",
                            "Test isolation",
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
                                Customise and{" "}
                                <GradientUnderline className="rotate-[3deg]">
                                    extend
                                </GradientUnderline>{" "}
                                the way you want
                            </span>
                        }
                        description="Thanks to testplane’s multiple extenstion points, you may adapt the framework even to the most exotic needs."
                        items={[
                            "Rich plugin system",
                            "Dozens of open source plugins",
                            "Custom reporters",
                            "Custom execution logic",
                            "Custom commands",
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
