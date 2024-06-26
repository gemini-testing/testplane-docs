import React from "react";
import { InstallationPromptSection } from "@site/src/components/pages/LandingPage/sections/installation-prompt";
import { AdditionalFeaturesSection } from "@site/src/components/pages/LandingPage/sections/additional-features";
import { CoreFeaturesSection } from "@site/src/components/pages/LandingPage/sections/core-features";
import { AnimatedDemoSection } from "@site/src/components/pages/LandingPage/sections/animated-demo";
import { LandingHeadSection } from "@site/src/components/pages/LandingPage/sections/landing-head";

export const LandingPage = () => {
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
