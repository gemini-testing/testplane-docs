import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from "react";

import { ProductCard } from "@site/src/components/FeaturesDemo/WebBrowser/AppPage/ProductCard";
import HeartIcon from "@site/static/icons/heart.svg";
import CartIcon from "@site/static/icons/cart.svg";
import ProfileIcon from "@site/static/icons/profile.svg";
import TwitterIcon from "@site/static/icons/twitter.svg";
import FacebookIcon from "@site/static/icons/facebook.svg";
import InstagramIcon from "@site/static/icons/instagram.svg";

interface Product {
    title: string;
    price: number;
    photoSrc: string;
}

export interface AppPageProps {
    cartCount: number;
    products: Product[];
    searchText: string;
}

export interface AppPageApi {
    getSearchInputOffsetTop: () => number;
}

export const AppPage = forwardRef(function AppPageInternal(
    props: AppPageProps,
    ref: ForwardedRef<AppPageApi>,
) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        getSearchInputOffsetTop: (): number => {
            return inputRef.current?.offsetTop ?? 0;
        },
    }));

    return (
        <div className="w-full min-w-0 bg-white">
            <div className="sticky top-0 z-20 flex w-full flex-nowrap justify-between bg-white bg-opacity-35 p-1 align-middle backdrop-blur">
                <div className="flex items-baseline">
                    <span className="whitespace-nowrap pl-1 text-lg font-medium italic">
                        Awesome store.
                    </span>
                    <span className="ml-3 hidden sm:block">Home</span>
                    <span className="ml-3 hidden sm:block">Store</span>
                    <span className="ml-3 hidden sm:block">Sale</span>
                </div>
                <div className="flex items-center">
                    <HeartIcon className="@sm:block hidden size-4" />
                    <ProfileIcon className="@sm:block ml-2 hidden size-4" />
                    <div className="ml-2 flex items-center whitespace-nowrap">
                        <CartIcon className="mr-2 size-4" /> Your cart
                        <span className="ml-1 font-medium">({props.cartCount})</span>
                    </div>
                </div>
            </div>
            <div className="relative -mt-10 overflow-hidden bg-[#a0b9ff] px-4 pt-10">
                <div className="flex w-full flex-col items-center justify-center py-14">
                    <span className="text-center text-2xl font-medium italic">
                        Awesome
                        <br />
                        Bookstore Web App.
                    </span>
                    <div className="mt-1 flex">
                        <div className="z-10 rounded-full bg-black px-4 py-1 text-sm font-medium text-white">
                            Details
                        </div>
                        <div className="z-10 ml-2 rounded-full bg-white px-4 py-1 text-sm font-medium">
                            Shop now
                        </div>
                    </div>
                </div>
                <div className="-z-100 absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-9xl font-bold italic text-white opacity-30">
                    STYLE STYLE STYLE
                </div>
            </div>
            <div className="p-3">
                <input
                    ref={inputRef}
                    placeholder="Search"
                    data-role-id="search-input"
                    className="w-full rounded-full border border-gray-300 px-3 py-0.5 focus:outline-blue-300"
                    value={props.searchText}
                    readOnly={true}
                />
            </div>
            <div className="columns-2 px-3 pb-3 sm:columns-3">
                {props.products
                    .filter(product =>
                        product.title.toLowerCase().includes(props.searchText?.toLowerCase() ?? ""),
                    )
                    .map((product, index) => (
                        <ProductCard
                            key={index}
                            price={product.price}
                            title={product.title}
                            photoSrc={product.photoSrc}
                            className="mb-4"
                        />
                    ))}
            </div>
            <div className="relative flex h-96 justify-between bg-gray-500 p-6 bg-blend-hard-light">
                <div className="text-2xl font-medium italic text-white">Bookstore app.</div>
                <div className="mt-2 flex">
                    <div>
                        <TwitterIcon className="size-4" />
                    </div>
                    <div>
                        <FacebookIcon className="ml-3 size-4" />
                    </div>
                    <div>
                        <InstagramIcon className="ml-3 size-4" />
                    </div>
                </div>
            </div>

            {/* Element below is used to force Tailwind to include classes at build time that are applied later at runtime */}
            <div className="hidden outline outline-2 outline-indigo-300"></div>
        </div>
    );
});
