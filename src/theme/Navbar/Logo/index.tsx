import React from "react";
import TestplaneLogo from "@site/static/img/logo.svg";
import TestplaneLogoDark from "@site/static/img/logo-dark.svg";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import styles from "./index.module.css";

export default function NavbarLogo(): JSX.Element {
    return (
        <div
            className={clsx(
                styles["logo-container"],
                "logo-container flex bg-white/70 shadow-white/90 dark:bg-neutral-950/70 dark:shadow-neutral-950/90",
            )}
        >
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
