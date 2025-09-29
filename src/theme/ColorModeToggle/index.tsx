import React from "react";
import clsx from "clsx";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { translate } from "@docusaurus/Translate";
import type { Props } from "@theme/ColorModeToggle";
import { Display, Moon, Sun } from "@gravity-ui/icons";

import styles from "./styles.module.css";

type ModeSetting = "light" | "dark" | "system";

const STORAGE_KEY = "color-mode-setting";
const SYSTEM_QUERY = "(prefers-color-scheme: dark)";
const modeOrder: ModeSetting[] = ["light", "dark", "system"];

const iconByMode: Record<
    ModeSetting,
    React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
    light: Sun,
    dark: Moon,
    system: Display,
};

const modeLabel: Record<ModeSetting, string> = {
    light: translate({
        message: "light mode",
        id: "theme.colorToggle.ariaLabel.mode.light",
        description: "The name for the light color mode",
    }),
    dark: translate({
        message: "dark mode",
        id: "theme.colorToggle.ariaLabel.mode.dark",
        description: "The name for the dark color mode",
    }),
    system: translate({
        message: "system mode",
        id: "theme.colorToggle.ariaLabel.mode.system",
        description: "The name for the system color mode",
    }),
};

const getNextMode = (mode: ModeSetting): ModeSetting => {
    const currentIndex = modeOrder.indexOf(mode);
    return modeOrder[(currentIndex + 1) % modeOrder.length];
};

function ColorModeToggle({ className, buttonClassName, onChange }: Props): JSX.Element {
    const isBrowser = useIsBrowser();
    const [modeSetting, setModeSetting] = React.useState<ModeSetting>("system");
    const [hasHydrated, setHasHydrated] = React.useState(false);

    React.useEffect(() => {
        if (!isBrowser) {
            return;
        }

        let stored: string | null = null;

        try {
            stored = window.localStorage.getItem(STORAGE_KEY);
        } catch (_error) {
            stored = null;
        }

        if (stored === "light" || stored === "dark" || stored === "system") {
            setModeSetting(stored);
        }

        setHasHydrated(true);
    }, [isBrowser]);

    React.useEffect(() => {
        if (!isBrowser || !hasHydrated) {
            return;
        }

        document.documentElement.setAttribute("data-color-mode", modeSetting);

        try {
            window.localStorage.setItem(STORAGE_KEY, modeSetting);
        } catch (_error) {
            // noop: storage can be unavailable (e.g. in private mode)
        }
    }, [modeSetting, isBrowser, hasHydrated]);

    React.useEffect(() => {
        if (!isBrowser || !hasHydrated) {
            return undefined;
        }

        if (modeSetting === "system") {
            const mediaQuery = window.matchMedia(SYSTEM_QUERY);
            const applySystemTheme = () => {
                onChange(mediaQuery.matches ? "dark" : "light");
            };

            applySystemTheme();

            if (typeof mediaQuery.addEventListener === "function") {
                mediaQuery.addEventListener("change", applySystemTheme);
                return () => mediaQuery.removeEventListener("change", applySystemTheme);
            }

            mediaQuery.addListener(applySystemTheme);
            return () => mediaQuery.removeListener(applySystemTheme);
        }

        onChange(modeSetting);
        return undefined;
    }, [modeSetting, onChange, isBrowser, hasHydrated]);

    const title = translate(
        {
            message: "Switch color mode (currently {mode})",
            id: "theme.colorToggle.ariaLabel",
            description: "The ARIA label for the navbar color mode toggle",
        },
        { mode: modeLabel[modeSetting] },
    );

    const Icon = iconByMode[modeSetting];

    return (
        <div className={clsx(styles.toggle, className)}>
            <button
                className={clsx(
                    "clean-btn",
                    styles.toggleButton,
                    !isBrowser && styles.toggleButtonDisabled,
                    buttonClassName,
                )}
                type="button"
                onClick={() => {
                    if (!isBrowser) {
                        return;
                    }

                    const nextMode = getNextMode(modeSetting);
                    setModeSetting(nextMode);
                }}
                disabled={!isBrowser}
                title={title}
                aria-label={title}
                aria-live="polite"
            >
                <Icon className={styles.toggleIcon} aria-hidden={true} />
            </button>
        </div>
    );
}

export default React.memo(ColorModeToggle);
