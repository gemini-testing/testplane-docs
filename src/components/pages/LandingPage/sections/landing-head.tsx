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

export const LandingHeadSection = () => {
    return (
        <section className="overflow-hidden bg-gray-100">
            <MobileBg className="absolute top-0 w-full sm:hidden" />
            <div className="container relative mx-auto">
                <Star4Pink className={"absolute left-[35%] top-[20%] hidden size-28 sm:block"} />
                <Star4Violet
                    className={
                        "absolute left-[25%] top-[70%] hidden size-24 rotate-[30deg] sm:block"
                    }
                />
                <Cone className={"absolute left-[68%] top-[50%] size-24 scale-75 sm:hidden"} />
                <div className="mt-16 flex items-center py-8 sm:mt-0 2xl:py-16">
                    <div className="flex flex-grow basis-full flex-col items-start">
                        <LinkBadge />
                        <h1 className="z-50 mt-3 inline-block bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-5xl font-bold text-transparent 2xl:text-7xl">
                            testplane
                        </h1>
                        <h1
                            className={clsx(
                                styles["text-glow"],
                                "z-50 text-5xl font-bold leading-[1.1] text-gray-700 md:leading-none 2xl:text-7xl",
                            )}
                        >
                            is an{" "}
                            <span className="relative inline-block">
                                <HighlightRoundSvg className="absolute left-0 top-0 -translate-y-0.5 scale-[1.15]" />
                                ultimate
                            </span>{" "}
                            solution for end-to-end testing workflows
                        </h1>
                        <div
                            className={clsx(
                                styles["text-glow"],
                                "z-50 mt-5 text-lg text-gray-500 xl:text-xl",
                            )}
                        >
                            Testplane is a battle-hardened framework for creating tests at{" "}
                            <b>any scale</b>, <b>any browser</b> and <b>any platform</b>.
                        </div>
                        <button className="mt-5 flex rounded-xl bg-[#6C47FF] px-6 py-3 font-bold text-white transition-colors hover:bg-[#7b59ff] active:bg-[#5e34ff]">
                            Get started
                            <ArrowHandDrawn className="ml-1 size-6" />
                        </button>
                    </div>
                    <div className="-ml-6 hidden flex-grow basis-full overflow-hidden sm:block">
                        <AnimatedPlanet />
                    </div>
                </div>
            </div>
        </section>
    );
};
