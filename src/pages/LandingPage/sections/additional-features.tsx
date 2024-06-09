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

export const AdditionalFeaturesSection = () => {
    const FEATURE_CARDS: FeatureCardProps[] = [
        {
            heading: "Vast visual testing capabilities",
            icon: <EyeIcon className="size-5" />,
            items: [
                "Visual assertions",
                "UI for saving and updating screenshots",
                "Multiple diff modes",
                "Capture certain elements or the whole page",
            ],
        },
        {
            heading: "Feature-rich tooling",
            icon: <ToolsIcon className="size-5" />,
            items: ["Powerful html-reporter", "Responsive GUI mode", "Tests and plugin profiler"],
        },
        {
            heading: "Live tests editing",
            icon: <SpeedIcon className="size-5" />,
            items: [
                "Get immediate feedback as you type",
                "Clearly see each step",
                "Works both with local browser and remote grid",
            ],
        },
        {
            heading: "Tackle flaky tests",
            icon: <WarningIcon className="size-5" />,
            items: [
                "Auto-wait",
                "Isolation via browser contexts",
                "Smart retries",
                "Automatic animations handling",
            ],
        },
        {
            heading: "Growing community",
            icon: <CommunityIcon className="size-6" />,
            items: [
                "Open source and free to use for everyone",
                "Hundreds of closed issues on GitHub",
                "Extensive guides and docs",
                "Active team of maintainers",
            ],
            className: "hidden sm:block",
        },
        {
            heading: "Designed to work at any scale",
            icon: <ChartIcon className="size-5" />,
            items: [
                "Battle-tested on projects with tens of thousands of tests",
                "Created with both local development and CI systems in mind",
                "Independent of browser, platform, CI system",
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
            <div className="container max-w-screen-lg pt-10">
                <AnimatedAppear>
                    <Heading>
                        <div className="mb-3 text-gray-700">
                            Your{" "}
                            <span className="mt-3 bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-transparent">
                                all-in-one
                            </span>{" "}
                            testing framework
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
                            <FeatureCard {...props} />
                        </AnimatedAppear>
                    ))}
                </div>
            </div>
        </section>
    );
};
