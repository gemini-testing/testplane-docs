import React from "react";
import type { Props } from "@theme/Icon/ExternalLink";
import { ArrowUpRightFromSquare } from "@gravity-ui/icons";

export default function IconExternalLink({ width = 16, height = 16 }: Props): JSX.Element {
    return (
        <ArrowUpRightFromSquare width={width} height={height} aria-hidden="true" className="ml-1" />
    );
}
