// This is a simple component that tracks the value of a multi-line input (called a "textarea")
// in a signal, allowing its value to be easily grabbed and changed if needed.

import { Signal } from "@preact/signals";

// These are the properties the component accepts.
interface Props {
    // We can write `<TrackedTextarea value={mySignal} />` and that will parse `mySignal`
    // through here!
    value: Signal<string>;
    // Other properties we can pass through.
    class?: string;
    placeholder?: string;
}

export default function TrackedTextarea(props: Props) {
    return (
        <textarea
            value={props.value}
            onInput={(ev) => {
                // When the user changes anything, update the value of the signal. We use `.trim()`
                // to get rid of any leading or trailing whitespace (e.g. ` hello ` -> `hello`).
                props.value.value = ev.currentTarget.value.trim();
            }}
            class={props.class}
            placeholder={props.placeholder}
        >
        </textarea>
    );
}
