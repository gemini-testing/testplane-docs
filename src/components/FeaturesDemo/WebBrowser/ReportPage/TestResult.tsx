import { AttemptPicker } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/AttemptPicker";
import { CollapsibleInfo } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/CollapsibleInfo";
import { TestHistory } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/TestHistory";
import { AssertViewResult } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/AssertViewResult";
import React from "react";
import {
    TestAttemptWithState,
    TestResultWithState,
    TestSectionWithState,
} from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/types";
import {
    CollapsibleTest,
    EntryType,
} from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/CollapsibleTest";

interface TestResultProps {
    data: TestResultWithState | TestSectionWithState;
}

const isTestSection = (
    data: TestResultWithState | TestSectionWithState,
): data is TestSectionWithState => !!(data as { children?: unknown[] }).children;

export function TestResult({ data }: TestResultProps) {
    if (isTestSection(data)) {
        return (
            <CollapsibleTest data={data} entryType={EntryType.TestSection}>
                {data.children.map((item, index) => (
                    <TestResult data={item} key={index} />
                ))}
            </CollapsibleTest>
        );
    }

    const attempt = data.attempts[data.selectedAttempt] as TestAttemptWithState | undefined;

    return (
        <CollapsibleTest data={data} entryType={EntryType.TestResult}>
            <div className="pb-2 pl-4">
                {data.attempts.length > 1 && (
                    <div className="flex items-center">
                        <div className="mr-3 font-medium">Attempts</div>
                        <AttemptPicker
                            attempts={data.attempts}
                            selectedAttempt={data.selectedAttempt}
                        />
                    </div>
                )}
                <CollapsibleInfo title="Meta" isCollapsed={attempt?.meta.isCollapsed ?? true} />
                <CollapsibleInfo title="History" isCollapsed={attempt?.history.isCollapsed ?? true}>
                    <TestHistory steps={attempt?.history.steps ?? []} />
                </CollapsibleInfo>
                {attempt?.assertViewResults?.map((assertViewResult, index) => (
                    <AssertViewResult key={index} data={assertViewResult} />
                ))}
            </div>
        </CollapsibleTest>
    );
}
