import React from "react";
import { InstallationPromptSection } from "@site/src/components/pages/LandingPage/sections/installation-prompt";
import { AdditionalFeaturesSection } from "@site/src/components/pages/LandingPage/sections/additional-features";
import { CoreFeaturesSection } from "@site/src/components/pages/LandingPage/sections/core-features";
import { AnimatedDemoSection } from "@site/src/components/pages/LandingPage/sections/animated-demo";
import { LandingHeadSection } from "@site/src/components/pages/LandingPage/sections/landing-head";

export const LandingPage = () => {
    React.useEffect(() => {
        if (typeof document === "undefined") {
            return undefined;
        }

        const root = document.documentElement;
        const previousOverride = root.getAttribute("data-theme-override");
        const hadDarkClass = root.classList.contains("dark");

        root.setAttribute("data-theme-override", "light");
        root.classList.remove("dark");

        return () => {
            root.classList.toggle("dark", hadDarkClass);
            if (previousOverride) {
                root.setAttribute("data-theme-override", previousOverride);
            } else {
                root.removeAttribute("data-theme-override");
            }
        };
    }, []);

    return (
        <>
            <LandingHeadSection />
            <AnimatedDemoSection />
            <CoreFeaturesSection />
            <AdditionalFeaturesSection />
            <InstallationPromptSection />
        </>
    );
};
