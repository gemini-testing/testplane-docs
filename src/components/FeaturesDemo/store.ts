import { CodeEditorProps } from "@site/src/components/FeaturesDemo/CodeEditor";
import { AppPageProps } from "@site/src/components/FeaturesDemo/WebBrowser/AppPage";
import { ReportPageProps } from "@site/src/components/FeaturesDemo/WebBrowser/ReportPage";
import { WebBrowserProps } from "@site/src/components/FeaturesDemo/WebBrowser";
import { PartialDeep } from "@site/src/types";
import { create } from "zustand";
import _ from "lodash";
import { checkIfAborted } from "@site/src/components/FeaturesDemo/utils";

export enum ComponentTypes {
    CodeEditor,
    WebBrowser,
}

export interface CodeEditorWindowData {
    key: string;
    type: ComponentTypes.CodeEditor;
    props: CodeEditorProps;
}

export enum PageTypes {
    Blank,
    App,
    Report,
}

interface BlankPageData {
    type: PageTypes.Blank;
}

interface AppPageData {
    type: PageTypes.App;
    props: AppPageProps;
}

export interface ReportPageData {
    type: PageTypes.Report;
    props: ReportPageProps;
}

type PageData = BlankPageData | AppPageData | ReportPageData;

export interface WebBrowserWindowData {
    key: string;
    type: ComponentTypes.WebBrowser;
    props: Pick<WebBrowserProps, "url" | "isPageLoading">;
    pageData: PageData;
}

type WindowData = CodeEditorWindowData | WebBrowserWindowData;

interface FeaturesDemoState {
    windows: WindowData[];
    pushWindow: (window: WindowData, signal?: AbortSignal) => void;
    popWindow: (signal?: AbortSignal) => void;
    setWindow: (index: number, window: PartialDeep<WindowData>, signal?: AbortSignal) => void;

    heading: string;
    setHeading: (heading: string, signal?: AbortSignal) => void;

    reset: () => void;
}

const INITIAL_STATE = { windows: [], heading: "Familiar and concise API, that works everywhere" };

export const useStore = create<FeaturesDemoState>(set => ({
    windows: [],
    pushWindow: (window: WindowData, signal?: AbortSignal) =>
        set(state => (checkIfAborted(signal), { windows: [...state.windows, window] })),
    popWindow: (signal?: AbortSignal) =>
        set(state => (checkIfAborted(signal), { windows: [...state.windows.slice(1)] })),
    setWindow: (index: number, window: PartialDeep<WindowData>, signal?: AbortSignal) =>
        set(
            state => (
                checkIfAborted(signal),
                {
                    windows: state.windows.toSpliced(
                        index,
                        1,
                        _.merge(_.cloneDeep(state.windows[index]), window),
                    ),
                }
            ),
        ),
    heading: INITIAL_STATE.heading,
    setHeading: (heading: string, signal?: AbortSignal) =>
        set(() => (checkIfAborted(signal), { heading })),
    reset: () => set(() => ({ heading: INITIAL_STATE.heading, windows: [] })),
}));
