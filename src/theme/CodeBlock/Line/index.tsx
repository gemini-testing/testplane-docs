import React from "react";
import clsx from "clsx";
import LineToken from "@theme/CodeBlock/Line/Token";
import type { Props } from "@theme/CodeBlock/Line";

import styles from "./styles.module.css";

function fixLineBreak(line: Props["line"]): Props["line"] {
    const singleLineBreakToken =
        line.length === 1 && line[0].content === "\n" ? line[0] : undefined;

    if (singleLineBreakToken) {
        return [{ ...singleLineBreakToken, content: "" }];
    }

    return line;
}

export default function CodeBlockLine({
    line: lineProp,
    classNames,
    showLineNumbers,
    getLineProps,
    getTokenProps,
}: Props): JSX.Element {
    const line = fixLineBreak(lineProp);

    const lineProps = getLineProps({
        line,
        className: clsx(classNames, showLineNumbers && styles.codeLine),
    });

    const lineTokens = line.map((token, key) => {
        const tokenProps = getTokenProps({ token });

        return (
            <LineToken key={key} {...tokenProps} line={line} token={token}>
                {tokenProps.children}
            </LineToken>
        );
    });

    return (
        <div {...lineProps}>
            {showLineNumbers ? (
                <>
                    <span className={styles.codeLineNumber} />
                    <span className={styles.codeLineContent}>{lineTokens}</span>
                </>
            ) : (
                lineTokens
            )}
            <br />
        </div>
    );
}
