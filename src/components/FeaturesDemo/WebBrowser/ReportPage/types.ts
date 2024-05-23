export interface TestHistoryStep {
    title: string;
    duration: number;
}

export enum Status {
    NotLaunched,
    Success,
    Failure,
    Diff,
}

export interface AssertViewSuccess {
    stateName: string;
    status: Status.Success;
    expectedSrc: string;
    actualSrc: string;
}

export interface AssertViewDiff {
    stateName: string;
    status: Status.Diff;
    expectedSrc: string;
    actualSrc: string;
    diffSrc: string;
    diffBubbles: { x: string; y: string }[];
}

export type AssertViewResult = AssertViewSuccess | AssertViewDiff;

export interface TestAttempt {
    status: Status;
    meta: { data: Record<string, unknown> };
    history: { steps: TestHistoryStep[] };
    assertViewResults?: AssertViewResult[];
}

export interface TestResult {
    title: string;
    status: Status;
    attempts: TestAttempt[];
}

export type AssertViewSuccessWithState = AssertViewSuccess & { isCollapsed: boolean };
export type AssertViewDiffWithState = AssertViewDiff & { isCollapsed: boolean };

export type AssertViewResultWithState = AssertViewResult & { isCollapsed: boolean };

export enum TestState {
    Blank,
    Checked,
    Unchecked,
    Indeterminate,
    Loading,
}

export interface TestAttemptWithState extends TestAttempt {
    meta: TestAttempt["meta"] & { isCollapsed: boolean };
    history: TestAttempt["history"] & { isCollapsed: boolean };
    assertViewResults: AssertViewResultWithState[];
}

export interface TestResultWithState extends TestResult {
    attempts: TestAttemptWithState[];
    isCollapsed: boolean;
    isDisabled: boolean;
    selectedAttempt: number;
    state: TestState;
}

export interface TestSectionWithState {
    children: (TestResultWithState | TestSectionWithState)[];
    isCollapsed: boolean;
    isDisabled: boolean;
    state: TestState;
    status: Status;
    title: string;
}
