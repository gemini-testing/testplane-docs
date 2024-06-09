import React from "react";

import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import isInternalUrl from "@docusaurus/isInternalUrl";
import IconExternalLink from "@theme/Icon/ExternalLink";
import type { Props } from "@theme/Footer/LinkItem";
import clsx from "clsx";

export function FooterLinkItem({ item, className }: Props & { className?: string }): JSX.Element {
    const { to, href, label, prependBaseUrlToHref, ...props } = item;
    const toUrl = useBaseUrl(to);
    const normalizedHref = useBaseUrl(href, { forcePrependBaseUrl: true });

    return (
        <Link
            className={clsx(className)}
            {...(href
                ? {
                      href: prependBaseUrlToHref ? normalizedHref : href,
                  }
                : {
                      to: toUrl,
                  })}
            {...props}
        >
            {label}
            {href && !isInternalUrl(href) && <IconExternalLink />}
        </Link>
    );
}
