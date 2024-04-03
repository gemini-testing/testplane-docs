import { easings, SpringRef, SpringValue, useSpring } from "react-spring";

interface AnimatedPlaneTrailReturnType {
    props: { scale: SpringValue<number>; rotateZ: SpringValue<number> };
    api: SpringRef<{ scale: number; rotateZ: number }>;
}

export const useAnimatedStar = (delay: number, duration: number): AnimatedPlaneTrailReturnType => {
    const [props, api] = useSpring(() => ({
        from: { scale: 0, rotateZ: -360 },
        to: { scale: 1, rotateZ: 0 },
        delay,
        config: {
            duration,
            easing: easings.easeInOutBounce,
        },
    }));

    return { props, api };
};
