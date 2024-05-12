import React, { ReactElement } from "react";
import clsx from "clsx";

interface ActionButtonProps {
    className?: string;
    children?: string | ReactElement | (string | ReactElement)[];
    dataRoleId?: string;
}

export function ActionButton(props: ActionButtonProps) {
    return (
        <button
            data-role-id={props.dataRoleId}
            className={clsx(
                "flex items-center text-nowrap rounded-sm border border-gray-200 px-2 py-1 text-xs text-black shadow-sm",
                props.className,
            )}
        >
            {props.children}
        </button>
    );
}
