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
            className={clsx(
                "label flex flex-nowrap text-xs text-nowrap text-gray-500",
                props.className,
            )}
        >
            <span className="px-1 py-0.5 font-semibold">{props.title}</span>
            <span className="px-1 py-0.5 font-medium">{props.value}</span>
        </div>
    );
}
