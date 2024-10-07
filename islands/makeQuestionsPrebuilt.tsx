// This island is the pre-built version of what we'll create in the workshop. Looking in here is
// cheating!! (But if you missed something, go ahead ;)

import { computed, signal } from "@preact/signals";
import { Pair, QuestionsResponse } from "../routes/types.ts";
import { SERVER_TOKEN, SERVER_URL } from "../routes/config.ts";
import TrackedTextarea from "../components/trackedTextarea.tsx";
import Questions from "../components/questions.tsx";

// This is the "island" (interactive component) we're exporting, which is imported by our main page and
// displayed directly. You can think of this as the code for the main page, because everything is
// interactive. See `routes/index.tsx` for an explanation of interactivity and islands.
export default function MakeQuestions() {
    // A "signal" is a value that can change. If we have a signal `x`, we can get its value in `x.value`,
    // and set it like `x.value = 5`. The special thing is that, if we have something in our island
    // that depends on the value of `x`, that thing will automatically be updated when we change it.
    // This might seem intuitive, and it's supposed to be, but there's actually a lot of code that
    // goes into this! This is pretty much the point of React/Preact.

    // We want to display different things depending on the state of the page, so let's keep track
    // of it, starting as `NONE`
    const state = signal(State.NONE);
    // If we have questions or an error, we'd like to keep track of those too
    const error = signal("");
    const questions = signal<Pair[]>([]);
    // And finally, we should keep track of the notes the user enters
    const notes = signal("");

    // This is called a "computed value": it watches all the signals we use in it and, whenever one of
    // them updates, it will update itself. It's essentially a signal derived from others.
    const displayState = computed(() => {
        if (state.value === State.QUESTIONS) {
            // To keep things clean, we've defined a separate component that will display the questions,
            // and we can plug our signal into it here.
            return <Questions questions={questions.value} />;
        } else if (state.value === State.ERROR) {
            // When the state is `ERROR`, get the value of the `error` signal to display the error message
            return <p class="text-red-500">{error}</p>;
        } else if (state.value === State.LOADING) {
            // We're waiting on the server.
            return <p class="text-neutral-700 italic">Loading...</p>;
        } else {
            // Nothing has happened yet, just let the user know what this is for.
            return (
                <p class="text-neutral-700 italic">
                    Revision questions will appear here.
                </p>
            );
        }
    });

    // This is a miniature function we can call when the user presses the button to send their notes
    // to the server. This should call `getQuestions()` and update the state accordingly.
    const handleClick = async () => {
        // We don't want to waste sending nothing to the server, so do a pre-flight check that we
        // actually have some contents.
        if (notes.value === "") {
            error.value = "No notes provided!";
            state.value = State.ERROR;
        } else {
            // Before we send our data to the server, tell the user that something is actually
            // happening.
            state.value = State.LOADING;

            // `getQuestions` is asynchronous, meaning it doesn't return a value right away. But this
            // mini-function is also asynchronous, so we can use `await` to stop until it gets back
            // to us.
            const res = await getQuestions(notes.value);
            // `res` is an object, either of questions or an error. We can check if it has a property
            // `error` to know which one it is.
            if ("error" in res) {
                state.value = State.ERROR;
                error.value = res.error;
            } else {
                state.value = State.QUESTIONS;
                questions.value = res.pairs;
            }
        }
    };

    // This defines a basic layout: we have a parent section that's the height of the whole screen, and
    // it uses the "flexbox" layout, in a column direction, which is CSS-speak for making the children
    // appear one after the other vertically in a way that lets us centre them as we like.
    //
    // Inside that, we have two vertical elements: the header and the main section. The header positions
    // elements in the same way, but uses `items-center` to centre its children along its *secondary axis*
    // (with `flex-col`, this centres them horizontally, but with `flex-row`, they'd be centred vertically!).
    // Inside there, we've got a level 1 heading, paragraph, and button.
    //
    // As for the main section, that will take up as much vertical height as it can, and it will position
    // its elements one after the other *horizontally*, allowing us to put the textarea next to the section
    // where the questions will be displayed.
    //
    // The `TrackedTextarea` is a *component* (little bit of code we can reuse) that will keep track of
    // what the user types into it and put it in the signal `notes`, which we can use to get the value
    // when we press the button. It's also made to take up as much height and width as it can. Because
    // there are two elements (the textarea and the div) with `w-full`, they even out and both take up 50%
    // of the total width --- so we position them on each half of the page! The div has `{displayState}`
    // inside it, which means it will dynamically display the contents of `displayState`, which, as above,
    // update with the state.
    return (
        <div class="h-screen flex flex-col">
            <div class="flex flex-col items-center">
                <h1 class="text-4xl">Tanulas</h1>
                <p class="py-1">
                    Press the button to make some revision questions!
                </p>
                <button
                    class="bg-green-500 p-2 rounded-md text-white hover:bg-white hover:text-green-500 border-transparent border hover:border-green-500 transition-colors"
                    onClick={handleClick}
                >
                    Make questions
                </button>
            </div>
            <div class="h-full flex flex-row py-4">
                <TrackedTextarea
                    class="h-full w-full border border-green-500 mx-4 p-2 text-lg rounded-md"
                    placeholder="Add your notes here."
                    value={notes}
                />
                <div class="h-full w-full border border-black mx-4 p-2 text-lg rounded-md">
                    {displayState}
                </div>
            </div>
        </div>
    );
}

// Our page can be in four states:
//  - `NONE`: nothing has happened yet, the page has just loaded
//  - `LOADING`: the user has put in some notes and pressed the button, we're waiting for the server
//  - `ERROR`: something went wrong
//  - `QUESTIONS`: we got questions back, success!
enum State {
    NONE,
    LOADING,
    ERROR,
    QUESTIONS,
}

// This is a helper function that we can call to get the questions from the server! It doesn't return
// a value to us immediately, so it's "asynchronous", which means it returns a "promise" that it will
// get back to us with some data in the future (i.e. once the server responds). Inside that promise,
// there will be either a `QuestionsResponse` (see `routes/types.ts`) or an error.
async function getQuestions(notes: string): Promise<
    QuestionsResponse | {
        error: string;
    }
> {
    // We'll send an object to the server containing the notes
    const data = { notes };
    // Fetching data from the server could fail (e.g. no internet connection), so we'll "try" to do it,
    // and "catch" any errors if it fails.
    try {
        // This constructs a request to the server using the details from `routes/config.ts`.
        const response = await fetch(`${SERVER_URL}/questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SERVER_TOKEN}`,
            },
            // This converts the object with the notes into something we can send to the server.
            body: JSON.stringify(data),
        });

        // If we didn't get a success message, then we have an error
        if (!response.ok) {
            return { error: await response.text() };
        }

        // If we didn't *not* get a success message, then everything worked and we can parse the
        // server's response into a `QuestionsResponse`! This could still fail, in which case we'll
        // go to the `catch`.
        return await response.json();
    } catch (error) {
        // Something went wrong.
        return { error: error.toString() };
    }
}
