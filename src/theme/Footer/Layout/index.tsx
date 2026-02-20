import React, { useRef } from "react";
import type { Props } from "@theme/Footer/Layout";
import GithubIcon from "@site/static/icons/github.svg";
import SourceCraftIcon from "@site/static/icons/sourcecraft-light-theme.svg";
import TestplaneLogo from "@site/static/img/logo.svg";
import TestplaneLogoDark from "@site/static/img/logo-dark.svg";
import { LogoStackOverflow, LogoTelegram } from "@gravity-ui/icons";

export default function FooterLayout({ links, copyright }: Props): JSX.Element {
    const footerRef = useRef<HTMLElement | null>(null);

    const SOCIAL_LINKS = [
        {
            icon: <GithubIcon className="h-full w-full" />,
            href: "https://github.com/gemini-testing/testplane",
        },
        {
            icon: <SourceCraftIcon className="h-full w-full scale-150" />,
            href: "https://sourcecraft.dev/testplane/testplane",
        },
        {
            icon: <LogoStackOverflow className="h-full w-full" />,
            href: "https://stackoverflow.com/questions/tagged/testplane",
        },
        {
            icon: <LogoTelegram className="h-full w-full" />,
            href: "https://t.me/testplane",
        },
    ];

    return (
        <footer ref={footerRef} className="flex justify-center">
            <div className="w-full !max-w-[var(--max-width)] border-t border-neutral-100 px-8 pt-10 pb-4 dark:border-neutral-500/10">
                <div className="align-start flex justify-between pb-10">
                    <TestplaneLogo className="h-10 w-10 dark:hidden" />
                    <TestplaneLogoDark className="hidden h-10 w-10 dark:block" />
                    <div className="flex basis-2/3 flex-wrap">{links}</div>
                </div>
                <div className="mt-4 flex items-center">
                    <div className="">{copyright}</div>
                    <div className="ml-1 flex items-center">
                        {SOCIAL_LINKS.map(({ icon, href }, index) => (
                            <a
                                className="flex h-8 w-8 items-center rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-200/10 dark:hover:text-neutral-200"
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                key={index}
                            >
                                {icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
