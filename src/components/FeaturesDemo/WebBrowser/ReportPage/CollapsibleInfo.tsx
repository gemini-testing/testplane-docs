import AngleIcon from "@site/static/icons/angle.svg";
import { Collapsible } from "@site/src/components/Collapsible";
import React, { ReactNode } from "react";
import clsx from "clsx";

interface CollapsibleInfoProps {
    title: string;
    isCollapsed?: boolean;
    children?: ReactNode;
    titleClassName?: string;
}

export function CollapsibleInfo(props: CollapsibleInfoProps) {
    return (
        <Collapsible
            title={
                <div className={clsx("flex items-center font-medium", props.titleClassName)}>
                    {props.title}
                    <AngleIcon
                        className={clsx("ml-1 size-3", { "rotate-90": !props.isCollapsed })}
                    />
                </div>
            }
            isCollapsed={props.isCollapsed}
        >
            {props.children}
        </Collapsible>
    );
}
