import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";
import React, { ForwardedRef, forwardRef, ReactNode, useImperativeHandle } from "react";
import { useSpringRef } from "react-spring";

interface AnimatedCursorProps {
    children: ReactNode;
}

export interface AnimatedCursorApi {
    click: () => Promise<void>;
    setPosition: (x: number, y: number) => Promise<void>;
    show: () => Promise<void>;
    hide: () => Promise<void>;
}

export const AnimatedCursor = forwardRef(function AnimatedCursorInternal(
    props: AnimatedCursorProps,
    ref: ForwardedRef<AnimatedCursorApi>,
) {
    const api = useSpringRef();
    const springs = useSpring({
        ref: api,
        from: { scaleX: 1, scaleY: 1, top: 250, left: 75, opacity: 0 },
    });

    useImperativeHandle(ref, () => ({
        async click(): Promise<void> {
            await Promise.all(
                api.start({
                    config: { duration: 300 /*easing: easings.easeInOutQuint*/ },
                    to: [
                        { scaleX: 1.2, scaleY: 1.2 },
                        { scaleX: 1, scaleY: 1 },
                    ],
                }),
            );
        },
        async setPosition(x, y): Promise<void> {
            await Promise.all(
                api.start({
                    config: {
                        /*duration: 500,*/
                        /*easing: easings.easeInOutQuint*/
                    },
                    to: [{ top: y, left: x }],
                }),
            );
        },
        async show() {
            await Promise.all(
                api.start({
                    config: { duration: 500 },
                    to: [{ opacity: 0.6, scaleX: 1, scaleY: 1 }],
                }),
            );
        },
        async hide() {
            await Promise.all(
                api.start({
                    config: { duration: 500 },
                    to: [{ opacity: 0, scaleX: 0, scaleY: 0 }],
                }),
            );
        },
    }));

    return (
        <div>
            {props.children}
            <animated.div
                className={clsx(
                    "absolute z-50 size-6 rounded-full bg-purple-400 outline outline-2 outline-violet-800",
                )}
                style={{ ...springs }}
            ></animated.div>
        </div>
    );
});
