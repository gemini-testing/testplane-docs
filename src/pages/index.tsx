import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import styles from "./index.module.scss";

export default function Home() {
    const { siteConfig } = useDocusaurusContext();

    return (
        <Layout
            title={siteConfig.title}
            description="Testplane is a modern end-to-end testing framework"
        >
            <main className={styles.main}>Welcome to Testplane docs.</main>
        </Layout>
    );
}
