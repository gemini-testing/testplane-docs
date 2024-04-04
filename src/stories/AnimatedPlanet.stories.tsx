import { type Meta, type StoryObj } from "@storybook/react";
import { AnimatedPlanet } from "../components/AnimatedPlanet";

const meta = {
    title: "AnimatedPlanet",
    component: AnimatedPlanet,
    parameters: {},
    argTypes: {},
    args: {},
} satisfies Meta<typeof AnimatedPlanet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
    args: {},
};
