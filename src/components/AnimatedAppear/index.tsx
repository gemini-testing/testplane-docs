import React from "react";
import { animated, useInView } from "react-spring";

interface AnimatedAppearProps {
    children: React.ReactNode;
    className?: string;
    onAppear?: () => void;
}

export function AnimatedAppear(props: AnimatedAppearProps) {
    const [ref, styles] = useInView(
        () => ({
            from: {
                opacity: 0,
                y: 100,
            },
            to: {
                opacity: 1,
                y: 0,
            },
            onRest: () => {
                props.onAppear?.();
            },
        }),
        {
            rootMargin: "100% 0% -10% 0%",
        },
    );

    return (
        <animated.div ref={ref} style={styles} className={props.className}>
            {props.children}
        </animated.div>
    );
}
