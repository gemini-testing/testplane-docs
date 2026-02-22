import React from "react";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import { translate } from "@docusaurus/Translate";
import { EllipsisVertical } from "@gravity-ui/icons";

export default function MobileSidebarToggle(): JSX.Element {
    const { toggle, shown } = useNavbarMobileSidebar();
    return (
        <button
            onClick={toggle}
            aria-label={translate({
                id: "theme.docs.sidebar.toggleSidebarButtonAriaLabel",
                message: "Toggle navigation bar",
                description: "The ARIA label for hamburger menu button of mobile navigation",
            })}
            aria-expanded={shown}
            className="navbar__toggle clean-btn absolute right-0 z-999 flex h-8 w-8 items-center justify-center lg:hidden"
            type="button"
        >
            <EllipsisVertical />
        </button>
    );
}
