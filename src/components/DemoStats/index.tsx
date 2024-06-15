interface DemoStatsProps {
    value: string;
    description: string;
}

export function DemoStats(props: DemoStatsProps) {
    return (
        <div className="flex flex-col text-center text-white">
            <div className="text-2xl font-bold">{props.value}</div>
            <div className="text-lg leading-tight">{props.description}</div>
        </div>
    );
}
