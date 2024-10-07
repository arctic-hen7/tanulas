// This file defines a component for displaying questions. Take a look at `components/trackedTextarea.tsx`
// to understand components better.

import { Pair } from "../routes/types.ts";

// These are the arguments we can take.
interface Props {
    questions: Pair[];
}

export default function Questions(props: Props) {
    // `ol` is an ordered list, and `li` is a list item. `span` is for some arbitrary text, like `p`,
    // except `p` implicitly adds a line break at the end, while `span` doesn't! Here, we use `flex flex-col`
    // to place the spans one after the other vertically. On the answer span, we use a shorthand conditional,
    // saying that, if the variable `unsure` is `true`, then the color should be red, otherwise it should
    // be grey, and, regardless, that should be added to the string ` ml-4`, which adds a left margin
    // to indent the answer a bit.
    return (
        <ol>
            {props.questions.map((
                { question, answer, unsure },
                idx,
            ) => (
                <li class="flex flex-col">
                    <span>{idx + 1}. {question}</span>
                    <span
                        class={unsure
                            ? "text-red-400"
                            : "text-neutral-800" + " ml-4"}
                    >
                        {answer}
                    </span>
                </li>
            ))}
        </ol>
    );
}
