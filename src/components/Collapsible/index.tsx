import { ReactNode } from "react";

interface CollapsibleProps {
    title?: ReactNode;
    children?: ReactNode;
    isCollapsed?: boolean;
}

export function Collapsible(props: CollapsibleProps) {
    return (
        <div>
            <div>{props.title}</div>
            {!props.isCollapsed && <div className="pl-3">{props.children}</div>}
        </div>
    );
}
