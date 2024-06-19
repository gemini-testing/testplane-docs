import FeaturesStrokeLeft from "@site/static/img/landing/features-stroke-left.svg";
import FeaturesStrokeRight from "@site/static/img/landing/features-stroke-right.svg";
import Star5 from "@site/static/img/landing/star-5.svg";
import Star4Violet from "@site/static/img/landing/star-4-violet.svg";
import { AnimatedAppear } from "@site/src/components/AnimatedAppear";
import { Heading } from "@site/src/components/FeaturesDemo/AnimatedHeading";
import { FeatureCard, FeatureCardProps } from "@site/src/components/FeatureCard";
import React from "react";
import EyeIcon from "@site/static/icons/eye.svg";
import ToolsIcon from "@site/static/icons/tools.svg";
import SpeedIcon from "@site/static/icons/speed.svg";
import WarningIcon from "@site/static/icons/warning.svg";
import CommunityIcon from "@site/static/icons/community.svg";
import ChartIcon from "@site/static/icons/chart.svg";
import clsx from "clsx";
import Translate, { translate } from "@docusaurus/Translate";

export const AdditionalFeaturesSection = () => {
    const FEATURE_CARDS: FeatureCardProps[] = [
        {
            heading: translate({
                id: "landing.additional-features.visual.heading",
                message: "Vast visual testing capabilities",
            }),
            icon: <EyeIcon className="size-5" />,
            items: [
                translate({
                    id: "landing.additional-features.visual.assertions",
                    message: "Visual assertions",
                }),
                translate({
                    id: "landing.additional-features.visual.ui",
                    message: "UI for saving and updating screenshots",
                }),
                translate({
                    id: "landing.additional-features.visual.diff-modes",
                    message: "Multiple diff modes",
                }),
                translate({
                    id: "landing.additional-features.visual.any-area",
                    message: "Capture certain elements or the whole page",
                }),
            ],
        },
        {
            heading: translate({
                id: "landing.additional-features.tooling.heading",
                message: "Feature-rich tooling",
            }),
            icon: <ToolsIcon className="size-5" />,
            items: [
                translate({
                    id: "landing.additional-features.tooling.html-reporter",
                    message: "Powerful html-reporter",
                }),
                translate({
                    id: "landing.additional-features.tooling.gui",
                    message: "Responsive GUI mode",
                }),
                translate({
                    id: "landing.additional-features.tooling.profiler",
                    message: "Tests and plugin profiler",
                }),
            ],
        },
        {
            heading: translate({
                id: "landing.additional-features.repl.heading",
                message: "Live tests editing",
            }),
            icon: <SpeedIcon className="size-5" />,
            items: [
                translate({
                    id: "landing.additional-features.repl.feedback",
                    message: "Get immediate feedback as you type",
                }),
                translate({
                    id: "landing.additional-features.repl.step",
                    message: "Clearly see each step",
                }),
                translate({
                    id: "landing.additional-features.repl.any-env",
                    message: "Works both with local browser and remote grid",
                }),
            ],
        },
        {
            heading: translate({
                id: "landing.additional-features.flaky.heading",
                message: "Tackle flaky tests",
            }),
            icon: <WarningIcon className="size-5" />,
            items: [
                translate({
                    id: "landing.additional-features.flaky.auto-wait",
                    message: "Auto-wait",
                }),
                translate({
                    id: "landing.additional-features.flaky.isolation",
                    message: "Isolation via browser contexts",
                }),
                translate({
                    id: "landing.additional-features.flaky.retries",
                    message: "Smart retries",
                }),
                translate({
                    id: "landing.additional-features.flaky.animations",
                    message: "Automatic animations handling",
                }),
            ],
        },
        {
            heading: translate({
                id: "landing.additional-features.community.heading",
                message: "Growing community",
            }),
            icon: <CommunityIcon className="size-6" />,
            items: [
                translate({
                    id: "landing.additional-features.community.free",
                    message: "Open source and free to use for everyone",
                }),
                translate({
                    id: "landing.additional-features.community.issues",
                    message: "Hundreds of closed issues on GitHub",
                }),
                translate({
                    id: "landing.additional-features.community.docs",
                    message: "Extensive guides and docs",
                }),
                translate({
                    id: "landing.additional-features.community.maintainers",
                    message: "Active team of maintainers",
                }),
            ],
            className: "hidden sm:block",
        },
        {
            heading: translate({
                id: "landing.additional-features.scale.heading",
                message: "Designed to work at any scale",
            }),
            icon: <ChartIcon className="size-5" />,
            items: [
                translate({
                    id: "landing.additional-features.scale.battle-tested",
                    message: "Battle-tested on projects with tens of thousands of tests",
                }),
                translate({
                    id: "landing.additional-features.scale.ci-or-local",
                    message: "Created with both local development and CI systems in mind",
                }),
                translate({
                    id: "landing.additional-features.scale.independent",
                    message: "Independent of browser, platform, CI system",
                }),
            ],
            className: "hidden sm:block",
        },
    ];

    return (
        <section className="relative overflow-hidden bg-indigo-100">
            <div className="hidden 2xl:block">
                <FeaturesStrokeLeft className={"absolute left-0 origin-left scale-[0.7]"} />
                <FeaturesStrokeRight className={"absolute right-0 origin-right scale-[0.7]"} />
                <Star5 className={"absolute left-[6%] top-[70%] scale-x-[-0.7] scale-y-[0.7]"} />
                <Star4Violet className={"absolute left-[85%] top-[10%] size-24 rotate-[15deg]"} />
            </div>
            <div className="container !max-w-screen-lg pt-10">
                <AnimatedAppear>
                    <Heading>
                        <div className="mb-3 text-gray-700">
                            <Translate
                                id="landing.additional-features.heading"
                                values={{
                                    highlight: (
                                        <span className="mt-3 bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-transparent">
                                            <Translate id="landing.additional-features.heading.highlight">
                                                all-in-one
                                            </Translate>
                                        </span>
                                    ),
                                }}
                            >
                                {"Your {highlight} testing framework"}
                            </Translate>
                        </div>
                    </Heading>
                </AnimatedAppear>
                <div className="mt-10 flex flex-wrap justify-center">
                    {FEATURE_CARDS.map((props, index) => (
                        <AnimatedAppear
                            className={clsx(
                                "mb-10 basis-full sm:basis-1/2 lg:basis-1/3",
                                props.className,
                            )}
                            key={index}
                        >
                            <FeatureCard {...props} key={index} />
                        </AnimatedAppear>
                    ))}
                </div>
            </div>
        </section>
    );
};
