import clsx from "clsx";
import React, {
    CSSProperties,
    ForwardedRef,
    forwardRef,
    JSX,
    ReactNode,
    RefObject,
    useImperativeHandle,
    useRef,
} from "react";

import AngleIcon from "@site/static/icons/angle.svg";
import PlusIcon from "@site/static/icons/plus.svg";
import TabsIcon from "@site/static/icons/tabs.svg";
import SpinnerIcon from "@site/static/icons/spinner.svg";
import styles from "./styles.module.scss";

export interface WebBrowserProps {
    style?: CSSProperties;
    className?: string;
    page?: ReactNode;
    isPageLoading?: boolean;
    url?: string;
}

export interface WebBrowserApi {
    setScrollTop: (offset: number) => void;
    getScrollTop: () => number;
    getUnsafePageRef: () => RefObject<HTMLDivElement>;
}

export const WebBrowser = forwardRef(function WebBrowserInternal(
    props: WebBrowserProps,
    ref: ForwardedRef<WebBrowserApi>,
): JSX.Element {
    const pageRef = useRef<null | HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        setScrollTop: (offset: number): void => {
            if (pageRef.current) {
                pageRef.current.scrollTop = offset;
            }
        },
        getScrollTop: (): number => {
            return pageRef.current?.scrollTop ?? 0;
        },
        getUnsafePageRef: (): RefObject<HTMLDivElement> => {
            return pageRef;
        },
    }));

    return (
        <div className={clsx("min-w-0", props.className)} style={props.style}>
            <div className={clsx(styles.browser, "relative")}>
                <div
                    className={clsx(
                        styles.topbar,
                        "flex min-w-0 items-center justify-between border-b border-gray-200 bg-white fill-gray-400 px-4 text-gray-400",
                    )}
                >
                    <div className="flex">
                        <AngleIcon className="mr-2 size-3.5 rotate-180" />
                        <AngleIcon className="size-3.5" />
                    </div>
                    <div className="relative w-2/3 overflow-hidden rounded-xl border border-gray-300 px-5 text-center text-sm text-nowrap text-ellipsis">
                        {props.url ?? "about:blank"}
                        {props.isPageLoading && (
                            <div className="absolute top-1/2 right-1.5 -translate-y-1/2">
                                <SpinnerIcon className="size-3 animate-spin overflow-visible stroke-gray-400 stroke-[15px]" />
                            </div>
                        )}
                    </div>
                    <div className="flex">
                        <PlusIcon className="size-3.5" />
                        <TabsIcon className="size-3.5" />
                    </div>
                </div>
                <div
                    className="h-full w-full overflow-y-scroll scroll-smooth bg-white"
                    ref={pageRef}
                >
                    {props.page}
                </div>
            </div>
        </div>
    );
});
