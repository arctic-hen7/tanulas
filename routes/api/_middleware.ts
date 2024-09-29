// This is to prevent a nightmare known as CORS...if we get time in the workshop we'll cover it, otherwise
// you can do some research of your own or come and see the demonstrator afterward. In short, this makes
// the server actually be able to receive requests from a browser.
//
// Because this code is in a file called _middleware.ts, it will be automatically applied to all requests
// that come into the server.

import { FreshContext } from "$fresh/server.ts";

export async function handler(req: Request, ctx: FreshContext) {
    let resp;
    if (req.method == "OPTIONS") {
        resp = new Response(null, {
            status: 204,
        });
    } else {
        resp = await ctx.next();
    }
    const origin = req.headers.get("Origin") || "*";
    const headers = resp.headers;

    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
    );
    headers.set(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS, GET, PUT, DELETE",
    );

    return resp;
}
