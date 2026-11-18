const assert = require("node:assert/strict");

it("mock.respond: replace response data and metadata in BiDi", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.respond(
            { source: "mocked" },
            {
                statusCode: 201,
                headers: { "content-type": "application/json", "x-example": "response" },
                cookies: [
                    {
                        name: "mock-example",
                        value: "ready",
                        domain: new URL(await browser.getUrl()).hostname,
                        path: "/",
                    },
                ],
            },
        );
        for (let i = 0; i < 2; i++) {
            const result = await browser.execute(async () => {
                const response = await fetch("/api/items", { cache: "no-store" });
                return {
                    status: response.status,
                    header: response.headers.get("x-example"),
                    body: await response.json(),
                };
            });
            assert.deepEqual(result, {
                status: 201,
                header: "response",
                body: { source: "mocked" },
            });
        }
    } finally {
        await mock.restore();
    }
});
