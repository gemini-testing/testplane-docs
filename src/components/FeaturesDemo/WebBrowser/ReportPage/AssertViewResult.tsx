import clsx from "clsx";
import React from "react";

import { CollapsibleInfo } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/CollapsibleInfo";
import {
    AssertViewDiffWithState,
    AssertViewResultWithState,
    AssertViewSuccessWithState,
    Status,
} from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/types";
import { ActionButton } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/ActionButton";
import TickIcon from "@site/static/icons/tick.svg";
import SearchIcon from "@site/static/icons/search.svg";
import FullscreenIcon from "@site/static/icons/fullscreen.svg";
import CompareIcon from "@site/static/icons/compare.svg";
import UndoIcon from "@site/static/icons/undo.svg";
import "./styles.module.scss";

interface AssertViewSuccessProps {
    data: AssertViewSuccessWithState;
}

function AssertViewSuccess({ data }: AssertViewSuccessProps) {
    return (
        <CollapsibleInfo
            title={data.stateName}
            isCollapsed={data.isCollapsed}
            titleClassName="text-green-600"
        >
            <div className="my-1 flex flex-wrap">
                <ActionButton className="my-1 mr-1">
                    <UndoIcon className="mr-1 size-3" />
                    Undo
                </ActionButton>
            </div>
            <div className="mt-2 flex flex-col sm:flex-row 2xl:w-1/2">
                <div className="mr-2 basis-1/3">
                    <div className="text-sm font-medium text-gray-500">Actual</div>
                    <img src={data.actualSrc} alt="actual" data-role-id="actual-image" />
                </div>
            </div>
        </CollapsibleInfo>
    );
}

interface AssertViewDiffProps {
    data: AssertViewDiffWithState;
}

function AssertViewDiff({ data }: AssertViewDiffProps) {
    return (
        <CollapsibleInfo
            title={data.stateName}
            isCollapsed={data.isCollapsed}
            titleClassName="text-red-600"
        >
            <div className="my-1 flex flex-wrap">
                <ActionButton dataRoleId="accept-button" className="mr-1">
                    <TickIcon className="mr-1 size-3" />
                    Accept
                </ActionButton>
                <ActionButton className="mr-1">
                    <SearchIcon className="size-3 sm:mr-1" />
                    <span className="hidden sm:inline">Find same diffs</span>
                </ActionButton>
                <ActionButton className="mr-1">
                    <FullscreenIcon className="size-3 sm:mr-1" />
                    <span className="hidden sm:inline">Fast accept mode</span>
                </ActionButton>
                <ActionButton className="mr-1 sm:hidden">
                    <CompareIcon className="size-3" />
                </ActionButton>
            </div>
            <div className="hidden overflow-x-scroll border-b border-gray-200 py-1 text-center text-sm text-nowrap text-gray-500 sm:block">
                3-up | <span className="font-medium">3-up scaled</span> | 3-up scaled to fit | Only
                diff | Switch | Swipe | Onion skin
            </div>
            <div className="mt-2 flex flex-col sm:flex-row 2xl:w-1/2">
                <div className="mr-2 basis-1/3">
                    <div className="text-sm font-medium text-gray-500">Expected</div>
                    <img src={data.expectedSrc} alt="expected" data-role-id="expected-image" />
                </div>
                <div className="mr-2 basis-1/3">
                    <div className="text-sm font-medium text-gray-500">Actual</div>
                    <img src={data.actualSrc} alt="actual" data-role-id="actual-image" />
                </div>
                <div className="mr-2 basis-1/3">
                    <div className="text-sm font-medium text-gray-500">Diff</div>
                    <div className="relative" data-role-id="diff-image">
                        <div className="h-full w-full">
                            {data.diffBubbles?.map((bubble, index) => (
                                <div
                                    key={index}
                                    className={clsx("diff-bubble absolute size-px opacity-0")}
                                    style={{
                                        top: bubble.y,
                                        left: bubble.x,
                                    }}
                                >
                                    <div className="absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600"></div>
                                </div>
                            ))}
                        </div>
                        <img src={data.diffSrc} alt="diff" />
                    </div>
                </div>
            </div>
        </CollapsibleInfo>
    );
}

interface AssertViewResultProps {
    data: AssertViewResultWithState;
}

export function AssertViewResult({ data }: AssertViewResultProps) {
    if (data.status === Status.Success) {
        return <AssertViewSuccess data={data} />;
    } else if (data.status === Status.Diff) {
        return <AssertViewDiff data={data} />;
    }
}
