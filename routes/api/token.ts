// Authentication code for the server lives here. We generate "JWTs" (JSON Web Tokens) for any user who
// provides a valid email address and the shared secret. Here, the secret is the workshop password, and
// in the workshop, you made a request to this with your email address to get a "token" which you plugged
// into your frontend. This code is responsible for generating those tokens, and it exports a `verifyToken`
// function used in `questions.ts` to verify the token and get the email address back out of it so we
// can record who asks what.
//
// For your own personal use, you shouldn't need to change anything in here, but you might want to make this
// code take a shared secret from `USER_SECRET` instead of `WORKSHOP_PASSWORD`.

import { FreshContext } from "$fresh/server.ts";
import {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v3.0.2/mod.ts";

// Here, we're getting the values of some *environment variables*, which are values sent to our program by
// whoever executed it. In the terminal, we could run `JWT_SECRET=test deno task dev` to send `test` as the
// JWT secret. When you serve this on Deno Deploy, you can set these values in the settings for your
// depoyment.
//
// The `USER_SECRET` value is used to make sure not just anyone can create a token and use our API. Only people
// who know the secret can. For personal use, this would be just you. For a workshop, it'll be displayed on
// the screen.
const USER_SECRET = Deno.env.get("WORKSHOP_PASSWORD")!;
// The `JWT_SECRET` value is a *random string* that we use to *sign* those JWTs. We use tokens to make sure
// only people we've issued them to can access our API. But what prevents someone from creating their own tokens?
// This. This secret value is used to sign tokens in such a way that, mathematically, we can check if a token
// was signed using this, but we can't extract it *from* a token. (Kind of like how you know if a key fits a lock,
// but you can't easily make a key, given a lock.)
const JWT_SECRET = Deno.env.get("JWT_SECRET")!;

// This is a bit of magic we use to get that string we provided for the JWT secret into a usable form. Check
// out the documentation for the web crypto API if you're interested.
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(JWT_SECRET),
  { name: "HMAC", hash: { name: "SHA-512" } },
  false,
  ["sign", "verify"],
);

// This is our main handler, which is a function that will take in information about requests to this API.
// The `_ctx` parameter would let us render a webpage in response, but we prefix it with an underscore because
// we won't need it in this endpoint.
export const handler = async (
  req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  // Start by reading the body of the request the user sent, which should be a valid JSON object. Parse that
  // so it matches the `TokenBody` interface (see below).
  const body: TokenBody = await req.json();
  // Make sure the user gave the secret we expected. If they didn't, tell them they're unauthorized.
  if (body.secret !== USER_SECRET) {
    // Status codes are a standard way for web servers to communicate with clients. 404 means "not found", 200
    // means "success", and 401 means "unauthorized". Sending this helps clients know what happened.
    return new Response("Unauthorized", { status: 401 });
  }
  // Make sure the user also gave us an email, otherwise return a 400 "invalid request" error.
  if (!body.email) {
    return new Response("Email required", { status: 400 });
  }

  // If we got past those conditionals, we've got all the info we need! Call this `create` function from the
  // `djwt` library imported at the top of this file. Someone else has written all the code needed to handle
  // JWTs for us, and we just tell it which algorithm to use (there are different ways to do that whole lock
  // and key thing), and we'll tell it we want a JWT. Inside, we'll put the user's email and an expiry date
  // so the token isn't valid forever. We can later read these properties when the user gives us back this
  // token, and we can be sure they haven't been changed because we've signed with the key!
  const token = await create({ alg: "HS512", typ: "JWT" }, {
    email: body.email,
    // This is given in seconds, so this means three hours.
    exp: getNumericDate(60 * 60 * 3),
  }, key);

  // Finally, we return the token to the user. This is a success response, so we send a 200 status code.
  return new Response(token, { status: 200 });
};

// This is an interface, which is a way to describe the shape of an object in TypeScript. Here, we make sure
// the user's request has an email and a secret, and we'll use this to make sure the user's request is valid.
// Note that above we did check if the email was present, which also checks if it's an empty string. An `interface`
// will allow those, so we have to do some extra checking.
interface TokenBody {
  email: string;
  secret: string;
}

// This is a function *exported* by this file that the rest of our app can use. Other handlers (like in
// question.ts) can use this to verify that a request is valid. This takes in a request object and checks if the
// user provided a valid token. If they did, it returns the email address that was in the token. If they didn't,
// it returns `null`.
export const verifyToken = async (req: Request): Promise<string | null> => {
  // It's standard practice to put tokens like these in an `Authorization` header with the value
  // `Bearer my-token`.
  const auth = req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return null;
  }
  // The word `Bearer` and a space is seven charatcers, we're getting the token after that.
  const token = auth.slice(7);

  // The `verify` function from `djwt` will *throw* an error if it fails, and we want to *try* and see if it
  // doesn't, but if it does, *catch* the error and return `null` (because verification failed).
  try {
    const payload: { email: string } = await verify(token, key);
    return payload.email;
  } catch {
    return null;
  }
};
