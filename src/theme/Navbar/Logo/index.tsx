import React from "react";
import TestplaneLogo from "@site/static/img/logo.svg";
import TestplaneLogoDark from "@site/static/img/logo-dark.svg";
import Link from "@docusaurus/Link";

export default function NavbarLogo(): JSX.Element {
    return (
        <div className="flex">
            <TestplaneLogo className="h-8 w-8 dark:hidden" />
            <TestplaneLogoDark className="hidden h-8 w-8 dark:block" />
            <Link
                className="navbar__brand font-semibold hover:text-neutral-950 dark:hover:text-white"
                to={"/"}
            >
                testplane
            </Link>
        </div>
    );
}
