import Layout from "@theme/Layout";
import { LandingPage } from "@site/src/components/pages/LandingPage";

export default function Home() {
    return (
        <Layout
            title={"Fast, scalable and robust end-to-end web testing solution"}
            description="A battle-hardened framework for creating tests at any scale and any browser. Get no-code, component, end-to-end and visual tests out of the box."
        >
            <LandingPage />
        </Layout>
    );
}
