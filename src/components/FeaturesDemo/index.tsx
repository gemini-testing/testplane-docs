import { animated, easings, useTransition } from "@react-spring/web";
import clsx from "clsx";
import _ from "lodash";
import React, { MutableRefObject, useEffect, useMemo, useRef } from "react";

import { CodeEditor } from "@site/src/components/FeaturesDemo/CodeEditor";
import { AnimatedHeading } from "@site/src/components/FeaturesDemo/AnimatedHeading";
import {
    SAMPLE_FS_TREE_ROOTS,
    SAMPLE_TABS,
} from "@site/src/components/FeaturesDemo/CodeEditor/constants";
import {
    APP_PAGE_HEADER_HEIGHT,
    BROWSER_TOPBAR_HEIGHT,
    CODE_MESSAGES,
    CodeId,
    CONSOLE_MESSAGES,
    ConsoleId,
    getById,
    HeadingId,
    HEADINGS,
    LONGEST_HEADING,
    PAUSE_LG,
    PAUSE_MD,
    PAUSE_SM,
    PAUSE_XS,
} from "@site/src/components/FeaturesDemo/constants";
import { WebBrowser, WebBrowserApi } from "@site/src/components/FeaturesDemo/WebBrowser";
import { PRODUCTS_SAMPLE_DATA } from "@site/src/components/FeaturesDemo/WebBrowser/AppPage/constants";
import { AppPage } from "@site/src/components/FeaturesDemo/WebBrowser/AppPage";
import { ReportPage } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage";
import {
    DIFF_ATTEMPT,
    SUCCESS_ATTEMPT,
    TESTS_SAMPLE_DATA,
} from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/constants";
import { Status, TestState } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage/types";
import {
    AnimatedCursor,
    AnimatedCursorApi,
} from "@site/src/components/FeaturesDemo/AnimatedCursor";
import {
    ComponentTypes,
    PageTypes,
    ReportPageData,
    useStore,
    WebBrowserWindowData,
} from "@site/src/components/FeaturesDemo/store";
import {
    pause,
    ScreenOrientation,
    scrollToLineIfNeeded,
    typeCode,
    typeConsoleMessage,
    useScreenOrientation,
} from "@site/src/components/FeaturesDemo/utils";

export function FeaturesDemo(props: { className?: string }) {
    const store = useStore();
    const heading = useStore(state => state.heading);

    const appBrowserPageRef = useRef<WebBrowserApi>(null);
    const reportBrowserPageRef = useRef<WebBrowserApi>(null);
    const reportCursorRef = useRef<AnimatedCursorApi>(null);

    const codeRefs = CODE_MESSAGES.map(section => ({
        ...section,
        ref: useRef<HTMLSpanElement>(null),
    }));
    const codeElementRef = useRef<HTMLDivElement>(null);
    const codeCleanupRef = useRef<() => void>(null);

    const codeElement = (
        <div
            className="relative h-full w-full overflow-y-scroll scroll-smooth p-1"
            ref={codeElementRef}
        >
            <div
                className="absolute text-right text-blue-400 opacity-40"
                dangerouslySetInnerHTML={{
                    __html: Array.from(Array(50).keys()).join("<br>"),
                }}
            ></div>
            <div className="pl-7">
                {codeRefs.map(({ ref }, index) => (
                    <span ref={ref} key={index}></span>
                ))}
            </div>
        </div>
    );

    const consoleRefs = CONSOLE_MESSAGES.map(message => ({
        ...message,
        ref: useRef<HTMLSpanElement>(null),
    }));
    const consoleCleanupRef: MutableRefObject<(() => void) | null> = useRef<() => void>(null);

    const consoleElement = (
        <>
            {consoleRefs.map(({ messages, ref }, index) => (
                <span ref={ref} key={`${messages[0]}_${index}`}></span>
            ))}
        </>
    );

    const controller = new AbortController();
    const signal = controller.signal;

    const steps: (() => void | Promise<void>)[] = [
        async function openCodeEditor() {
            store.setHeading(getById(HEADINGS, HeadingId.FamiliarApi).data, signal);

            if (useStore.getState().windows.length > 0) {
                store.popWindow(signal);
            }
            store.pushWindow(
                {
                    key: "code-editor",
                    type: ComponentTypes.CodeEditor,
                    props: {
                        tabs: SAMPLE_TABS,
                        fsTreeRoots: SAMPLE_FS_TREE_ROOTS,
                        code: codeElement,
                        console: consoleElement,
                    },
                },
                signal,
            );

            await pause(PAUSE_SM, signal);
        },
        async function typeBasicTest() {
            await typeCode(getById(codeRefs, CodeId.BasicTestBegin), codeCleanupRef);
            await typeCode(getById(codeRefs, CodeId.BasicTestEnd), codeCleanupRef);

            await pause(PAUSE_LG, signal);
        },
        async function typeLiveTestDeclaration() {
            store.setHeading(getById(HEADINGS, HeadingId.ReplMode).data, signal);

            await typeCode(getById(codeRefs, CodeId.ReplTestBegin), codeCleanupRef);
            await typeCode(getById(codeRefs, CodeId.ReplTestEnd), codeCleanupRef);

            await pause(PAUSE_MD, signal);
        },
        async function launchRepl() {
            await typeConsoleMessage(getById(consoleRefs, ConsoleId.RunRepl), consoleCleanupRef);
            await pause(PAUSE_SM, signal);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.LaunchingBrowser),
                consoleCleanupRef,
            );
            await pause(PAUSE_XS, signal);

            store.pushWindow(
                {
                    key: "browser-with-app",
                    type: ComponentTypes.WebBrowser,
                    props: {},
                    pageData: { type: PageTypes.Blank },
                },
                signal,
            );

            await pause(PAUSE_SM, signal);
        },
        async function typeBrowserUrlCommand() {
            const codeLineData = getById(codeRefs, CodeId.BrowserUrl);
            scrollToLineIfNeeded(codeLineData.ref, codeElementRef);
            await typeCode(codeLineData, codeCleanupRef);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.SendBrowserUrl),
                consoleCleanupRef,
            );

            await pause(PAUSE_MD, signal);
        },
        async function openAppPage() {
            store.setWindow(
                1,
                {
                    props: {
                        url: "localhost:8000",
                        isPageLoading: true,
                    },
                },
                signal,
            );
            await pause(PAUSE_SM, signal);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.BrowserUrlSuccess),
                consoleCleanupRef,
            );

            store.setWindow(
                1,
                {
                    pageData: {
                        type: PageTypes.App,
                        props: {
                            products: PRODUCTS_SAMPLE_DATA,
                            searchText: "",
                            cartCount: 0,
                        },
                    },
                    props: {
                        isPageLoading: false,
                    },
                },
                signal,
            );
            await pause(PAUSE_MD, signal);
        },
        async function typeWrongSetTextCommand() {
            const codeLineData = getById(codeRefs, CodeId.FindInput);
            scrollToLineIfNeeded(codeLineData.ref, codeElementRef);
            await typeCode(codeLineData, codeCleanupRef);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.SendHelloSearch),
                consoleCleanupRef,
            );
            await pause(PAUSE_SM, signal);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.HelloSearchFailure),
                consoleCleanupRef,
            );
            await pause(PAUSE_MD, signal);
        },
        async function typeCorrectSetTextCommand() {
            await typeCode(
                { ...getById(codeRefs, CodeId.FindInput), messageIndex: 1 },
                codeCleanupRef,
            );

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.SendInputSearch),
                consoleCleanupRef,
            );
            await pause(PAUSE_SM, signal);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.InputSearchSuccess),
                consoleCleanupRef,
            );
            await pause(PAUSE_MD, signal);
        },
        async function scrollToCommand() {
            const codeLineData = getById(codeRefs, CodeId.ScrollToInput);
            scrollToLineIfNeeded(codeLineData.ref, codeElementRef);
            await typeCode(codeLineData, codeCleanupRef);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.SendScrollIntoView),
                consoleCleanupRef,
            );
            await pause(PAUSE_SM, signal);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.ScrollIntoViewSuccess),
                consoleCleanupRef,
            );

            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const searchInput = appBrowserPageRef.current
                ?.getUnsafePageRef()
                ?.current?.querySelector('input[data-role-id="search-input"]') as HTMLInputElement;
            const offset = searchInput.offsetTop;
            appBrowserPageRef.current?.setScrollTop(
                offset - APP_PAGE_HEADER_HEIGHT - BROWSER_TOPBAR_HEIGHT,
            );

            await pause(PAUSE_MD, signal);
        },
        async function setInputTextCommand() {
            const codeLineData = getById(codeRefs, CodeId.SetValue);
            scrollToLineIfNeeded(codeLineData.ref, codeElementRef);
            await typeCode(codeLineData, codeCleanupRef);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.SendSetValue),
                consoleCleanupRef,
            );
            await pause(PAUSE_SM, signal);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.SetValueSuccess),
                consoleCleanupRef,
            );
            store.setWindow(1, { pageData: { props: { searchText: "Company of one" } } }, signal);

            await pause(PAUSE_MD, signal);
        },
        async function buttonClickCommand() {
            const codeLineData = getById(codeRefs, CodeId.ButtonClick);
            scrollToLineIfNeeded(codeLineData.ref, codeElementRef);
            await typeCode(codeLineData, codeCleanupRef);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.SendButtonClick),
                consoleCleanupRef,
            );
            await pause(PAUSE_SM, signal);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.ButtonClickSuccess),
                consoleCleanupRef,
            );

            const addToCartButton = appBrowserPageRef.current
                ?.getUnsafePageRef()
                ?.current?.querySelector('button[data-role-id="add-to-cart"]');
            addToCartButton?.classList?.add("outline", "outline-2", "outline-indigo-300");

            store.setWindow(1, { pageData: { props: { cartCount: 1 } } }, signal);

            await pause(PAUSE_MD, signal);
        },
        async function expectCommand() {
            const codeLineData = getById(codeRefs, CodeId.Expect);
            scrollToLineIfNeeded(codeLineData.ref, codeElementRef);
            await typeCode(codeLineData, codeCleanupRef);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.SendSpanSearch),
                consoleCleanupRef,
            );
            await typeConsoleMessage(getById(consoleRefs, ConsoleId.SendExpect), consoleCleanupRef);

            await pause(PAUSE_SM, signal);

            await typeConsoleMessage(
                getById(consoleRefs, ConsoleId.ExpectSuccess),
                consoleCleanupRef,
            );

            await pause(PAUSE_SM, signal);
        },
        async function closeEditorAndOpenReport() {
            store.setWindow(1, { pageData: { type: PageTypes.Blank } }, signal);

            await pause(PAUSE_SM, signal);

            store.setHeading(getById(HEADINGS, HeadingId.HtmlReport).data, signal);

            store.popWindow(signal);

            store.pushWindow(
                {
                    key: "browser-with-report",
                    type: ComponentTypes.WebBrowser,
                    pageData: {
                        type: PageTypes.Report,
                        props: {
                            tests: TESTS_SAMPLE_DATA,
                        },
                    },
                    props: {
                        url: "localhost:3000",
                        isPageLoading: false,
                    },
                },
                signal,
            );

            await pause(PAUSE_LG, signal);
        },
        async function selectTestToRun() {
            store.setHeading(getById(HEADINGS, HeadingId.GuiMode).data, signal);
            await pause(1000, signal);

            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const testToRunCheckbox = reportBrowserPageRef.current
                ?.getUnsafePageRef()
                ?.current?.querySelectorAll("input[type=checkbox]")[1] as HTMLInputElement;

            await reportCursorRef.current?.show();
            await reportCursorRef.current?.setPosition(
                testToRunCheckbox.offsetLeft + 1 - 6,
                testToRunCheckbox.offsetTop + 40 - 6,
            );

            void reportCursorRef.current?.click();

            await pause(150, signal);

            const newTests = _.cloneDeep(TESTS_SAMPLE_DATA);
            newTests[0].state = TestState.Indeterminate;
            newTests[0].children[0].state = TestState.Checked;
            newTests[0].children[0].children[0].state = TestState.Checked;
            store.setWindow(
                1,
                {
                    pageData: {
                        props: {
                            tests: newTests,
                        },
                    },
                },
                signal,
            );

            await pause(PAUSE_SM, signal);
        },
        async function clickRunButton() {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const runButton = reportBrowserPageRef.current
                ?.getUnsafePageRef()
                ?.current?.querySelector('button[data-role-id="run-tests"]') as HTMLButtonElement;

            await reportCursorRef.current?.setPosition(
                runButton.offsetLeft + 25 /* a tiny offset to the right */,
                runButton.offsetTop + BROWSER_TOPBAR_HEIGHT,
            );

            void reportCursorRef.current?.click();
            await pause(150, signal);

            runButton.style.backgroundColor = "rgb(236 213 129)";
            await pause(150, signal);

            void reportCursorRef.current?.hide();
            runButton.style.backgroundColor = "";
        },
        async function setLoading() {
            const newTests = _.cloneDeep(TESTS_SAMPLE_DATA);
            newTests[0].state = TestState.Loading;
            newTests[0].children[0].state = TestState.Loading;
            newTests[0].children[0].children[0].state = TestState.Loading;
            newTests[0].children[1].isDisabled = true;
            newTests[0].children[1].children[0].isDisabled = true;

            store.setWindow(
                1,
                {
                    pageData: { props: { tests: newTests } },
                },
                signal,
            );

            await pause(PAUSE_SM, signal);
        },
        async function openAppPage() {
            store.setWindow(
                0,
                {
                    props: {
                        url: "localhost:8000",
                        isPageLoading: true,
                    },
                },
                signal,
            );
            await pause(PAUSE_SM, signal);

            store.setWindow(
                0,
                {
                    pageData: {
                        type: PageTypes.App,
                        props: {
                            products: PRODUCTS_SAMPLE_DATA,
                            searchText: "",
                            cartCount: 0,
                        },
                    },
                    props: {
                        isPageLoading: false,
                    },
                },
                signal,
            );
            await pause(PAUSE_SM, signal);
        },
        async function scrollAppDown() {
            appBrowserPageRef.current?.setScrollTop(150);

            await pause(PAUSE_SM, signal);
        },
        function openBlank() {
            store.setWindow(
                0,
                {
                    pageData: { type: PageTypes.Blank },
                    props: { url: "about:blank" },
                },
                signal,
            );
        },
        function closeBrowser() {
            store.popWindow(signal);
        },
        function displayTestResults() {
            store.setHeading(getById(HEADINGS, HeadingId.GuiMode).data, signal);

            const newTests = _.cloneDeep(
                (
                    (useStore.getState().windows[0] as WebBrowserWindowData)
                        .pageData as ReportPageData
                ).props.tests,
            ) as typeof TESTS_SAMPLE_DATA;
            newTests[0].status = Status.Failure;
            newTests[0].state = TestState.Indeterminate;

            newTests[0].children[0].status = Status.Failure;
            newTests[0].children[0].state = TestState.Checked;
            newTests[0].children[0].isCollapsed = false;

            newTests[0].children[0].children[0].status = Status.Failure;
            newTests[0].children[0].children[0].state = TestState.Checked;
            newTests[0].children[0].children[0].isCollapsed = false;
            newTests[0].children[0].children[0].attempts.push(DIFF_ATTEMPT);

            newTests[0].children[1].isDisabled = false;
            newTests[0].children[1].children[0].isDisabled = false;

            store.setWindow(
                0,
                {
                    pageData: { props: { tests: newTests } },
                },
                signal,
            );
        },
        async function scrollToTestResult() {
            const testResultCheckBox = reportBrowserPageRef.current
                ?.getUnsafePageRef()
                ?.current?.querySelectorAll("input[type=checkbox]")[2] as HTMLInputElement;

            reportBrowserPageRef.current?.setScrollTop(testResultCheckBox.offsetTop - 4);

            await pause(PAUSE_SM, signal);
            await pause(PAUSE_MD, signal);
        },
        async function clickOnDiff() {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const diffImg = reportBrowserPageRef
                .current!.getUnsafePageRef()
                .current!.querySelector('div[data-role-id="diff-image"]') as HTMLDivElement;
            const diffImgSize = diffImg.getBoundingClientRect();

            const pageHeight =
                reportBrowserPageRef.current?.getUnsafePageRef().current?.clientHeight ?? 0;
            if (diffImgSize.bottom > pageHeight) {
                // Scroll to diff image on small screens, leaving some space (60px) before it
                reportBrowserPageRef.current?.setScrollTop(diffImg.offsetTop - 60);
            }
            await pause(PAUSE_MD, signal);

            const cursor = reportCursorRef.current!;
            await cursor.show();
            const scrollOffset = reportBrowserPageRef.current!.getScrollTop();
            await cursor.setPosition(
                diffImg.offsetLeft + diffImgSize.width / 2,
                diffImg.offsetTop + diffImgSize.height / 2 - scrollOffset,
            );
            void cursor.click();
            await cursor.hide();
        },
        async function showDiffBubbles() {
            reportBrowserPageRef
                .current!.getUnsafePageRef()
                .current!.querySelectorAll(".diff-bubble")
                .forEach(el => el.classList.add("animated"));

            await pause(PAUSE_LG, signal);
        },
        async function clickOnAccept() {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const acceptButton = reportBrowserPageRef
                .current!.getUnsafePageRef()
                .current!.querySelector(
                    'button[data-role-id="accept-button"]',
                ) as HTMLButtonElement;
            reportBrowserPageRef.current?.setScrollTop(0);
            await pause(PAUSE_SM, signal);
            const acceptButtonSize = acceptButton.getBoundingClientRect();

            const scrollOffset = reportBrowserPageRef.current!.getScrollTop();

            const cursor = reportCursorRef.current!;
            await cursor.show();
            await cursor.setPosition(
                acceptButton.offsetLeft + acceptButtonSize.width / 2 - 6,
                acceptButton.offsetTop + acceptButtonSize.height / 2 + 40 - 6 - scrollOffset,
            );
            void cursor.click();
            await pause(150, signal);
            await cursor.hide();
        },
        async function acceptScreenshot() {
            const newTests = _.cloneDeep(
                (
                    (useStore.getState().windows[0] as WebBrowserWindowData)
                        .pageData as ReportPageData
                ).props.tests,
            ) as typeof TESTS_SAMPLE_DATA;

            newTests[0].status = Status.Success;
            newTests[0].children[0].status = Status.Success;
            newTests[0].children[0].children[0].status = Status.Success;
            newTests[0].children[0].children[0].attempts.push(SUCCESS_ATTEMPT);
            newTests[0].children[0].children[0].selectedAttempt = 1;

            store.setWindow(
                0,
                {
                    pageData: { props: { tests: newTests } },
                },
                signal,
            );
            await pause(PAUSE_LG, signal);
        },
    ];

    const runSteps = async () => {
        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                for (const step of steps) {
                    await step();
                }
            }
        } catch (e: unknown) {
            // We expect AbortErrors and therefore mute them
            if (!(e instanceof DOMException) || e.name !== "AbortError") {
                throw e;
            }
        }
    };

    useEffect(() => {
        void runSteps();

        return () => {
            store.reset();
            controller.abort();
        };
    }, []);

    const isHorizontalScreen = useScreenOrientation() === ScreenOrientation.Horizontal;

    const transitions = useTransition(store.windows, {
        from: isHorizontalScreen ? { width: "0%" } : { height: "0%" },
        enter: isHorizontalScreen ? { width: "100%" } : { height: "100%" },
        leave: isHorizontalScreen ? { width: "0%" } : { height: "0%" },
        config: {
            duration: 2000,
            easing: easings.easeInOutQuint,
        },
        keys: item => item.key,
    });

    const headingMemo = useMemo(
        () => (
            <AnimatedHeading
                className="mb-3 2xl:mb-6"
                heading={heading}
                ghostText={LONGEST_HEADING}
            />
        ),
        [heading],
    );

    const windows = (
        <div
            className={clsx(
                "-ml-2 -mt-2 flex w-full flex-grow basis-full justify-stretch overflow-hidden",
                { "flex-col": !isHorizontalScreen },
            )}
        >
            {transitions((styles, item) => {
                let Window;
                if (item.type === ComponentTypes.CodeEditor) {
                    Window = <CodeEditor className="h-full w-full pl-4 pt-4" {...item.props} />;
                } else if (item.type === ComponentTypes.WebBrowser) {
                    if (item.pageData.type === PageTypes.App) {
                        Window = (
                            <WebBrowser
                                className="h-full w-full pl-4 pt-4"
                                page={<AppPage {...item.pageData.props} />}
                                ref={appBrowserPageRef}
                                {...item.props}
                            />
                        );
                    } else if (item.pageData.type === PageTypes.Report) {
                        Window = (
                            <WebBrowser
                                className="h-full w-full pl-4 pt-4"
                                page={
                                    <AnimatedCursor ref={reportCursorRef}>
                                        <ReportPage {...item.pageData.props} />
                                    </AnimatedCursor>
                                }
                                {...item.props}
                                ref={reportBrowserPageRef}
                            />
                        );
                    } else {
                        Window = (
                            <WebBrowser className="h-full pl-4 pt-4" page={null} {...item.props} />
                        );
                    }
                }

                return (
                    <animated.div
                        className="h-full w-full overflow-hidden"
                        style={styles}
                        key={item.key}
                    >
                        {Window}
                    </animated.div>
                );
            })}
        </div>
    );

    return (
        <div
            className={clsx(
                "features-demo pointer-events-none flex w-full flex-col",
                props.className,
            )}
        >
            {headingMemo}
            {windows}
        </div>
    );
}
