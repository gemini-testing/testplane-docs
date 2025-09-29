import { CircleLetterC } from "@gravity-ui/icons";
import React from "react";

export default function FooterCopyright(): JSX.Element {
    return (
        <div className="flex items-center gap-2 text-neutral-500">
            <CircleLetterC />
            <span>{new Date().getFullYear()}</span>
            <div className="h-0.5 w-0.5 rounded-full bg-neutral-500" />
            <span>Testplane is MIT licensed</span>
            <div className="h-0.5 w-0.5 rounded-full bg-neutral-500" />
        </div>
    );
}
