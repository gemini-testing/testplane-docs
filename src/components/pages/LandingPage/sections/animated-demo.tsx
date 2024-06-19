import clsx from "clsx";
import styles from "@site/src/pages/index.module.scss";
import DemoStrokeLeft from "@site/static/img/landing/demo-stroke-left.svg";
import Star5 from "@site/static/img/landing/star-5.svg";
import Star4Sharp from "@site/static/img/landing/star-4-sharp.svg";
import { FeaturesDemo } from "@site/src/components/FeaturesDemo";
import { DemoStats } from "@site/src/components/DemoStats";
import React from "react";
import useBaseUrl from "@docusaurus/core/lib/client/exports/useBaseUrl";
import BrowserOnly from "@docusaurus/core/lib/client/exports/BrowserOnly";
import { HeadingId } from "@site/src/components/FeaturesDemo/constants";
import { translate } from "@docusaurus/Translate";

export const AnimatedDemoSection = () => {
    const grainyBg = `linear-gradient(41deg, rgb(227 119 252) 0%, rgb(142 78 253) 100%), url(${useBaseUrl("/img/landing/noise.png")})`;
    const headings = [
        {
            id: HeadingId.FamiliarApi,
            data: translate({
                id: "landing.animated-demo.heading.familiar-api",
                message: "Familiar and concise API, that works everywhere",
            }),
        },
        {
            id: HeadingId.ReplMode,
            data: translate({
                id: "landing.animated-demo.heading.instant-feedback",
                message: "Get instant feedback as you write tests",
            }),
        },
        {
            id: HeadingId.HtmlReport,
            data: translate({
                id: "landing.animated-demo.heading.html-report",
                message: "View data results in feature-rich report",
            }),
        },
        {
            id: HeadingId.GuiMode,
            data: translate({
                id: "landing.animated-demo.heading.gui",
                message: "Powerful, yet easy to use GUI mode",
            }),
        },
        {
            id: HeadingId.VisualTesting,
            data: translate({
                id: "landing.animated-demo.heading.visual-testing",
                message: "Vast visual testing capabilities",
            }),
        },
    ];

    return (
        <section className={clsx(styles.demo, "relative")} style={{ backgroundImage: grainyBg }}>
            <div className="hidden 2xl:block">
                <DemoStrokeLeft className="absolute left-0 top-1/3 origin-left scale-90" />
                <Star5 className="absolute right-16 top-[65%] size-28" />
                <Star4Sharp className="absolute right-2 top-[60%] size-16 rotate-[-20deg]" />
            </div>
            <div className="container mx-auto py-6">
                <BrowserOnly>
                    {() => <FeaturesDemo className="h-[75vh] 2xl:h-[800px]" headings={headings} />}
                </BrowserOnly>
                <div className="flex justify-around pt-6">
                    <DemoStats
                        value="5.6B"
                        description={translate({
                            id: "landing.animated-demo.stats.tests",
                            message: "Tests launched",
                        })}
                    />
                    <DemoStats
                        value="600+"
                        description={translate({
                            id: "landing.animated-demo.stats.stars",
                            message: "Stars on GitHub",
                        })}
                    />
                    <DemoStats
                        value="300+"
                        description={translate({
                            id: "landing.animated-demo.stats.projects",
                            message: "Projects that trust us",
                        })}
                    />
                </div>
            </div>
        </section>
    );
};
