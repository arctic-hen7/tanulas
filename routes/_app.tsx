// This is a shell that every page in our app will be wrapped in.

import { type PageProps } from "$fresh/server.ts";

// Don't worry about how `Component` ends up here, it's something Fresh does under the hood.
export default function App({ Component }: PageProps) {
    // The `Component` in here is whatever we're rendering.
    return (
        <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Tanulas</title>
                <link rel="stylesheet" href="/styles.css" />
            </head>
            <body>
                <Component />
            </body>
        </html>
    );
}
