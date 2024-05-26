import clsx from "clsx";
import React from "react";
import { Status } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/types";

interface AttemptPickerProps {
    attempts: {
        status: Status;
    }[];
    selectedAttempt: number;
}

export function AttemptPicker(props: AttemptPickerProps) {
    return (
        <div className="attempt-picker flex">
            {props.attempts.map((attempt, index) => (
                <div
                    key={index}
                    className={clsx(
                        "mr-1 flex size-5 items-center justify-center rounded-sm border border-gray-300 text-sm text-gray-700",
                        {
                            "bg-green-300": attempt.status === Status.Success,
                            "bg-black": attempt.status === Status.NotLaunched,
                            "bg-red-600": attempt.status === Status.Failure,
                            "bg-pink-300": attempt.status === Status.Diff,
                            "outline outline-gray-400": index === props.selectedAttempt,
                        },
                    )}
                >
                    {index + 1}
                </div>
            ))}
        </div>
    );
}
