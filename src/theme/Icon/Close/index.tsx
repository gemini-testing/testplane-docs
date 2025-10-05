import React from "react";
import type { Props } from "@theme/Icon/Close";
import { Xmark } from "@gravity-ui/icons";

export default function IconClose({
    width = 21,
    height = 21,
    className,
    ...restProps
}: Props): JSX.Element {
    return (
        <Xmark
            className={className}
            viewBox="0 0 15 15"
            width={width}
            height={height}
            {...restProps}
            color="currentColor"
        />
    );
}
