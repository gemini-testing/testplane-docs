import { ReactNode } from "react";
import clsx from "clsx";
import TickIcon from "@site/static/icons/tick-bold.svg";

export enum FeatureBlockLayout {
    PictureOnTheLeft,
    PictureOnTheRight,
}

interface FeatureBlockProps {
    heading: ReactNode;
    description: string;
    items: string[];
    layout: FeatureBlockLayout;
    imgSrc: string;
    className?: string;
}

export function FeatureBlock(props: FeatureBlockProps) {
    return (
        <div
            className={clsx(
                "flex justify-between",
                { "flex-row-reverse": props.layout === FeatureBlockLayout.PictureOnTheLeft },
                props.className,
            )}
        >
            <div className="flex flex-grow basis-1/2 flex-col justify-center overflow-hidden">
                <div className="text-xl font-bold text-gray-700 sm:text-2xl">{props.heading}</div>
                <img className="sm:hidden" src={props.imgSrc} alt="Feature Image" />
                <div className="mt-4 text-lg font-medium text-gray-500">{props.description}</div>
                <div className="mt-4 columns-2">
                    {props.items.map((item, index) => (
                        <div
                            key={index}
                            className="mb-3 flex max-w-48 text-lg font-medium text-gray-500"
                        >
                            <TickIcon className="mr-1 mt-1 size-5 flex-shrink-0 fill-gray-500" />
                            {item}
                        </div>
                    ))}
                </div>
            </div>
            <img
                className="hidden basis-1/2 overflow-hidden sm:block"
                src={props.imgSrc}
                alt="Feature Image"
            />
        </div>
    );
}
