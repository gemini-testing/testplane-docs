import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import type { Props } from "@theme/PaginatorNavLink";

export default function PaginatorNavLink(props: Props): JSX.Element {
    const { permalink, title, isNext } = props;
    return (
        <Link className={"mb-4"} style={isNext ? { gridColumn: "2 / 3" } : {}} to={permalink}>
            <div className={clsx("flex items-center font-medium", { "justify-end": isNext })}>
                {isNext ? null : <ChevronLeft className="mr-2" />}
                <span>{title}</span>
                {isNext ? <ChevronRight className="ml-2" /> : null}
            </div>
        </Link>
    );
}
