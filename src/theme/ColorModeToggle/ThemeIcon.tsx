import type { SVGProps } from "react";

export const ThemeIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg
        className={className}
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M8 1.5c3.58 0 6.5 2.92 6.5 6.5s-2.92 6.5-6.5 6.5S1.5 11.58 1.5 8 4.42 1.5 8 1.5M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8S12.42 0 8 0Z"
            fill="currentColor"
        />
        <line x1="8" y1="1.04" x2="8" y2="15.33" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" />
        <line x1="8.01" y1="6.18" x2="11.9" y2="2.29" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" />
        <line x1="14.28" y1="4.11" x2="8" y2="10.39" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" />
        <line x1="15.28" y1="7.13" x2="8.01" y2="14.39" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" />
    </svg>
);
