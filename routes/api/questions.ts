// This is the code for the server endpoint that gives us questions in response to notes. We construct a
// request to the OpenAI API, forcing the model to generate questions in a certain format, and then we parse
// that and return them to the user. Requests to this endpoint must have a valid JWT (see token.ts).
//
// You should read token.ts before this!

import { FreshContext } from "$fresh/server.ts";
import OpenAI from "npm:openai";
import { verifyToken } from "./token.ts";
import { QuestionsResponse } from "../types.ts";

// This is a guiding message we give to the AI so it knows what we want, and we read it from the file
// `system_message.txt`.
const SYSTEM_MESSAGE = await Deno.readTextFile(
    "routes/api/system_message.txt",
);
// Maximum length in characters that we'll allow from users. You can set this as high as you like for your
// own use.
const MAX_NOTES_LENGTH = 2500;

// We're going to use a library from OpenAI to make requests to an AI. This requires setting up a client first,
// which we do here. We could do this inside our `handler`, but we can also share it across all requests by
// doing it out here, which is a little bit faster (we don't have to make a new one every time there's a
// request). We'll only create a client if we have an API key.
let client = null;
if (Deno.env.get("OPENAI_API_KEY")) {
    client = new OpenAI();
}

// This is our handler (see token.ts for an explanation of what this does).
export const handler = async (
    req: Request,
    _ctx: FreshContext,
): Promise<Response> => {
    // First, verify that the request had a valid token (we expect an email address from this function).
    const email = await verifyToken(req);
    if (!email) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Parse the request body as JSON, using `QuestionsBody` as an interface (see below).
    const body: QuestionsBody = await req.json();
    // Make sure the notes aren't too long (the `length` property is defined for all strings in JavaScript).
    if (body.notes.length > MAX_NOTES_LENGTH) {
        return new Response("Notes too long", { status: 400 });
    }
    // Log to the console the request so we can see what people are asking for (good for making sure no-one
    // is abusing the workshop environment)!
    console.log(`${email}: ${body.notes}`);

    // If there was no API key given in the environment variables, we won't have a client, so we can't make
    // requests to the OpenAI API. We'll return a 500 "internal server error" response.
    if (!client) {
        return new Response("No OpenAI API key", { status: 500 });
    }

    // This uses the OpenAI library, we'll go through it step-by-step.
    const chatCompletion = await client.chat.completions.create({
        // The *messages* are what the AI has already seen, and it wll produce a response to these. You could
        // use this to give many messages, like examples of what you want, but we'll just give it that "system
        // prompt" from earlier, and a single message with the user's notes.
        messages: [{ role: "system", content: SYSTEM_MESSAGE }, {
            role: "user",
            content: body.notes,
        }],
        // This is the model we'll use. You can use `gpt-4o` if you like, but it's more expensive.
        model: "gpt-4o-mini",
        // We want to constrain the model to only return JSON that matches what we expect (prevents rambling).
        // This is a "JSON schema", an accepted way of describing what JSON should look like. It takes a bit of
        // getting used to, but this will accept objects like this:
        //
        // {
        //        pairs: [
        //            { question: "What is the capital of France?", answer: "Paris" },
        //            { question: "What is the capital of Germany?", answer: "Sydney", unsure: true },
        //        ]
        // }
        //
        // Notice the second one. We told the model to always go with what the user's notes say, but, if it thinks
        // they're wrong, to add an `unsure: true` property. That property isn't required though.
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "questions",
                schema: {
                    type: "object",
                    properties: {
                        pairs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    answer: { type: "string" },
                                    unsure: { type: "boolean" },
                                },
                                required: ["question", "answer"],
                                additionalProperties: false,
                            },
                        },
                    },
                    strict: true,
                },
            },
        },
    });
    // We get a bunch of stuff back from the API that we don't need, we just want the message itself
    const message = chatCompletion.choices[0].message;
    // If the user asked how to make a bomb, we won't have given them an answer! The model will tell us by filling
    // out the `refusal` property. We'll return a 500 "internal server error" response.
    if (message.refusal) {
        return new Response(
            `Model refused to generate questions: ${message.refusal}`,
            { status: 500 },
        );
    } else {
        // If there wasn't a refusal, we can parse the message contents we get back from the model as a
        // `QuestionsResponse` (see types.ts). The `as string` here is a type assertion, telling TypeScript that,
        // even though OpenAI have said that field could be a string, or it could be `null`, it's definitely a string.
        // We know this because the refusal field was empty.
        const response: QuestionsResponse = JSON.parse(
            message.content as string,
        );
        // Finally, we return the response to the user. This is a success response, so we send a 200 status code.
        // We add a header saying we're returning JSON, so the client knows how to interpret the response.
        return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
        });
    }
};

// We only expect a single property in the request body, the notes the user wants to generate questions from.
interface QuestionsBody {
    notes: string;
}
