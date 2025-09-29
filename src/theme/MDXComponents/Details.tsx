import React, { type ComponentProps, type ReactElement } from "react";
import clsx from "clsx";
import { ChevronRight } from "@gravity-ui/icons";
import type { Props } from "@theme/MDXComponents/Details";

type SummaryElement = ReactElement<ComponentProps<"summary">>;

export default function MDXDetails({ children, className, ...rest }: Props): JSX.Element {
    const items = React.Children.toArray(children);
    const summary = items.find(
        (item): item is SummaryElement => React.isValidElement(item) && item.type === "summary",
    );
    const content = <>{items.filter(item => item !== summary)}</>;

    const summaryProps = summary?.props ?? {};
    const {
        children: summaryChildren,
        className: summaryClassName,
        ...summaryRestProps
    } = summaryProps;
    const summaryContent = summaryChildren ?? summary ?? "Details";

    return (
        <details
            {...rest}
            className={clsx(
                "group overflow-hidden rounded-xl border border-neutral-200",
                className,
            )}
        >
            <summary
                {...summaryRestProps}
                className={clsx(
                    "flex cursor-pointer select-none items-start p-4 font-medium transition-colors duration-200 hover:bg-neutral-50 group-open:bg-neutral-50",
                    summaryClassName,
                )}
            >
                <span className="flex-1 text-base leading-relaxed [&>p]:mb-0">
                    {summaryContent}
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors duration-300 group-hover:bg-neutral-200">
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-open:rotate-90" />
                </span>
            </summary>

            <div className="border-t border-neutral-200 p-4">{content}</div>
        </details>
    );
}
