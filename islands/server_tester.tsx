import { computed, signal } from "@preact/signals";
import { SERVER_TOKEN, SERVER_URL } from "../routes/config.ts";
import { QuestionsResponse } from "../routes/types.ts";

export default function ServerTester() {
    const state = signal<State>(State.NONE);
    const message = signal("");
    const displayState = computed(() => {
        if (state.value === State.ERROR) {
            return <p class="text-lg text-red-500">Error: {message}</p>;
        } else if (state.value === State.SUCCESS) {
            return <p class="text-lg text-emerald-500">{message}</p>;
        } else if (state.value === State.LOADING) {
            return <p class="text-lg text-blue-400">Loading...</p>;
        } else {
            return <></>;
        }
    });

    const handleClick = async () => {
        state.value = State.LOADING;
        const res = await testRequest();
        if ("error" in res) {
            message.value = res.error;
            state.value = State.ERROR;
        } else if (res.pairs.length === 2) {
            message.value = "Success!";
            state.value = State.SUCCESS;
        } else {
            message.value =
                "Got incorrect number of questions, please try again.";
            state.value = State.ERROR;
        }
    };

    return (
        <div class="flex flex-col items-center">
            <button
                class="rounded-md my-2 p-2 px-4 border border-black hover:text-white hover:bg-black transition-colors"
                onClick={handleClick}
            >
                Test
            </button>
            {displayState}
        </div>
    );
}

async function testRequest(): Promise<
    QuestionsResponse | {
        error: string;
        status?: number;
    }
> {
    // Make a test request to the server
    const data = {
        notes: "- WW2 started in 1939 and finished in 1945",
    };
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
        return { error };
    }
}

enum State {
    NONE,
    LOADING,
    ERROR,
    SUCCESS,
}
