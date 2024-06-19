import clsx from "clsx";
import styles from "./index.module.scss";
import mainStyles from "@site/src/pages/index.module.scss";
import AngleIcon from "@site/static/icons/angle.svg";
import React, { ReactNode } from "react";

interface LinkBadgeProps {
    link: string;
    leftTitle: ReactNode;
    rightTitle: ReactNode;
}

export function LinkBadge(props: LinkBadgeProps) {
    return (
        <a
            href={props.link}
            target="_blank"
            className={clsx(
                mainStyles["box-glow"],
                styles["link-badge"],
                "z-50 border-gray-400 bg-gray-100 pr-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-700",
            )}
            rel="noreferrer"
        >
            <div className="mr-2 rounded-full bg-gradient-to-br from-violet-500 to-rose-400 px-3 py-0.5 text-white">
                {props.leftTitle}
            </div>
            <span className="flex-shrink overflow-hidden text-ellipsis">{props.rightTitle}</span>
            <AngleIcon className="ml-1 size-3 flex-shrink-0" />
        </a>
    );
}
