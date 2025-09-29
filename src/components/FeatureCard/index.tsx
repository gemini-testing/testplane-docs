import { ReactNode } from "react";

export interface FeatureCardProps {
    icon: ReactNode;
    heading: string;
    items: string[];
    className?: string;
}

export function FeatureCard(props: FeatureCardProps) {
    return (
        <div className="grid break-inside-avoid grid-flow-row grid-cols-[48px_auto] grid-rows-[auto_1fr]">
            <div className="flex items-center justify-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-indigo-200">
                    <div className="flex size-6 h-min flex-shrink-0 items-center justify-center fill-indigo-600">
                        {props.icon}
                    </div>
                </div>
            </div>
            <div className="ml-3 flex items-center fill-indigo-600 text-xl font-medium text-gray-700">
                {props.heading}
            </div>
            <div className="flex items-center justify-center pt-3">
                <div className="h-full w-0.5 bg-gradient-to-b from-indigo-600 to-transparent"></div>
            </div>
            <div className="ml-3 pt-1 pb-5">
                {props.items.map(item => (
                    <div className="mt-4 text-lg leading-6 text-gray-500" key={item}>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
