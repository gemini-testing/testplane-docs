import React, { useEffect, useState } from "react";

interface ResizableSvgReturnType {
    scale: number;
}

export function useResizableSvg(
    boundingBoxRef: React.RefObject<HTMLDivElement>,
    svgRef: React.RefObject<SVGSVGElement>,
): ResizableSvgReturnType {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const boundingBox = boundingBoxRef.current;
        const planetSvg = svgRef.current;
        if (!boundingBox || !planetSvg) {
            return;
        }

        const newScale = boundingBox.clientWidth / planetSvg.clientWidth;
        setScale(newScale);

        const observer = new ResizeObserver(() => {
            const newScale = boundingBox.clientWidth / planetSvg.clientWidth;
            setScale(newScale);
        });

        observer.observe(boundingBox);

        return () => {
            observer.disconnect();
        };
    }, []);

    return { scale };
}
