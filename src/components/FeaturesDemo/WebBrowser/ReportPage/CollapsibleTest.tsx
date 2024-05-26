import React, { ReactNode } from "react";
import CopyIcon from "@site/static/icons/copy.svg";
import RetryIcon from "@site/static/icons/retry.svg";
import ViewIcon from "@site/static/icons/view.svg";
import ShareIcon from "@site/static/icons/share.svg";
import SpinnerIcon from "@site/static/icons/spinner.svg";
import AngleIcon from "@site/static/icons/angle.svg";
import clsx from "clsx";
import {
    Status,
    TestResultWithState,
    TestState,
} from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/types";
import { Collapsible } from "@site/src/components/Collapsible";

export enum EntryType {
    TestSection,
    TestResult,
}

export interface CollapsibleTestProps {
    data: Pick<TestResultWithState, "status" | "title" | "state" | "isCollapsed" | "isDisabled">;
    entryType: EntryType;
    children?: ReactNode;
}

export function CollapsibleTest({ data, entryType, children }: CollapsibleTestProps) {
    const icons =
        entryType === EntryType.TestSection ? [CopyIcon, RetryIcon] : [ViewIcon, ShareIcon];

    return (
        <Collapsible
            title={
                <div
                    className={clsx("flex items-center", {
                        "text-green-600": data.status === Status.Success,
                        "text-red-600":
                            data.status === Status.Diff || data.status === Status.Failure,
                    })}
                >
                    {data.state !== TestState.Loading && (
                        <input
                            type="checkbox"
                            className="absolute left-2"
                            checked={data.state === TestState.Checked}
                            ref={el =>
                                el && (el.indeterminate = data.state === TestState.Indeterminate)
                            }
                            onChange={() => {
                                /* empty handler just to prevent the input from becoming read-only */
                            }}
                            disabled={data.isDisabled}
                        />
                    )}
                    {data.state === TestState.Loading && (
                        <div className="absolute left-2">
                            <SpinnerIcon className="size-3 animate-spin overflow-visible stroke-gray-400 stroke-[15px]" />
                        </div>
                    )}
                    <AngleIcon
                        className={clsx("ml-1 size-3", { "rotate-90": !data.isCollapsed })}
                    />
                    <div className={clsx("ml-2 font-medium")}>{data.title}</div>
                    {icons.map((Icon, index) => (
                        <Icon key={index} className="ml-1 size-3 flex-shrink-0 fill-gray-500" />
                    ))}
                </div>
            }
        >
            {!data.isCollapsed && <div className="pl-2">{children}</div>}
        </Collapsible>
    );
}
