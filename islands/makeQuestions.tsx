import { computed, signal } from "@preact/signals";
import { Pair, QuestionsResponse } from "../routes/types.ts";
import { SERVER_TOKEN, SERVER_URL } from "../routes/config.ts";

export default function MakeQuestions() {
    const state = signal(State.NONE);
    const notes = signal("");
    const error = signal("");
    const questions = signal<Pair[]>([]);

    const displayState = computed(() => {
        if (state.value === State.QUESTIONS) {
            return (
                <ol>
                    {questions.value.map(({ question, answer, unsure }) => (
                        <li>
                            <span>{question}</span>
                            <span class={unsure ? "text-red-400" : ""}>
                                {answer}
                            </span>
                        </li>
                    ))}
                </ol>
            );
        } else if (state.value === State.ERROR) {
            return <p class="text-red-500">{error.value}</p>;
        } else {
            return (
                <p class="italic text-neutral-700">
                    Revision questions will appear here.
                </p>
            );
        }
    });

    const handleClick = async () => {
        const notesStr = notes.value;
        if (notesStr === "") {
            state.value = State.ERROR;
            error.value = "No notes provided!";
        } else {
            state.value = State.LOADING;

            const res = await getQuestions(notesStr);
            if ("error" in res) {
                state.value = State.ERROR;
                error.value = res.error;
            } else {
                state.value = State.QUESTIONS;
                questions.value = res.pairs;
            }
        }
    };

    return (
        <div class="h-screen flex flex-col">
            <div class="flex flex-col items-center pt-4">
                <h1 class="text-4xl">Tanulas</h1>
                <p class="py-1">
                    Press the button to make some revision questions!
                </p>
                <button
                    class="inline-flex bg-green-500 p-2 rounded-md text-white hover:bg-white hover:text-green-500 border-transparent border hover:border-green-500 transition-colors"
                    onClick={handleClick}
                >
                    <span>Make questions</span>
                </button>
            </div>
            <div class="h-full flex">
                <textarea
                    class="h-full w-full border border-green-500 m-4 p-2 text-lg rounded-md"
                    value={notes}
                    onInput={(ev) => {
                        notes.value = ev.currentTarget.value;
                    }}
                    placeholder="Add your notes here."
                >
                </textarea>
                <div class="h-full w-full border border-black m-4 p-2 text-lg rounded-md">
                    {displayState}
                </div>
            </div>
        </div>
    );
}

async function getQuestions(notes: string): Promise<
    QuestionsResponse | {
        error: string;
        status?: number;
    }
> {
    // Make a test request to the server
    const data = { notes };
    try {
        const response = await fetch(`${SERVER_URL}/questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SERVER_TOKEN}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return { error: await response.text(), status: response.status };
        }

        return await response.json();
    } catch (error) {
        return { error: error.toString() };
    }
}

enum State {
    NONE,
    LOADING,
    ERROR,
    QUESTIONS,
}
