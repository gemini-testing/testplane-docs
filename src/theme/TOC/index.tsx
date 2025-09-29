import React from "react";
import TOC from "@theme-original/TOC";
import type TOCType from "@theme/TOC";
import type { WrapperProps } from "@docusaurus/types";
import { BarsDescendingAlignLeft } from "@gravity-ui/icons";

type Props = WrapperProps<typeof TOCType>;

export default function TOCWrapper(props: Props): JSX.Element {
    return (
        <div className="sticky top-[5rem]">
            <div className="flex items-baseline dark:text-neutral-400">
                <BarsDescendingAlignLeft className="h-[13px]" />
                <span className="ml-2 font-medium">On this page</span>
            </div>
            <TOC {...props} />
        </div>
    );
}
