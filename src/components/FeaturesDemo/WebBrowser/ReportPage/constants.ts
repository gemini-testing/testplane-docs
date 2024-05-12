import actualImg from "@site/static/img/landing/report/actual.jpg";
import expectedImg from "@site/static/img/landing/report/expected.jpg";
import diffImg from "@site/static/img/landing/report/diff.jpg";
import {
    Status,
    TestAttemptWithState,
    TestResultWithState,
    TestSectionWithState,
    TestState,
} from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/types";

export const DIFF_ATTEMPT: TestAttemptWithState = {
    status: Status.Diff,
    meta: { isCollapsed: true, data: {} },
    history: { isCollapsed: true, steps: [] },
    assertViewResults: [
        {
            stateName: "default-state",
            status: Status.Diff,
            isCollapsed: false,
            expectedSrc: expectedImg,
            actualSrc: actualImg,
            diffSrc: diffImg,
            diffBubbles: [
                { x: "8%", y: "94.5%" },
                { x: "17%", y: "85%" },
                { x: "28%", y: "85%" },
                { x: "41%", y: "85%" },
            ],
        },
    ],
};

export const SUCCESS_ATTEMPT: TestAttemptWithState = {
    status: Status.Success,
    meta: { isCollapsed: true, data: {} },
    history: { isCollapsed: true, steps: [] },
    assertViewResults: [
        {
            stateName: "default-state",
            status: Status.Success,
            isCollapsed: false,
            expectedSrc: "",
            actualSrc: actualImg,
        },
    ],
};

export const TESTS_SAMPLE_DATA = [
    {
        title: "Main Store Page",
        isCollapsed: false,
        isDisabled: false,
        state: TestState.Unchecked as TestState,
        status: Status.Success as Status,
        children: [
            {
                title: "should render product card",
                isCollapsed: false,
                isDisabled: false,
                state: TestState.Unchecked,
                status: Status.NotLaunched,
                children: [
                    {
                        title: "chrome-desktop",
                        isCollapsed: true,
                        isDisabled: false,
                        state: TestState.Unchecked,
                        status: Status.NotLaunched as Status,
                        selectedAttempt: 0,
                        attempts: [] as TestAttemptWithState[],
                    },
                ],
            },
            /*{
        title: "should render product card",
        isLeaf: false,
        isOpened: false,
        status: Status.NotLaunched,
        children: [{
            title: "chrome-desktop",
            isLeaf: true,
            isOpened: true,
            status: Status.Failure,
            selectedAttempt: 0,
            attempts: [
                {
                    status: Status.NotLaunched,
                    meta: {isOpened: false},
                    history: {isOpened: false, steps: []},
                }
            ]
        }],
    },*/ {
                title: "should add item to cart",
                isCollapsed: false,
                isDisabled: false as boolean,
                state: TestState.Unchecked as TestState,
                status: Status.Success as Status,
                children: [
                    {
                        title: "chrome-desktop",
                        isCollapsed: false,
                        isDisabled: false as boolean,
                        state: TestState.Unchecked as TestState,
                        status: Status.Success,
                        selectedAttempt: 0,
                        attempts: [
                            {
                                status: Status.Success,
                                assertViewResults: [],
                                meta: {
                                    isCollapsed: true,
                                    data: {},
                                },
                                history: {
                                    isCollapsed: false,
                                    steps: [
                                        { title: "init browser", duration: 127 },
                                        { title: 'url("/localhost:8000")', duration: 202 },
                                        {
                                            title: "$(\"input[data-testid='search']\")",
                                            duration: 32,
                                        },
                                        { title: "input.scrollIntoView()", duration: 82 },
                                        { title: 'input.setValue("Company of one")', duration: 95 },
                                        {
                                            title: "$(\"button[data-testid='add-to-cart']\")",
                                            duration: 11,
                                        },
                                        { title: "click()", duration: 58 },
                                        {
                                            title: "$(\"span[data-testid='cart-count']\")",
                                            duration: 63,
                                        },
                                        {
                                            title: "expect(cartCount).toHaveText('(1)')",
                                            duration: 70,
                                        },
                                    ],
                                },
                            },
                        ] as TestAttemptWithState[],
                    },
                ],
            },
        ],
    },
] satisfies (TestResultWithState | TestSectionWithState)[];
