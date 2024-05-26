import ModifiedIcon from "@site/static/icons/modified.svg";
import React from "react";
import {
    FsTreeItem,
    FsTreeItemType,
    TabProps,
} from "@site/src/components/FeaturesDemo/CodeEditor/index";

export const SAMPLE_TABS: TabProps[] = [
    { title: "main.testplane.ts", icon: <ModifiedIcon />, isActive: true },
    { title: "main.tsx", icon: <ModifiedIcon /> },
    { title: "styles.scss" },
];

export const SAMPLE_FS_TREE_ROOTS: FsTreeItem[] = [
    {
        title: "awesome-project",
        type: FsTreeItemType.Dir,
        children: [
            {
                title: "static",
                type: FsTreeItemType.Dir,
                isCollapsed: true,
                children: [],
            },
            {
                title: "src",
                type: FsTreeItemType.Dir,
                children: [
                    {
                        title: "main.tsx",
                        type: FsTreeItemType.Ts,
                        isModified: true,
                        children: [],
                    },
                    {
                        title: "styles.scss",
                        type: FsTreeItemType.Sass,
                        children: [],
                    },
                ],
            },
            {
                title: "test",
                type: FsTreeItemType.Dir,
                children: [
                    {
                        title: "main.testplane.ts",
                        type: FsTreeItemType.Testplane,
                        isModified: true,
                        isSelected: true,
                        children: [],
                    },
                ],
            },
            {
                title: "package.json",
                children: [],
            },
            {
                title: "README.md",
                children: [],
            },
        ],
    },
];
