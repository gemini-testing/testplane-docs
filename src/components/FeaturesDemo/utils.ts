import { MutableRefObject, RefObject, useEffect, useState } from "react";
import Typed, { TypedOptions } from "typed.js";
import { highlight } from "@site/src/components/FeaturesDemo/CodeEditor/utils";

export const checkIfAborted = (signal?: AbortSignal) => {
    if (signal?.aborted) {
        throw signal.reason;
    }
};

export const pause = async (ms: number, signal?: AbortSignal): Promise<void> => {
    checkIfAborted(signal);
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if (signal?.aborted) {
                reject(signal.reason);
                return;
            }
            resolve();
        }, ms),
    );
};

const removeTypedJsCursor = (targetElement: RefObject<HTMLElement>): void => {
    const nextSibling = targetElement.current?.nextSibling as HTMLElement | undefined;
    if (nextSibling?.classList.contains("typed-cursor")) {
        nextSibling.remove();
    }
};

interface TypeData {
    messages: string[];
    messageIndex?: number;
    ref: RefObject<HTMLElement>;
    typedJsOptions?: TypedOptions;
}

const type = async (data: TypeData, cleanupRef: MutableRefObject<(() => void) | null>) => {
    let resolve: () => void;
    const resultPromise = new Promise<void>(r => (resolve = r));

    if (cleanupRef.current) {
        cleanupRef.current();
    }

    if (!data.ref.current) {
        return Promise.resolve();
    }

    // eslint-disable-next-line no-new
    new Typed(data.ref.current, {
        strings: [data.messages[data.messageIndex ?? 0]],
        typeSpeed: 5,
        onComplete() {
            cleanupRef.current = () => removeTypedJsCursor(data.ref);
            resolve();
        },
        ...data.typedJsOptions,
    });

    return resultPromise;
};

export const typeCode = async (
    data: Omit<TypeData, "typedJsOptions">,
    cleanupRef: MutableRefObject<(() => void) | null>,
) => {
    return type(
        {
            messageIndex: data.messageIndex,
            messages: data.messages.map(m => highlight(m)),
            ref: data.ref,
        },
        cleanupRef,
    );
};

export const typeConsoleMessage = async (
    data: Omit<TypeData, "typedJsOptions">,
    cleanupRef: MutableRefObject<(() => void) | null>,
) => {
    return type({ ...data, typedJsOptions: { cursorChar: "▊" } }, cleanupRef);
};

export const scrollToLineIfNeeded = (
    lineRef: RefObject<HTMLSpanElement>,
    containerRef: RefObject<HTMLDivElement>,
) => {
    const offsetTop =
        lineRef.current!.offsetTop -
        containerRef.current!.parentElement!.clientHeight +
        80; /* adding some room underneath the line */

    containerRef.current!.scrollTop = offsetTop;
};

export enum ScreenOrientation {
    Horizontal,
    Vertical,
}

const getOrientation = () =>
    window.innerWidth > window.innerHeight
        ? ScreenOrientation.Horizontal
        : ScreenOrientation.Vertical;

export const useScreenOrientation = (): ScreenOrientation => {
    const initialOrientation = getOrientation();
    const [screenOrientation, setScreenOrientation] =
        useState<ScreenOrientation>(initialOrientation);

    useEffect(() => {
        const onResize = () => {
            const newScreenOrientation = getOrientation();
            setScreenOrientation(newScreenOrientation);
        };

        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return screenOrientation;
};
