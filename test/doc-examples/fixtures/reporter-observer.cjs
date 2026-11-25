const assert = require("node:assert/strict");
const { Console } = require("node:console");
const fs = require("node:fs");
const path = require("node:path");
const { Writable } = require("node:stream");

// Each file contains the source of one example. Only the reporter in the master
// has the completed database and screenshots; nothing is simulated in the worker.
module.exports = (testplane, { examples }) => {
    if (testplane.isWorker()) return;

    testplane.on(testplane.events.INIT, () => {
        for (const kind of ["database", "screenshots", "saved", "menu"]) {
            if (!examples[kind]) continue;
            const log = new Console(
                new Writable({
                    write(chunk, encoding, done) {
                        fs.appendFileSync(kind + ".log", chunk);
                        done();
                    },
                }),
            );
            require(examples[kind])(testplane, log);
        }

        const reporter = testplane.htmlReporter;
        reporter.on(reporter.events.REPORT_SAVED, async ({ reportPath }) => {
            const dbPath = path.resolve(reportPath, "sqlite.db");
            if (examples.download) {
                const paths = await require(examples.download)(testplane);
                assert.deepEqual(paths, [dbPath]);
                assert.ok(fs.statSync(paths[0]).size > 0);
            }
            if (examples.merge) {
                fs.mkdirSync("merged");
                for (const input of ["first.db", "second.db"]) fs.copyFileSync(dbPath, input);
                await require(examples.merge)(testplane);
                assert.ok(fs.existsSync("merged/sqlite.db"));
                assert.ok(!fs.existsSync("first.db") && !fs.existsSync("second.db"));
            }
            if (examples.tree) {
                const tree = await require(examples.tree)(testplane);
                assert.deepEqual(tree.results.allIds, ["renders swatch chrome 0"]);
                assert.equal(tree.results.byId[tree.results.allIds[0]].status, "success");
            }
            if (examples.runIds) {
                const ids = await require(examples.runIds)(testplane, dbPath);
                assert.deepEqual(ids, ["doc-run"]);
            }
            fs.writeFileSync("report-saved", reportPath);
        });
    });
};
