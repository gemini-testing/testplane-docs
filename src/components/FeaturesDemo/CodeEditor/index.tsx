import clsx from "clsx";
import React, { JSX, ReactElement, ReactNode } from "react";

import SearchIcon from "@site/static/icons/search.svg";
import CloseIcon from "@site/static/icons/close.svg";
import AngleIcon from "@site/static/icons/angle.svg";
import TypescriptIcon from "@site/static/icons/typescript.svg";
import FolderIcon from "@site/static/icons/folder.svg";
import TextIcon from "@site/static/icons/text.svg";
import SassIcon from "@site/static/icons/sass.svg";
import TestplaneIcon from "@site/static/icons/testplane.svg";
import TerminalIcon from "@site/static/icons/terminal.svg";
import { Collapsible } from "@site/src/components/Collapsible";
import styles from "./styles.module.scss";

export interface TabProps {
    title: string;
    icon?: ReactElement;
    isActive?: boolean;
}

function Tab(props: TabProps) {
    return (
        <div
            className={clsx(
                styles["tab-item"],
                "code-editor__tab relative ml-5 flex items-center text-nowrap",
            )}
        >
            <div className={clsx({ "text-indigo-200": props.isActive })}>{props.title}</div>
            <div className={clsx("ml-5 size-3", { "fill-indigo-200": props.isActive })}>
                {props.icon ?? <CloseIcon />}
            </div>
            {props.isActive && <div className="absolute bottom-0 h-0.5 w-full bg-indigo-500"></div>}
        </div>
    );
}

export enum FsTreeItemType {
    Dir,
    Ts,
    Txt,
    Sass,
    Testplane,
}

export interface FsTreeItem {
    title: string;
    type?: FsTreeItemType;
    isCollapsed?: boolean;
    isModified?: boolean;
    isSelected?: boolean;
    children: FsTreeItem[];
}

function CollapsibleFsTreeItem(props: FsTreeItem) {
    const getItemIcon = (type?: FsTreeItemType) => {
        switch (type) {
            case FsTreeItemType.Dir:
                return <FolderIcon className="size-3" />;
            case FsTreeItemType.Ts:
                return <TypescriptIcon className="size-3" />;
            case FsTreeItemType.Sass:
                return <SassIcon className="size-3" />;
            case FsTreeItemType.Testplane:
                return <TestplaneIcon className="size-3" />;
            default:
                return <TextIcon className="size-3" />;
        }
    };

    const ItemTitle = (
        <div
            className={clsx("code-editor__fs-tree-item ml-5 flex items-center", {
                "fill-indigo-400 text-indigo-400": props.isModified,
            })}
        >
            <div className="relative z-10">
                {props.type === FsTreeItemType.Dir && (
                    <AngleIcon
                        className={clsx(
                            "absolute -left-5 top-1/2 flex size-3 -translate-y-1/2 items-center",
                            { "rotate-90": !props.isCollapsed },
                        )}
                    />
                )}
            </div>
            {props.isSelected && (
                <div className="absolute left-0 z-0 h-6 w-full bg-indigo-900"></div>
            )}
            <div className="z-10 mr-2">{getItemIcon(props.type)}</div>
            <div className="z-10">{props.title}</div>
        </div>
    );

    return (
        <Collapsible title={ItemTitle} isCollapsed={props.isCollapsed}>
            <>
                {props.children.map((item, index) => (
                    <CollapsibleFsTreeItem key={index} {...item} />
                ))}
            </>
        </Collapsible>
    );
}

export interface CodeEditorProps {
    style?: React.CSSProperties;
    className?: string;
    code?: ReactNode;
    console?: ReactNode;
    status?: string;
    tabs: TabProps[];
    fsTreeRoots: FsTreeItem[];
}

export function CodeEditor(props: CodeEditorProps): JSX.Element {
    return (
        <div className={clsx(styles.wrapper, props.className, "code-editor")} style={props.style}>
            <div
                className={clsx(
                    styles.editor,
                    "h-full w-full overflow-hidden rounded-lg bg-indigo-950 fill-indigo-800 text-indigo-800",
                )}
            >
                <div className={clsx(styles.search, "flex items-center pl-3")}>
                    <SearchIcon className="mr-2 size-4" />
                    <div>Search</div>
                </div>
                <div
                    className={clsx(
                        styles.tabs,
                        "flex items-stretch overflow-hidden bg-indigo-950",
                    )}
                >
                    {props.tabs.map((tab, index) => (
                        <Tab key={index} {...tab} />
                    ))}
                </div>
                <div
                    className={clsx(
                        styles["work-tree"],
                        "relative border-y border-indigo-900 px-2",
                    )}
                >
                    {props.fsTreeRoots.map((root, index) => (
                        <CollapsibleFsTreeItem key={index} {...root} />
                    ))}
                </div>
                <div
                    className={clsx(
                        styles.code,
                        "overflow-y-hidden whitespace-pre-wrap bg-gradient-to-tr from-indigo-950 to-indigo-900 p-1 font-mono text-xs text-white sm:text-sm",
                    )}
                >
                    {props.code}
                </div>
                <div
                    className={clsx(
                        styles.console,
                        "relative overflow-hidden border-4 border-indigo-950 font-mono text-sm text-gray-400",
                    )}
                >
                    <div className="absolute bottom-0">{props.console}</div>
                </div>
                <div
                    className={clsx(
                        styles["status-bar"],
                        "flex items-center justify-between border-t border-indigo-900 px-2",
                    )}
                >
                    <div className="flex items-center">
                        <span>{props.status}</span>
                        <TerminalIcon className="ml-1 size-3" />
                    </div>
                    <div>
                        <span className="ml-2">LF</span>
                        <span className="ml-2">UTF-8</span>
                        <span className="ml-2 hidden sm:inline">TypeScript</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
