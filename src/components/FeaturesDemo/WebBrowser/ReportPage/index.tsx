import React, { forwardRef, useImperativeHandle, useRef } from "react";
import SearchIcon from "@site/static/icons/search.svg";
import SettingsIcon from "@site/static/icons/settings.svg";
import { Select } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/Select";
import { Label } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/Label";
import {
    TestResultWithState,
    TestSectionWithState,
} from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/types";
import { ActionButton } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/ActionButton";
import { TestResult } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/TestResult";

export interface ReportPageProps {
    tests: (TestResultWithState | TestSectionWithState)[];
}

export const ReportPage = forwardRef(function ReportPageInternal(props: ReportPageProps, ref) {
    const testsWrapperRef = useRef(null);
    const runTestsButtonRef = useRef(null);

    useImperativeHandle(ref, () => ({
        get testsWrapper() {
            return testsWrapperRef;
        },
        get runTestsButton() {
            return runTestsButtonRef;
        },
    }));

    return (
        <div className="relative w-full min-w-0 bg-white">
            <div className="p-2.5 shadow-sm">
                <div className="mb-2.5 hidden overflow-x-scroll sm:flex">
                    <Select title="Show tests" value="All" />
                    <Select title="Browsers" value="All" className="ml-2" />
                    <Select title="Diff mode" value="3-up scaled to fit" className="ml-2" />
                    <Select title="Group by" value="select key" className="ml-2" />
                    <Label title={"Version"} value={"9.15.0"} className="ml-auto hidden sm:block" />
                </div>

                <div className="flex flex-nowrap">
                    <div className="flex flex-grow items-center rounded-sm border border-gray-200 fill-[rgba(0,0,0,.4)] px-1 py-0.5 text-xs text-[rgba(0,0,0,.4)]">
                        <SearchIcon className="mr-1 size-3" /> Search tests by name
                    </div>
                    <ActionButton className="ml-2 sm:hidden">
                        <SettingsIcon className="size-3" />
                    </ActionButton>
                    <button
                        className="ml-2 flex items-center rounded-sm border border-[#e7e7e7] bg-[#ffeba0] px-1 text-xs transition-all"
                        data-role-id="run-tests"
                        ref={runTestsButtonRef}
                    >
                        Run
                        <div className="ml-4 h-0 w-0 border-[3px] border-b-0 border-l-transparent border-r-transparent border-t-[rgba(0,0,0,.6)]" />
                    </button>
                </div>
            </div>

            <div className="py-2 pl-7 pr-2" ref={testsWrapperRef}>
                {props.tests.map((test, index) => (
                    <TestResult data={test} key={index} />
                ))}
            </div>
        </div>
    );
});
