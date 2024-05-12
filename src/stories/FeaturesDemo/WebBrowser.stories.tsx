import { type Meta, type StoryObj } from "@storybook/react";
import React from "react";
import { WebBrowser } from "@site/src/components/FeaturesDemo/WebBrowser";
import { AppPage } from "@site/src/components/FeaturesDemo/WebBrowser/AppPage";

import { ReportPage } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage";
import { PRODUCTS_SAMPLE_DATA } from "@site/src/components/FeaturesDemo/WebBrowser/AppPage/constants";
import { TESTS_SAMPLE_DATA } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/constants";

const meta = {
    title: "FeaturesDemo/WebBrowser",
    component: WebBrowser,
    parameters: {},
    argTypes: {},
    args: {},
} satisfies Meta<typeof WebBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyPage: Story = {
    args: {
        page: <div className="min-h-96 bg-gray-50"></div>,
    },
};

export const BookstoreAppPage: Story = {
    args: {
        page: <AppPage cartCount={0} products={PRODUCTS_SAMPLE_DATA} searchText={""} />,
    },
};

export const ReportAppPage: Story = {
    args: {
        page: <ReportPage tests={TESTS_SAMPLE_DATA} />,
    },
};
