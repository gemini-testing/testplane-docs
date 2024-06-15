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

export const AnimatedDemoSection = () => {
    const grainyBg = `linear-gradient(41deg, rgb(227 119 252) 0%, rgb(142 78 253) 100%), url(${useBaseUrl("/img/landing/noise.png")})`;

    return (
        <section className={clsx(styles.demo, "relative")} style={{ backgroundImage: grainyBg }}>
            <div className="hidden 2xl:block">
                <DemoStrokeLeft className="absolute left-0 top-1/3 origin-left scale-90" />
                <Star5 className="absolute right-16 top-[65%] size-28" />
                <Star4Sharp className="absolute right-2 top-[60%] size-16 rotate-[-20deg]" />
            </div>
            <div className="container mx-auto py-6">
                <BrowserOnly>
                    {() => <FeaturesDemo className="h-[75vh] 2xl:h-[800px]" />}
                </BrowserOnly>
                <div className="flex justify-around pt-6">
                    <DemoStats value="5.6B" description="Tests launched" />
                    <DemoStats value="600+" description="Stars on GitHub" />
                    <DemoStats value="300+" description="Projects that trust us" />
                </div>
            </div>
        </section>
    );
};
