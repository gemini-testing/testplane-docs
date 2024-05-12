import { type Meta, type StoryObj } from "@storybook/react";
import React from "react";

import { highlight } from "@site/src/components/FeaturesDemo/CodeEditor/utils";
import { CodeEditor } from "../../components/FeaturesDemo/CodeEditor";
import {
    SAMPLE_FS_TREE_ROOTS,
    SAMPLE_TABS,
} from "@site/src/components/FeaturesDemo/CodeEditor/constants";

const meta = {
    title: "FeaturesDemo/CodeEditor",
    component: CodeEditor,
    parameters: {},
    argTypes: {},
    args: {},
} satisfies Meta<typeof CodeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
    args: {
        status: "main.testplane.ts",
        tabs: SAMPLE_TABS,
        fsTreeRoots: SAMPLE_FS_TREE_ROOTS,
        code: (
            <div
                dangerouslySetInnerHTML={{
                    __html: highlight(`describe("test", () => {
    it("example", async ({browser}) => {
        await browser.openAndWait("https://github.com");

        await browser.$("body").moveCursorTo({yOffset: 300});

        await browser.pause(10000);

        await expect(browser.$(".f4.my-3")).toHaveText("Some text");
    });
});`),
                }}
            ></div>
        ),
        console: (
            <div>
                node --version
                <br />
                v20.10.0
            </div>
        ),
    },
};
