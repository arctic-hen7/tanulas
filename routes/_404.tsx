// This is the page that would be rendered if the user navigated to a page that doesn't exist.

import { Head } from "$fresh/runtime.ts";

export default function Error404() {
    return (
        <>
            <Head>
                <title>404 - Page not found</title>
            </Head>
            <div class="px-4 py-8 mx-auto bg-[#86efac]">
                <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
                    <img
                        class="my-6"
                        // This is from the `static/` directory, and it gets automatically served at this path!
                        src="/logo.svg"
                        width="128"
                        height="128"
                        alt="the Fresh logo: a sliced lemon dripping with juice"
                    />
                    <h1 class="text-4xl font-bold">404 - Page not found</h1>
                    <p class="my-4">
                        The page you were looking for doesn't exist.
                    </p>
                    <a href="/" class="underline">Go back home</a>
                </div>
            </div>
        </>
    );
}
