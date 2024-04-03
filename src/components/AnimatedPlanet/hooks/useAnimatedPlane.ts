import { easings, SpringRef, SpringValue, useSpring } from "react-spring";

interface AnimatedPlaneTrailReturnType {
    props: { opacity: SpringValue<number>; offsetDistance: SpringValue<string> };
    api: SpringRef<{ opacity: number; offsetDistance: string }>;
}

export const useAnimatedPlane = (delay: number, duration: number): AnimatedPlaneTrailReturnType => {
    const [props, api] = useSpring(() => ({
        from: { opacity: 0, offsetDistance: "0%" },
        to: { opacity: 1, offsetDistance: "100%" },
        delay,
        pause: true,
        config: {
            duration,
            easing: easings.easeInOutQuart,
        },
    }));

    return { props, api };
};
