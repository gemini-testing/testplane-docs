import React, { ReactNode } from "react";

import { isMultiColumnFooterLinks } from "@docusaurus/theme-common";
import type { Props } from "@theme/Footer/Links";
import { FooterLinkItem } from "@site/src/theme/Footer/LinkItem";

export default function FooterLinks({ links }: Props): ReactNode {
    if (!isMultiColumnFooterLinks(links)) {
        console.warn("Simple links format is not supported yet!");
        return <div className="text-red-600">Simple links format is not supported yet!</div>;
    }

    return (
        <>
            {links.map((column, index) => (
                <div className="flex basis-1/2 flex-col p-1 lg:basis-1/4" key={index}>
                    <div className={"font-medium text-neutral-900 dark:text-neutral-200"}>
                        {column.title}
                    </div>
                    <>
                        {column.items.map((item, i) => (
                            <FooterLinkItem
                                className={
                                    "mt-3 text-neutral-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400"
                                }
                                item={item}
                                key={i}
                            />
                        ))}
                    </>
                </div>
            ))}
        </>
    );
}
