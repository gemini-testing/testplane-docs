import browserStyles from "./WebBrowser/styles.module.scss";

export const PAUSE_XS = 500;
export const PAUSE_SM = 1000;
export const PAUSE_MD = 2500;
export const PAUSE_LG = 5000;

export const BROWSER_TOPBAR_HEIGHT = Number(browserStyles["browser-topbar-height"]);
export const APP_PAGE_HEADER_HEIGHT = 36;

export const getById = <T extends { id: number | string }>(items: T[], id: number | string): T => {
    const result = items.find(item => item.id === id);

    if (!result) {
        throw new Error(
            "Couldn't find item with id " + id + " in collection " + JSON.stringify(items),
        );
    }

    return result;
};

export enum HeadingId {
    FamiliarApi,
    ReplMode,
    HtmlReport,
    GuiMode,
    VisualTesting,
}

export const HEADINGS = [
    { id: HeadingId.FamiliarApi, data: "Familiar and concise API, that works everywhere" },
    { id: HeadingId.ReplMode, data: "Get instant feedback as you write tests" },
    { id: HeadingId.HtmlReport, data: "View data results in feature-rich report" },
    { id: HeadingId.GuiMode, data: "Powerful, yet easy to use GUI mode" },
    { id: HeadingId.VisualTesting, data: "Vast visual testing capabilities" },
];

export const LONGEST_HEADING = HEADINGS.reduce((a, b) =>
    a.data.length > b.data.length ? a : b,
).data;

export enum CodeId {
    BasicTestBegin,
    BasicTestEnd,
    ReplTestBegin,
    BrowserUrl,
    FindInput,
    ScrollToInput,
    SetValue,
    ButtonClick,
    Expect,
    ReplTestEnd,
}

export const CODE_MESSAGES = [
    { id: CodeId.BasicTestBegin, messages: [`describe("Main Store Page", () => {`] },
    { id: CodeId.ReplTestBegin, messages: [`<br>  it("should add product to cart", () => {<br>`] },
    {
        id: CodeId.BrowserUrl,
        messages: [`<span></span>    await browser.url("localhost:8000");<br>    <span></span>`],
    },
    {
        id: CodeId.FindInput,
        messages: [
            `const input = await browser.$("HELLO");`,
            `const input = await browser.$("input[data-testid='search']");<br>    <span></span>`,
        ],
    },
    { id: CodeId.ScrollToInput, messages: [`await input.scrollIntoView();<br>    <span></span>`] },
    {
        id: CodeId.SetValue,
        messages: [`await input.setValue("Company of one");<br>    <span></span>`],
    },
    {
        id: CodeId.ButtonClick,
        messages: [
            `await browser.$("button[data-testid='add-to-cart']").click();<br><br>    <span></span>`,
        ],
    },
    {
        id: CodeId.Expect,
        messages: [
            `const cartCount = await browser.$("span[data-testid='cart-count']");<br>    await expect(cartCount).toHaveText('(1)');`,
        ],
    },
    { id: CodeId.ReplTestEnd, messages: [`<br>  });<br>`] },
    {
        id: CodeId.BasicTestEnd,
        messages: [
            `<br>  it("should render product card", async ({browser}) => {
    await browser.url("localhost:8000");

    await browser.$("div[data-test-id='product']").assertView("default-state");
  });
});`,
        ],
    },
];

export enum ConsoleId {
    RunRepl,
    LaunchingBrowser,
    SendBrowserUrl,
    BrowserUrlSuccess,
    SendHelloSearch,
    HelloSearchFailure,
    SendInputSearch,
    InputSearchSuccess,
    SendScrollIntoView,
    ScrollIntoViewSuccess,
    SendSetValue,
    SetValueSuccess,
    SendButtonClick,
    ButtonClickSuccess,
    SendSpanSearch,
    SendExpect,
    ExpectSuccess,
}

export const CONSOLE_MESSAGES = [
    { id: ConsoleId.RunRepl, messages: ["npx testplane --repl --grep 'add product to cart'"] },
    { id: ConsoleId.LaunchingBrowser, messages: ["`<br>Launching browser...`"] },
    { id: ConsoleId.SendBrowserUrl, messages: ['`<br>> browser.url("localhost:8000");`'] },
    {
        id: ConsoleId.BrowserUrlSuccess,
        messages: ["`<br><span class='text-green-400'>< Success</span>`"],
    },
    { id: ConsoleId.SendHelloSearch, messages: ['`<br>> browser.$("HELLO");`'] },
    {
        id: ConsoleId.HelloSearchFailure,
        messages: ["`<br><span class='text-red-500'>< Error: \"HELLO\" element not found</span>`"],
    },
    {
        id: ConsoleId.SendInputSearch,
        messages: ["`<br>> browser.$(\"input[data-testid='search']\");`"],
    },
    {
        id: ConsoleId.InputSearchSuccess,
        messages: ["`<br><span class='text-green-400'>< Success</span>`"],
    },
    { id: ConsoleId.SendScrollIntoView, messages: ["`<br>> input.scrollIntoView();`"] },
    {
        id: ConsoleId.ScrollIntoViewSuccess,
        messages: ["`<br><span class='text-green-400'>< Success</span>`"],
    },
    { id: ConsoleId.SendSetValue, messages: ['`<br>> input.setValue("Company of one");`'] },
    {
        id: ConsoleId.SetValueSuccess,
        messages: ["`<br><span class='text-green-400'>< Success</span>`"],
    },
    {
        id: ConsoleId.SendButtonClick,
        messages: ["`<br>> browser.$(\"button[data-testid='add-to-cart']\").click();`"],
    },
    {
        id: ConsoleId.ButtonClickSuccess,
        messages: ["`<br><span class='text-green-400'>< Success</span>`"],
    },
    {
        id: ConsoleId.SendSpanSearch,
        messages: ["`<br>> browser.$(\"span[data-testid='cart-count']\");`"],
    },
    { id: ConsoleId.SendExpect, messages: ["`<br>> expect(cartCount).toHaveText('(1)');`"] },
    {
        id: ConsoleId.ExpectSuccess,
        messages: ["`<br><span class='text-green-400'>< Success</span>`"],
    },
];
