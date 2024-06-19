import React from "react";
import type { Props } from "@theme/Footer/Layout";
import styles from "./index.module.scss";
import ArrowLinkIcon from "@site/static/icons/arrow-link.svg";
import GithubIcon from "@site/static/icons/github.svg";
import StackoverflowIcon from "@site/static/icons/stackoverflow.svg";
import TelegramIcon from "@site/static/icons/telegram.svg";
import useBaseUrl from "@docusaurus/core/lib/client/exports/useBaseUrl";
import Translate from "@docusaurus/Translate";

export default function FooterLayout({ links, copyright }: Props): JSX.Element {
    const SOCIAL_LINKS = [
        {
            icon: GithubIcon,
            href: "https://github.com/gemini-testing/testplane",
        },
        {
            icon: StackoverflowIcon,
            href: "https://stackoverflow.com/questions/tagged/testplane",
        },
        {
            icon: TelegramIcon,
            href: "https://t.me/testplane",
        },
    ];
    const grainyBg = `radial-gradient(circle at center top, rgba(188, 93, 254, 1) 0%, rgba(136, 71, 254, 1) 100%), url(${useBaseUrl("/img/landing/noise.png")})`;

    return (
        <footer className={styles.footer} style={{ backgroundImage: grainyBg }}>
            <div className="container !max-w-screen-lg py-10">
                <div className="flex flex-wrap justify-between border-b-2 border-white/50 pb-10">
                    <div className="basis-full p-1">
                        <div className="flex items-center font-mono text-lg font-bold text-violet-50">
                            testplane
                        </div>
                        <div className={"mt-3 max-w-[75vw] text-lg font-medium text-white/60"}>
                            <Translate id="footer.slogan">
                                Fast, scalable and robust end-to-end testing framework for the
                                ever-evolving web landscape.
                            </Translate>
                        </div>
                        <a
                            className={
                                "mt-3 inline-flex items-baseline fill-white/60 text-lg font-medium text-white/60 transition-colors"
                            }
                            href="https://github.com/gemini-testing/testplane/discussions"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Translate id="footer.contact-us">Contact us</Translate>
                            <ArrowLinkIcon className={"ml-1 size-4"} />
                        </a>
                    </div>
                    {links}
                </div>
                <div className="mt-10 flex items-center justify-between">
                    <div className="font-mono text-lg font-bold text-white/60">{copyright}</div>
                    <div className="flex items-center">
                        {SOCIAL_LINKS.map(({ icon: Icon, href }, index) => (
                            <a
                                className="fill-white/60"
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                key={index}
                            >
                                <Icon className="ml-3 size-8" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
