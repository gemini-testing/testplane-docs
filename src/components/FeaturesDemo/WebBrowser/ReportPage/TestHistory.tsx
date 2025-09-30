import React from "react";
import { TestHistoryStep } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/types";

interface TestHistoryProps {
    steps: TestHistoryStep[];
}

export function TestHistory(props: TestHistoryProps) {
    return (
        <div className="test-history rounded-sm bg-gradient-to-br from-gray-200 p-2 break-all">
            {props.steps.map((step, index) => (
                <div className="mt-1 flex items-center" key={index}>
                    <div className="font-mono text-xs">{step.title}</div>
                    <div className="ml-1 text-sm text-nowrap opacity-50">— {step.duration}ms</div>
                </div>
            ))}
        </div>
    );
}
