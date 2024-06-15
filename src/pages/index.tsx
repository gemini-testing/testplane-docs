import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { LandingPage } from "@site/src/components/pages/LandingPage";

export default function Home() {
    const { siteConfig } = useDocusaurusContext();

    return (
        <Layout
            title={siteConfig.title}
            description="Testplane is a modern end-to-end testing framework"
        >
            <LandingPage />
        </Layout>
    );
}
