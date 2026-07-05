import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Translate from "@docusaurus/Translate";
import Link from "@docusaurus/Link";
import { useVersions, useLatestVersion } from "@docusaurus/plugin-content-docs/client";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

function DocumentationLabel() {
    return <Translate id="versionsPage.versionEntry.link">Documentation</Translate>;
}

function ReleaseNotesLabel() {
    return <Translate id="versionsPage.versionEntry.releaseNotes">Release Notes</Translate>;
}

export default function Versions() {
    const {
        siteConfig: { organizationName, projectName: projectDocsName },
    } = useDocusaurusContext();
    const projectName = projectDocsName?.slice(0, projectDocsName?.indexOf("-docs"));

    const docsPluginId = undefined; // Using default plugin
    const versions = useVersions(docsPluginId);
    const latestVersion = useLatestVersion(docsPluginId);
    const archivedVersions = versions.filter(version => version.name !== latestVersion.name);
    const repoUrl = `https://github.com/${organizationName!}/${projectName!}`;

    return (
        <Layout title={"Versions"}>
            <main className="margin-vert--lg container">
                <Heading as="h1">
                    <Translate id="versionsPage.title">Testplane versions</Translate>
                </Heading>

                <div className="margin-bottom--lg">
                    <Heading as="h3" id="next">
                        <Translate id="versionsPage.current.title">
                            Current version (Stable)
                        </Translate>
                    </Heading>
                    <p>
                        <Translate id="versionsPage.current.description">
                            Here you can find the documentation for current released version.
                        </Translate>
                    </p>
                    <table>
                        <tbody>
                            <tr>
                                <th>{latestVersion.label}</th>
                                <td>
                                    <Link to={latestVersion.path}>
                                        <DocumentationLabel />
                                    </Link>
                                </td>
                                <td>
                                    <Link to={`${repoUrl}/releases`}>
                                        <ReleaseNotesLabel />
                                    </Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {archivedVersions.length > 0 && (
                    <div className="margin-bottom--lg">
                        <Heading as="h3" id="past">
                            <Translate id="versionsPage.archived.title">Past versions</Translate>
                        </Heading>
                        <p>
                            <Translate id="versionsPage.archived.description">
                                Here you can find documentation for previous released versions.
                            </Translate>
                        </p>
                        <table>
                            <tbody>
                                {archivedVersions.map(version => (
                                    <tr key={version.name}>
                                        <th>{version.label}</th>
                                        <td>
                                            <Link to={version.path}>
                                                <DocumentationLabel />
                                            </Link>
                                        </td>
                                        <td>
                                            <Link to={`${repoUrl}/releases`}>
                                                <ReleaseNotesLabel />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </Layout>
    );
}
