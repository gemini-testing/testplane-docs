import { animated } from "react-spring";
import styles from "./styles.module.scss";
import clsx from "clsx";
import { useEffect, useRef } from "react";

import { useAnimatedTrail } from "@site/src/components/AnimatedPlanet/hooks/useAnimatedTrail";
import { useAnimatedPlane } from "@site/src/components/AnimatedPlanet/hooks/useAnimatedPlane";
import { useAnimatedStar } from "@site/src/components/AnimatedPlanet/hooks/useAnimatedStar";

import planetShadowPng from "@site/static/img/landing/planet-shadow.png";
import planetGradientPng from "@site/static/img/landing/planet-gradient.png";
import { Particles } from "@site/src/components/AnimatedPlanet/Particles";
import { useResizableSvg } from "@site/src/components/AnimatedPlanet/hooks/useResizableSvg";

interface AnimatedPlanetProps {
    className?: string;
}

export function AnimatedPlanet(props: AnimatedPlanetProps) {
    const refs = {
        largePlaneTrail: useRef<SVGPathElement>(null),
        mdTopPlaneTrail: useRef<SVGPathElement>(null),
        mainTrail: useRef<SVGPathElement>(null),
        starTrail: useRef<SVGPathElement>(null),
        bottomPlaneTrail: useRef<SVGPathElement>(null),
        bgTopPlaneTrail: useRef<SVGPathElement>(null),
    };

    const animations = {
        largePlane: useAnimatedPlane(1000, 2000),
        largePlaneTrail: useAnimatedTrail(refs.largePlaneTrail, 1000, 2000),
        mdTopPlane: useAnimatedPlane(1000, 1500),
        mdTopPlaneTrail: useAnimatedTrail(refs.mdTopPlaneTrail, 1000, 1500),
        mainTrail: useAnimatedTrail(refs.mainTrail, 2000, 1500),
        starTrail: useAnimatedTrail(refs.starTrail, 2500, 2000),
        star: useAnimatedStar(2500, 2000),
        bottomPlane: useAnimatedPlane(3000, 2000),
        bottomPlaneTrail: useAnimatedTrail(refs.bottomPlaneTrail, 3000, 2000),
        bgTopPlane: useAnimatedPlane(3600, 1800),
        bgTopPlaneTrail: useAnimatedTrail(refs.bgTopPlaneTrail, 3600, 1800),
    } as const;

    const animationsReady = Object.values(animations)
        .map(a => (a as { isAnimationReady?: boolean }).isAnimationReady)
        .filter(isReady => isReady !== undefined);

    useEffect(() => {
        if (animationsReady.every(Boolean)) {
            Object.values(animations).forEach(animation => animation.api.resume());
        }
    }, animationsReady);

    const boundingBoxRef = useRef<HTMLDivElement>(null);
    const planetSvgRef = useRef<SVGSVGElement>(null);
    const { scale } = useResizableSvg(boundingBoxRef, planetSvgRef);

    return (
        <div
            className={clsx(
                "animated-planet flex aspect-square w-full items-center",
                props.className,
            )}
            ref={boundingBoxRef}
        >
            <div className="relative origin-left" style={{ transform: `scale(${scale})` }}>
                <Particles />
                {/* Planes */}
                <animated.svg
                    className={styles["large-plane"]}
                    style={animations.largePlane.props}
                    viewBox="0 0 36.99 44.76"
                    height={36.99}
                >
                    <path
                        className="fill-[#7c10ff]"
                        d="m22.68,23.38c.09.23.17.45.17.45l7.84,20.92L36.86.95l.13-.95-.79.55L0,25.97l22.2-2.54s.24-.03.48-.06Z"
                    />
                </animated.svg>
                <animated.svg
                    className={styles["md-top-plane"]}
                    style={animations.mdTopPlane.props}
                    viewBox="0 0 32.97 28.45"
                    height={23.45}
                >
                    <path
                        className="fill-[#6b4fff]"
                        d="m16.17,11.52c-.01.18-.02.36-.02.36l-1.02,16.57L32.59.61l.38-.61-.7.14L0,6.4l15.83,5.01s.17.05.34.11Z"
                    />
                </animated.svg>
                <animated.svg
                    className={styles["bg-top-plane"]}
                    style={animations.bgTopPlane.props}
                    viewBox="0 0 27.53 21.59"
                    height={21.59}
                >
                    <path
                        className="fill-[#bea4ff]"
                        d="m12.74,7.86c-.03.15-.05.29-.05.29l-2.37,13.44L27.16.46l.37-.46-.59.05L0,2.18l12.47,5.56s.14.06.27.12Z"
                    />
                </animated.svg>
                <animated.svg
                    className={styles["bottom-plane"]}
                    style={animations.bottomPlane.props}
                    viewBox="0 0 28.11 26.6"
                    height={26.6}
                >
                    <path
                        className="fill-[#5955ff]"
                        d="m14.61,11.73c0,.16.02.32.02.32l.77,14.55L27.84.57l.27-.57-.6.19L0,8.88l14.3,2.79s.16.03.31.06Z"
                    />
                </animated.svg>

                {/* Outer orbit.
                    This weird positioning trick is here for Safari support:
                    - Safari doesn't support applying drop-shadow to <path> directly
                    - If div wrapper or svg itself are not positioned absolutely, the performance is very poor
                */}
                <div
                    className={clsx(
                        "absolute left-0 top-1/2 -translate-y-1/2",
                        styles["outer-orbit-glow"],
                    )}
                >
                    <svg
                        className={clsx("absolute left-0 top-1/2 -translate-y-1/2")}
                        viewBox="0 0 991.8 911.76"
                        width="991.8"
                        height="911.76"
                    >
                        <path
                            className={clsx("fill-none", styles["outer-orbit-trail"])}
                            d="m910.11,661.89c-70.95,134.72-209.31,226.17-368.39,226.17-231.38,0-418.95-193.49-418.95-432.17S310.35,23.72,541.73,23.72c93.97,0,180.72,31.92,250.61,85.82"
                        />
                    </svg>
                </div>
                {/* Planet and plane trails */}
                <svg
                    className={styles.planet}
                    viewBox="0 0 991.8 911.76"
                    width="991.8"
                    height="911.76"
                    ref={planetSvgRef}
                >
                    <defs>
                        <linearGradient
                            id="bg-top-plane-trail-gradient"
                            x1="115.64"
                            y1="413.16"
                            x2="902.06"
                            y2="413.16"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset=".53" stopColor="#fff9d7" />
                            <stop offset="1" stopColor="#9455ff" stopOpacity=".4" />
                        </linearGradient>
                        <linearGradient
                            id="md-top-plane-trail-gradient"
                            x1="0"
                            y1="452.84"
                            x2="701.11"
                            y2="452.84"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stopColor="#fff8b5" stopOpacity=".5" />
                            <stop offset="1" stopColor="#5f2dff" />
                        </linearGradient>
                        <linearGradient
                            id="main-trail-gradient"
                            x1="209.16"
                            y1="544.96"
                            x2="991.8"
                            y2="544.96"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stopColor="#ffafe2" />
                            <stop offset="1" stopColor="#5e32ff" />
                        </linearGradient>
                        <linearGradient
                            id="star-trail-gradient"
                            x1="118.29"
                            y1="508.03"
                            x2="602.36"
                            y2="508.03"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset=".53" stopColor="#fff9d7" />
                            <stop offset="1" stopColor="#9455ff" />
                        </linearGradient>
                        <clipPath id="large-plane-trail-clip-path">
                            <path d="m819.63,366.15c-9.72,16.48-20.09,32.53-30.71,48.4-10.63,15.87-21.54,31.54-32.66,47.06-11.14,15.51-22.43,30.9-34.1,46.03-11.66,15.15-23.96,29.76-36.26,44.36-12.34,14.57-24.82,29.01-37.51,43.27-12.7,14.25-25.54,28.38-38.91,42.04-6.7,6.81-13.52,13.51-20.7,19.86-7.2,6.27-14.48,12.44-21.8,18.57-14.64,12.25-29.48,24.26-44.47,36.07-15.02,11.78-30.18,23.39-45.77,34.43-15.67,10.92-31.61,21.41-47.55,31.91-15.96,10.47-31.98,20.83-48.11,31.02-16.15,10.17-32.34,20.27-48.9,29.78-8.24,4.8-16.71,9.3-25.4,13.23-8.65,4.03-17.32,8.01-26.12,11.72-8.79,3.71-17.7,7.17-26.78,10.14-9.09,2.91-18.35,5.44-27.86,6.51-4.75.52-9.57.67-14.31,0-2.38-.31-4.7-.96-6.95-1.79-2.18-.99-4.35-2.11-6.08-3.79-3.63-3.19-5.74-7.87-6.19-12.62-.54-4.78.23-9.58,1.38-14.2,2.45-9.25,6.6-17.93,11.06-26.35,2.24-4.21,4.59-8.37,6.94-12.52,2.3-4.17,4.81-8.26,6.5-12.73-1.68,4.47-4.18,8.57-6.46,12.75-2.33,4.16-4.67,8.32-6.89,12.54-4.42,8.43-8.54,17.12-10.96,26.35-1.13,4.61-1.88,9.39-1.33,14.13.46,4.72,2.56,9.31,6.14,12.44,1.71,1.65,3.86,2.75,6,3.72,2.23.81,4.52,1.45,6.88,1.75,4.71.66,9.5.49,14.22-.04,9.47-1.09,18.7-3.65,27.76-6.58,9.05-2.99,17.93-6.47,26.7-10.21,8.77-3.73,17.43-7.74,26.06-11.8,8.68-3.96,17.07-8.45,25.3-13.29,16.51-9.55,32.67-19.7,48.77-29.92,16.09-10.25,32.08-20.66,48-31.17,15.89-10.55,31.81-21.09,47.4-32.04,15.52-11.07,30.63-22.72,45.59-34.54,14.94-11.85,29.73-23.91,44.32-36.19,7.29-6.15,14.54-12.34,21.71-18.62,7.1-6.32,13.88-13.01,20.53-19.83,13.29-13.66,26.07-27.82,38.71-42.1,12.62-14.29,25.05-28.76,37.33-43.36,12.24-14.63,24.48-29.26,36.04-44.39,11.59-15.13,22.82-30.55,33.89-46.07,11.06-15.53,21.9-31.22,32.46-47.09,10.54-15.88,20.84-31.93,30.45-48.35l2.64,1.54Z" />
                        </clipPath>
                        <linearGradient
                            id="large-plane-trail-gradient"
                            x1="191.66"
                            y1="623.3"
                            x2="818.97"
                            y2="623.3"
                            xlinkHref="#main-trail-gradient"
                        />
                        <clipPath id="bottom-plane-trail-clip-path">
                            <path d="m935.26,522.88l4.77-4.24,2.39-2.12.61-.53.37-.31c3.98,4.51.96,1.38,1.83,2.41l-.15.14-1.2,1.07-9.58,8.45-19.26,16.76c-12.89,11.12-25.85,22.14-38.94,33.03-26.18,21.71-52.7,43.25-81.06,62.15-28.04,19.3-56.47,38.03-85.41,55.98-14.46,8.98-29.07,17.73-43.86,26.16-14.8,8.42-29.76,16.55-45.06,24.05-30.62,14.98-62.69,26.8-95.34,36.44-32.67,9.59-65.98,17.07-99.7,21.77-16.86,2.31-33.85,3.96-50.88,4.07-17.02.2-34.04-.5-51.02-1.66-33.95-2.38-67.76-6.54-101.34-11.99,33.6,5.32,67.42,9.35,101.37,11.61,16.97,1.09,33.98,1.73,50.98,1.46,17.01-.17,33.95-1.88,50.78-4.25,33.66-4.82,66.9-12.42,99.48-22.11,32.56-9.74,64.53-21.67,94.99-36.71,15.23-7.54,30.14-15.71,44.88-24.17,14.74-8.47,29.3-17.26,43.71-26.28,28.83-18.03,57.17-36.85,85.11-56.24,28.23-18.97,54.55-40.5,80.65-62.31,13.03-10.93,25.94-21.99,38.78-33.15l19.18-16.81,9.53-8.47,1.18-1.06.14-.13c.94.96-1.9-2.33,2.06,2.18l-.24.21-.59.52-2.38,2.12-4.75,4.26-2.03-2.27Z" />
                        </clipPath>
                        <linearGradient
                            id="bottom-plane-trail-gradient"
                            x1="222.3"
                            y1="666.1"
                            x2="936.81"
                            y2="666.1"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stopColor="#f7e" />
                            <stop offset="1" stopColor="#5e32ff" />
                        </linearGradient>
                        <linearGradient
                            id="linear-gradient-7"
                            x1="120.27"
                            y1="455.89"
                            x2="912.33"
                            y2="455.89"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stopColor="#fdfcfd" stopOpacity="0" />
                            <stop offset=".25" stopColor="#fdfcfd" />
                            <stop offset=".77" stopColor="#fdfcfd" stopOpacity=".48" />
                            <stop offset="1" stopColor="#fdfcfd" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient
                            id="linear-gradient-8"
                            x1="427.86"
                            y1="172.9"
                            x2="459.39"
                            y2="172.9"
                            gradientTransform="translate(418.27 -136.71) rotate(47.35) scale(.99 .91)"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stopColor="#fbffcc" />
                            <stop offset="1" stopColor="#ff93e6" />
                        </linearGradient>
                    </defs>

                    <animated.path
                        className={clsx(styles.trail, styles["bg-top-plane-trail"])}
                        id="bg-top-plane-trail"
                        style={animations.bgTopPlaneTrail.props}
                        ref={refs.bgTopPlaneTrail}
                        d="M118.7,725.4c-6.1-4.1,0-28.5,16.3-59s67.1-93.5,95.6-124.1s85.4-85.4,195.2-160.7c109.8-75.2,419-250.2,475.9-280.7"
                    />
                    <animated.path
                        id="md-top-plane-trail"
                        className={clsx(styles.trail, styles["md-top-plane-trail"])}
                        style={animations.mdTopPlaneTrail.props}
                        ref={refs.mdTopPlaneTrail}
                        d="m.75,780.27c18.3-63.05,38.64-97.62,52.88-117.96,14.24-20.34,69.15-99.65,117.96-142.36,48.81-42.71,140.33-124.06,176.94-154.56,36.61-30.51,351.84-239.98,351.84-239.98"
                    />
                    <animated.path
                        className={clsx(styles.trail, styles["main-trail"])}
                        style={animations.mainTrail.props}
                        ref={refs.mainTrail}
                        d="m631.21,336.91c32.54-20.34,132.19-71.18,164.73-87.45,32.54-16.27,144.4-63.05,183.04-20.34,38.64,42.71-26.44,146.43-42.71,170.83s-97.62,126.09-140.33,164.73c-42.71,38.64-152.53,136.26-217.61,176.94-65.08,40.67-132.19,83.38-187.1,103.72-54.91,20.34-124.06,42.71-160.67,28.47-36.61-14.24-14.24-58.98-10.17-81.35"
                    />
                    {/* Vertical lines */}
                    <g>
                        <path
                            className="fill-[#e47cff] opacity-65"
                            d="m521.39,160.99c.39,33.13.4,69.57,0,102.7-.4-33.13-.39-69.57,0-102.7h0Z"
                        />
                        <path
                            className="fill-[#6b83ff] opacity-55"
                            d="m663.75,108.12c.39,33.13.4,69.57,0,102.7-.4-33.13-.39-69.57,0-102.7h0Z"
                        />
                        <path
                            className="fill-[#8a66ff] opacity-80"
                            d="m505.12,91.85c.52,44.3.52,94,0,138.29-.53-44.3-.52-94,0-138.29h0Z"
                        />
                    </g>
                    {/* Planet images */}
                    <g>
                        <image
                            className="opacity-65"
                            width="730"
                            height="730"
                            x="80"
                            y="180"
                            xlinkHref={planetShadowPng}
                        />
                        <clipPath id="planet-gradient-clip-path">
                            <circle cx="489.9" cy="503.5" r="231.3" />
                        </clipPath>
                        <image
                            width="550"
                            height="550"
                            clipPath="url(#planet-gradient-clip-path)"
                            x="220"
                            y="230"
                            xlinkHref={planetGradientPng}
                        />
                    </g>
                    <path
                        className="fill-[#faffd1] opacity-80"
                        d="m214.4,265.9c26.12,18.3,31.97,55.71,13.03,81.29-18.59,25.83-56.03,31.64-81.4,12.33,18.53,13.49,44.74,14.39,64.11,2.3,34.86-21.3,37-71.54,4.25-95.92h0Z"
                    />
                    <animated.path
                        className={clsx(styles.trail, styles["star-trail"])}
                        style={animations.starTrail.props}
                        ref={refs.starTrail}
                        d="m118.71,725.36c6.1,4.07,32.54-4.07,65.08-24.4,32.54-20.34,111.86-77.28,136.26-99.65s83.38-67.11,126.09-111.86c42.71-44.74,85.42-93.55,107.79-126.09,22.37-32.54,47.79-74.03,47.79-74.03"
                    />
                    <animated.path
                        id="large-plane-trail"
                        className={clsx(styles.trail, styles["large-plane-trail"])}
                        style={animations.largePlaneTrail.props}
                        ref={refs.largePlaneTrail}
                        d="M218.4,796.5c-4.1,12.2-36.6,54.9-22.4,75.2c17.5,25,85.4-8.1,115.9-22.4c30.5-14.2,126.1-77.3,158.6-99.7s85.4-65.1,118-93.5s99.7-107.8,124.1-138.3c24.4-30.5,77.3-103.7,105.8-152.5"
                    />
                    <animated.path
                        id="bottom-plane-trail"
                        className={clsx(styles.trail, styles["bottom-plane-trail"])}
                        style={animations.bottomPlaneTrail.props}
                        ref={refs.bottomPlaneTrail}
                        d="M222.4,794.5c0,0,107.8,18.3,176.9,12.2s150.5-28.5,211.5-56.9c61-28.5,144.4-83.4,199.3-122c54.9-38.6,119-96.6,126.1-103.7"
                    />
                    <animated.path
                        className={clsx(styles.star)}
                        style={animations.star.props}
                        d="m613.76,286.15c-7.54-2.72-11.02,1.69-13.6-14.77-.73-4.67-1.47,9.32-5.4,10.52-3.93,1.2-9.06,1.09-9.06,1.09l9.19,7.24-6.52,12.04s8.09-6.24,10.65-6.19c2.56.05,8.43,9.15,8.43,9.15,0,0-1.78-12.86-.42-14.11s6.73-4.99,6.73-4.99Z"
                    />
                </svg>
            </div>
        </div>
    );
}
