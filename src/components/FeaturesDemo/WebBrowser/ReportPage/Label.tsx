import clsx from "clsx";
import React from "react";

interface LabelProps {
    title: string;
    value: string;
    className?: string;
}

export function Label(props: LabelProps) {
    return (
        <div
            className={clsx("flex flex-nowrap text-nowrap text-xs text-gray-500", props.className)}
        >
            <div className="inline px-1 py-0.5 font-semibold">{props.title}</div>
            <div className="inline px-1 py-0.5 font-medium">{props.value}</div>
        </div>
    );
}
