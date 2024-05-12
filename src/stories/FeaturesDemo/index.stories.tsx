import { type Meta, type StoryObj } from "@storybook/react";
import { FeaturesDemo } from "@site/src/components/FeaturesDemo";

const meta = {
    title: "FeaturesDemo",
    component: FeaturesDemo,
    parameters: {
        backgrounds: {
            default: "dark",
        },
    },
    argTypes: {},
    args: {},
} satisfies Meta<typeof FeaturesDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
    args: {},
};
