import React, { useEffect, useRef, useState } from "react";
import { translate } from "@docusaurus/Translate";
import { useColorMode } from "@docusaurus/theme-common";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
    PlanetEarth,
    CodeCompare,
    LayoutList,
    Filmstrip,
    PlayFill,
    PauseFill,
} from "@gravity-ui/icons";
import Logo from "@site/static/img/logo-dark.svg";
import styles from "./landing.module.scss";

const scenes = [
    {
        file: "visual",
        click: { x: 601, y: 111 },
        icon: CodeCompare,
        name: translate({ id: "landing.studio.visual", message: "Visual checks" }),
        caption: translate({
            id: "landing.atlas.visualCaption",
            message: "Reveal the pixels that changed in Saturn’s orbital period.",
        }),
    },
    {
        file: "suites",
        click: { x: 192, y: 124 },
        icon: LayoutList,
        name: translate({ id: "landing.studio.suites", message: "Test runs" }),
        caption: translate({
            id: "landing.atlas.suitesCaption",
            message: "Filter the test tree to see the three checks that passed.",
        }),
    },
    {
        file: "replay",
        click: { x: 862, y: 528 },
        icon: Filmstrip,
        name: translate({ id: "landing.studio.replay", message: "Time travel" }),
        caption: translate({
            id: "landing.studio.replayCaption",
            message: "Select a recorded step to inspect the DOM as it was during the test.",
        }),
    },
];

export function ReportPreview() {
    const [selected, setSelected] = useState(0);
    const [intent, setIntent] = useState<"auto" | "play" | "pause">("auto");
    const [visible, setVisible] = useState(false);
    const [reduced, setReduced] = useState(true);
    const [playing, setPlaying] = useState(false);
    const viewer = useRef<HTMLDivElement>(null);
    const player = useRef<HTMLVideoElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const spark = useRef<SVGGElement>(null);
    const { colorMode } = useColorMode();
    const scene = scenes[selected];
    const base = useBaseUrl(`/img/landing/studio/${scene.file}-${colorMode}`);
    const enabled = visible && (intent === "play" || (intent === "auto" && !reduced));

    useEffect(() => {
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const syncMotion = () => {
            setReduced(motion.matches);
            setIntent("auto");
        };
        let onScreen = false;
        const syncVisibility = () => setVisible(onScreen && !document.hidden);
        const observer = new IntersectionObserver(
            ([entry]) => {
                onScreen = entry.isIntersecting && entry.intersectionRatio >= 0.12;
                syncVisibility();
            },
            { threshold: [0, 0.12] },
        );
        if (viewer.current) observer.observe(viewer.current);
        syncMotion();
        motion.addEventListener("change", syncMotion);
        document.addEventListener("visibilitychange", syncVisibility);
        return () => {
            observer.disconnect();
            motion.removeEventListener("change", syncMotion);
            document.removeEventListener("visibilitychange", syncVisibility);
        };
    }, []);

    useEffect(() => {
        const video = player.current;
        if (!video) return;
        if (!enabled) {
            video.pause();
            return;
        }
        let active = true;
        void video.play().catch(() => {
            if (active) setIntent("pause");
        });
        return () => {
            active = false;
            video.pause();
        };
    }, [base, enabled, intent]);

    useEffect(() => {
        const video = player.current;
        if (!video || !spark.current || !stage.current || reduced) return;

        // All three fixed shots click on frame 135 at 30 fps.
        const burst = spark.current.animate(
            [
                { transform: "scale(.35)", opacity: 0 },
                { transform: "scale(.72)", opacity: 1, offset: 0.18 },
                { transform: "scale(1.17)", opacity: 0.85, offset: 0.53 },
                { transform: "scale(1.55)", opacity: 0 },
            ],
            { delay: 4500, duration: 520, endDelay: 5480, fill: "both" },
        );
        const effects = [burst];
        if (scene.file === "visual") {
            // Keep the pointer and its spark in the same coordinates as the moving image.
            const ease = "cubic-bezier(.45, 0, .25, 1)";
            effects.push(
                stage.current.animate(
                    [
                        { transform: "scale(1)", offset: 0 },
                        { transform: "scale(1)", offset: 0.23, easing: ease },
                        { transform: "scale(1.14)", offset: 0.39 },
                        { transform: "scale(1.14)", offset: 0.7, easing: ease },
                        { transform: "scale(1)", offset: 0.86 },
                        { transform: "scale(1)", offset: 1 },
                    ],
                    { duration: 10500, fill: "both" },
                ),
            );
        }
        const hold = () => {
            for (const effect of effects) {
                effect.pause();
                effect.currentTime = video.currentTime * 1000;
            }
        };
        const sync = () => {
            hold();
            if (
                !video.paused &&
                !video.ended &&
                !video.seeking &&
                video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
            ) {
                for (const effect of effects) {
                    effect.playbackRate = video.playbackRate;
                    effect.play();
                }
            }
        };
        sync();
        const syncEvents = ["playing", "seeked", "ratechange"];
        const holdEvents = ["pause", "waiting", "seeking", "ended"];
        syncEvents.forEach(event => video.addEventListener(event, sync));
        holdEvents.forEach(event => video.addEventListener(event, hold));
        return () => {
            syncEvents.forEach(event => video.removeEventListener(event, sync));
            holdEvents.forEach(event => video.removeEventListener(event, hold));
            effects.forEach(effect => effect.cancel());
        };
    }, [base, scene.file, reduced]);

    function chooseChapter(index: number) {
        if (index === selected && player.current) player.current.currentTime = 0;
        setSelected(index);
    }

    return (
        <div className={styles.viewer} ref={viewer}>
            <div className={styles.viewerBar}>
                <div className={styles.viewerTitle}>
                    <Logo />
                    Testplane UI
                </div>
                <div
                    className={styles.scenePicker}
                    style={{ "--chapter": selected } as React.CSSProperties}
                    role="group"
                    aria-label={translate({
                        id: "landing.studio.recordings",
                        message: "HTML Reporter recordings",
                    })}
                >
                    {scenes.map(({ file, icon: Icon, name }, index) => (
                        <button
                            key={file}
                            type="button"
                            aria-pressed={selected === index}
                            onClick={() => chooseChapter(index)}
                        >
                            <Icon />
                            {name}
                        </button>
                    ))}
                </div>
                <span className={styles.reportProject}>
                    <PlanetEarth />
                    Orbital Atlas
                </span>
            </div>
            <div className={styles.screen}>
                <div ref={stage} className={styles.recordingStage}>
                    <video
                        key={base}
                        ref={player}
                        src={base + ".mp4"}
                        poster={base + ".webp"}
                        aria-label={scene.caption}
                        width="1192"
                        height="570"
                        muted
                        playsInline
                        preload="none"
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        onEnded={() => {
                            setPlaying(false);
                            if (reduced) setIntent("pause");
                            else if (enabled) setSelected((selected + 1) % scenes.length);
                        }}
                    />
                    <svg className={styles.clickOverlay} viewBox="0 0 1192 570" aria-hidden="true">
                        <g transform={`translate(${scene.click.x} ${scene.click.y})`}>
                            <g ref={spark} className={styles.clickSpark}>
                                <circle
                                    r="7"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.3"
                                    opacity=".7"
                                />
                                {[12, 67, 130, 194, 251, 310].map((angle, i) => (
                                    <path
                                        key={angle}
                                        transform={`rotate(${angle})`}
                                        d={i % 2 ? "M12 0h3" : "M12 0h6"}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                ))}
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
            <div className={styles.transport}>
                <button
                    type="button"
                    aria-label={
                        playing
                            ? translate({ id: "landing.studio.pause", message: "Pause recording" })
                            : translate({ id: "landing.studio.play", message: "Play recording" })
                    }
                    onClick={() => setIntent(playing ? "pause" : "play")}
                >
                    {playing ? <PauseFill /> : <PlayFill />}
                </button>
                <span>{scene.caption}</span>
            </div>
        </div>
    );
}
