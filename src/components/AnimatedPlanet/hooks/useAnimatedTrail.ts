import React, { useEffect, useState } from "react";
import { easings, SpringRef, SpringValue, useSpring } from "react-spring";

interface AnimatedTrailReturnType {
    props: { strokeDashoffset: SpringValue<number> };
    api: SpringRef<{ strokeDashoffset: number }>;
    isAnimationReady: boolean;
}

/*
This hook does the following:
1. Waits until path is mounted.
2. Gets path's length and sets it to stroke-dasharray.
3. Initialises animation of stroke-dashoffset in paused state and returns it.

Only if stroke-dasharray is equal to total path length, the animation will be smooth and synced with a plane.
*/
export const useAnimatedTrail = (
    pathRef: React.RefObject<SVGPathElement>,
    delay: number,
    duration: number,
): AnimatedTrailReturnType => {
    const [trailTotalLength, setTrailTotalLength] = useState(0);
    const [isAnimationReady, setIsAnimationReady] = useState(false);

    useEffect(() => {
        if (pathRef.current) {
            const totalLength = pathRef.current.getTotalLength();
            setTrailTotalLength(totalLength);
            pathRef.current.style.strokeDasharray = totalLength.toString();

            // Initially paths should be hidden to prevent them blinking upon mount
            pathRef.current.style.opacity = "1";

            setIsAnimationReady(true);
        }
    }, [pathRef]);

    const [props, api] = useSpring(
        () => ({
            from: { strokeDashoffset: trailTotalLength },
            to: { strokeDashoffset: 0 },
            delay: delay,
            pause: true,
            config: {
                duration: duration,
                easing: easings.easeInOutQuart,
            },
        }),
        [trailTotalLength],
    );

    return { props, api, isAnimationReady };
};
