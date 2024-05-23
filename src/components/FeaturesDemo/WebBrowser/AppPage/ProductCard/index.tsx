import clsx from "clsx";

import AddToCartIcon from "@site/static/icons/add-to-cart.svg";
import styles from "./styles.module.scss";

interface ProductCardProps {
    className?: string;
    price: number;
    title: string;
    photoSrc: string;
}

export function ProductCard(props: ProductCardProps) {
    return (
        <div className={clsx(props.className, "product-card break-inside-avoid")}>
            <div className="relative w-full overflow-hidden rounded-xl after:block after:pb-[80%] after:content-['']">
                <div
                    className={clsx(
                        "absolute h-full w-full bg-cover bg-center saturate-[40%] sepia-[30%]",
                    )}
                    style={{ backgroundImage: `url(${props.photoSrc})` }}
                ></div>
            </div>
            <div className="mt-2 flex items-center justify-between">
                <div className="shrink basis-full overflow-hidden">
                    <div className="overflow-hidden overflow-ellipsis whitespace-nowrap pr-6 text-sm capitalize text-gray-500">
                        {props.title}
                    </div>
                    <div className="mt-1 text-lg font-bold">${props.price}</div>
                </div>
                <button
                    data-role-id="add-to-cart"
                    className={clsx("rounded-full border p-2", styles["purchase-button"])}
                >
                    <AddToCartIcon className="size-5" />
                </button>
            </div>
        </div>
    );
}
