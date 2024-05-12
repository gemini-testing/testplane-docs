import { animated, easings, useTransition } from "@react-spring/web";
import clsx from "clsx";
import React, { ReactNode } from "react";

interface TextTransitionProps {
    children: ReactNode;
    ghostElement: ReactNode;
    className?: string;
}

function TextTransition(props: TextTransitionProps) {
    const TRANSITION_DURATION = 1000;

    const transitions = useTransition([props.children], {
        from: { opacity: 0, filter: "blur(10px)" },
        enter: { opacity: 1, filter: "blur(0px)" },
        leave: { opacity: 0, filter: "blur(10px)" },
        config: {
            duration: TRANSITION_DURATION,
            easing: easings.easeInOutQuint,
        },
    });

    return (
        <div className={clsx("relative", props.className)}>
            {transitions((style, item) => (
                <animated.div
                    style={{ ...style }}
                    className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2"
                >
                    {item}
                </animated.div>
            ))}
            <div className="opacity-0">{props.ghostElement}</div>
        </div>
    );
}

interface HeadingProps {
    children: ReactNode;
}

function Heading(props: HeadingProps) {
    return (
        <div className="text-center text-xl font-bold text-white xs:text-2xl sm:text-3xl 2xl:text-4xl">
            {props.children}
        </div>
    );
}

interface AnimatedHeadingProps {
    heading: string;
    // Used to reserve height for max content and prevent height jumps
    ghostText: string;
    className?: string;
}

export function AnimatedHeading({ heading, ghostText, className }: AnimatedHeadingProps) {
    return (
        <TextTransition className={className} ghostElement={<Heading>{ghostText}</Heading>}>
            <Heading>{heading}</Heading>
        </TextTransition>
    );
}
