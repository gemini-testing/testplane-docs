import clsx from "clsx";
import React from "react";

interface SelectProps {
    title: string;
    value: string;
    className?: string;
}

export function Select(props: SelectProps) {
    return (
        <div
            className={clsx(
                "select flex text-nowrap rounded-sm border border-gray-200 bg-gray-200 text-xs",
                props.className,
            )}
        >
            <div className="px-1 py-0.5 font-semibold text-gray-500">{props.title}</div>
            <div className="flex items-center justify-between bg-white px-1 py-0.5">
                {props.value}
                <div className="ml-4 h-0 w-0 border-[3px] border-b-0 border-l-transparent border-r-transparent border-t-gray-500"></div>
            </div>
        </div>
    );
}
