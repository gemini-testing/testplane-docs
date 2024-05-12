import clsx from "clsx";
import React from "react";

import { CollapsibleInfo } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/CollapsibleInfo";
import {
    AssertViewResultWithState,
    Status,
} from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/types";
import { ActionButton } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/ActionButton";
import TickIcon from "@site/static/icons/tick.svg";
import SearchIcon from "@site/static/icons/search.svg";
import FullscreenIcon from "@site/static/icons/fullscreen.svg";
import CompareIcon from "@site/static/icons/compare.svg";
import UndoIcon from "@site/static/icons/undo.svg";
import "./styles.module.scss";

interface AssertViewResultProps {
    data: AssertViewResultWithState;
}

export function AssertViewResult({ data }: AssertViewResultProps) {
    // TODO: animated diff bubbles

    return (
        <CollapsibleInfo
            title={data.stateName}
            isCollapsed={data.isCollapsed}
            titleClassName={clsx({
                "text-green-600": data.status === Status.Success,
                // "text-black": data.status === Status.NotLaunched,
                "text-red-600": data.status === Status.Diff,
            })}
        >
            <div className="my-1 flex flex-wrap">
                {data.status === Status.Diff && (
                    <>
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
                    </>
                )}
                {data.status === Status.Success && (
                    <ActionButton className="my-1 mr-1">
                        <UndoIcon className="mr-1 size-3" />
                        Undo
                    </ActionButton>
                )}
            </div>
            {data.status === Status.Diff && (
                <div className="hidden overflow-x-scroll text-nowrap border-b border-gray-200 py-1 text-center text-sm text-gray-500 sm:block">
                    3-up | <span className="font-medium">3-up scaled</span> | 3-up scaled to fit |
                    Only diff | Switch | Swipe | Onion skin
                </div>
            )}
            <div className="mt-2 flex flex-col sm:flex-row 2xl:w-1/2">
                {data.expectedSrc && (
                    <div className="mr-2 basis-1/3">
                        <div className="text-sm font-medium text-gray-500">Expected</div>
                        <img src={data.expectedSrc} alt="expected" data-role-id="expected-image" />
                    </div>
                )}
                <div className="mr-2 basis-1/3">
                    <div className="text-sm font-medium text-gray-500">Actual</div>
                    <img src={data.actualSrc} alt="actual" data-role-id="actual-image" />
                </div>
                {data.status === Status.Diff && (
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
                                            left: bubble.x /* "--scale": bubble.scale*/,
                                        }}
                                    >
                                        <div className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600"></div>
                                    </div>
                                ))}
                            </div>
                            <img src={data.diffSrc} alt="diff" />
                        </div>
                    </div>
                )}
            </div>
        </CollapsibleInfo>
    );
}
