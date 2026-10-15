import("./audit-snippets.mjs")
    .then(({ main }) => main())
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
