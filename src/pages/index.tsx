import Layout from "@theme/Layout";
import { translate } from "@docusaurus/Translate";
import { LandingPage } from "@site/src/components/pages/LandingPage";

export default function Home() {
    return (
        <Layout
            title={translate({
                id: "landing.meta.title",
                message: "End-to-end testing in real browsers",
            })}
            description={translate({
                id: "landing.hero.intro",
                message:
                    "Testplane is an open-source framework for end-to-end, component, and visual testing in real browsers.",
            })}
        >
            <LandingPage />
        </Layout>
    );
}
