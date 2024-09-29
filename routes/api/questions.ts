// This is the code for the server endpoint that gives us questions in response to notes. We construct a
// request to the OpenAI API, forcing the model to generate questions in a certain format, and then we parse
// that and return them to the user. Requests to this endpoint must have a valid JWT (see token.ts).
//
// You should read token.ts before this!

import { FreshContext } from "$fresh/server.ts";
import OpenAI from "npm:openai";
import { verifyToken } from "./token.ts";
import { QuestionsResponse } from "../types.ts";

// This is a guiding message we give to the AI so it knows what we want.
const SYSTEM_MESSAGE =
    `You are a helpful AI assistant who will be given a series of notes from the user, and you should produce a series of question/answer pairs for them to create flashcards from to revise for the topic of the notes. Each
    question should be short and to the point, and each answer should be a concise, *correct* response. Do *not*
    ask questions that are beyond the scope of the notes provided, and do not go beyond the scope of the notes
    in your answers. If your knowledge conflicts with what the notes say is correct, go with the notes over
    your own knowledge, but note that you believe the answer to be incorrect by setting the "unsure" property
    to true.

    For all of this, produce a JSON array of objects, each with a "question" and "answer" property (and "unsure"
    if necessary).`;
// Maximum length in characters that we'll allow from users. You can set this as high as you like for your
// own use.
const MAX_NOTES_LENGTH = 1000;

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
