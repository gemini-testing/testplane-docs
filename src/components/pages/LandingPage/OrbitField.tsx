import React from "react";
import styles from "./landing.module.scss";

// Stable positions keep the star field identical in the server and browser renders.
const stars = Array.from({ length: 160 }, (_, i) => ({
    x: (i * 613 + i * i * 7 + 97) % 1447,
    y: (i * 127 + i * i * 3 + 17) % 531,
    r: i % 7 === 0 ? 1.45 : 0.8,
}));

function OrbitSpark() {
    return (
        <g transform="scale(1 .25)">
            <g className={styles.orbiting}>
                <g transform="translate(336 0)">
                    <g className={styles.counterOrbit}>
                        <g transform="scale(1 4)">
                            <circle r="6" fill="#aa91ff" opacity=".16" />
                            <circle r="2.55" fill="#e9dfff" />
                        </g>
                    </g>
                </g>
            </g>
        </g>
    );
}

function Saturn() {
    return (
        <svg
            viewBox="-354 -218 708 436"
            className={styles.saturn}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <radialGradient id="observatory-surface" cx=".21" cy=".2" r=".89">
                    <stop stopColor="#dbdbdb" />
                    <stop offset=".22" stopColor="#bcbcbc" />
                    <stop offset=".53" stopColor="#747474" />
                    <stop offset=".76" stopColor="#393939" />
                    <stop offset="1" stopColor="#121212" />
                </radialGradient>
                <pattern
                    id="observatory-dots"
                    width="6.4"
                    height="6.4"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(-18)"
                >
                    <circle cx="3.2" cy="3.2" r="1.55" fill="#0c0c0c" />
                </pattern>
                <clipPath id="observatory-disc">
                    <circle r="185" />
                </clipPath>
                <filter id="observatory-bands" x="-10%" y="-10%" width="120%" height="120%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency=".009 .024"
                        numOctaves="3"
                        seed="9"
                        result="grain"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="grain"
                        scale="18"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
                <clipPath id="observatory-near">
                    <rect x="-345" y="0" width="690" height="190" />
                </clipPath>
                <g id="observatory-rings" fill="none">
                    {[235, 243, 250, 254, 260, 269, 275, 282, 287, 294, 302].map((rx, i) => (
                        <ellipse
                            key={rx}
                            rx={rx}
                            ry={rx * 0.235}
                            stroke={i % 3 === 0 ? "#bcb8c6" : "#737177"}
                            strokeWidth={i % 3 === 0 ? 1.3 : 2.5}
                        />
                    ))}
                    <ellipse
                        rx="320"
                        ry="80"
                        stroke="#8f859f"
                        strokeDasharray="2 6"
                        strokeWidth=".8"
                    />
                    <ellipse
                        rx="336"
                        ry="84"
                        stroke="#a69bb8"
                        strokeDasharray="2 7"
                        strokeWidth=".7"
                    />
                </g>
            </defs>
            <g transform="rotate(-23)">
                <use href="#observatory-rings" />
                <OrbitSpark />
                <circle r="185" fill="url(#observatory-surface)" />
                <g clipPath="url(#observatory-disc)">
                    <g filter="url(#observatory-bands)" fill="none">
                        {Array.from({ length: 74 }, (_, i) => {
                            const y = -240 + i * 5.8;
                            return (
                                <path
                                    key={i}
                                    d={`M-220 ${y} Q-12 ${y + 80} 220 ${y + 6}`}
                                    stroke={i % 7 < 3 ? "#fafafa" : "#202020"}
                                    strokeWidth={1.2 + (i % 5) * 0.8}
                                    opacity={0.09 + (i % 4) * 0.047}
                                />
                            );
                        })}
                    </g>
                    <circle r="185" fill="url(#observatory-dots)" opacity=".65" />
                </g>
                <g clipPath="url(#observatory-near)">
                    <use href="#observatory-rings" />
                    <OrbitSpark />
                </g>
            </g>
        </svg>
    );
}

export function OrbitField() {
    return (
        <>
            <svg
                viewBox="0 0 1440 530"
                preserveAspectRatio="xMidYMid slice"
                className={styles.sky}
                aria-hidden="true"
                focusable="false"
            >
                <g fill="#ddd">
                    {stars.map(({ x, y, r }, i) => (
                        <circle key={i} cx={x} cy={y} r={r} opacity={0.2 + (i % 6) * 0.1} />
                    ))}
                </g>
                <g fill="none" stroke="#777" strokeWidth=".65">
                    <path d="m-28 330 125-71 68 22 52-57 75 5" opacity=".5" />
                    <path
                        className={styles.signal}
                        d="m-28 330 125-71 68 22 52-57 75 5"
                        pathLength="100"
                        stroke="#ccc"
                        strokeWidth="1.2"
                        strokeDasharray="4 104"
                    />
                    <path d="M-95 482C125 493 299 410 343 337" strokeDasharray="2 6" />
                    <ellipse
                        cx="120"
                        cy="255"
                        rx="151"
                        ry="53"
                        transform="rotate(-30 120 255)"
                        strokeDasharray="2 8"
                        opacity=".45"
                    />
                </g>
                <g fill="#bbb">
                    {[
                        [97, 259],
                        [165, 281],
                        [217, 224],
                        [292, 229],
                    ].map(([cx, cy]) => (
                        <circle key={cx} cx={cx} cy={cy} r="2.2" />
                    ))}
                </g>
                <g stroke="#b6b6b6" strokeWidth="1.3">
                    <path d="M366 86h10m-5-5v10M55 139h8m-4-4v8M991 70h8m-4-4v8M292 391h8m-4-4v8" />
                </g>
                <g fill="#c5aeff">
                    <path d="m325 128 1.3 4.2 4.2 1.3-4.2 1.3-1.3 4.2-1.3-4.2-4.2-1.3 4.2-1.3z" />
                    <path d="m987 286 1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5z" />
                </g>
            </svg>
            <Saturn />
        </>
    );
}
