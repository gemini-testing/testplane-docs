import clsx from "clsx";
import GradientUnderlineSvg from "@site/static/img/landing/underline.svg";

interface GradientUnderlineProps {
    children?: React.ReactNode;
    className?: string;
}

export function GradientUnderline(props: GradientUnderlineProps) {
    return (
        <span className={clsx("relative")}>
            {props.children}
            <GradientUnderlineSvg
                className={clsx(
                    "absolute -bottom-1 left-1/2 w-full -translate-x-1/2 stroke-[5]",
                    props.className,
                )}
            />
        </span>
    );
}
