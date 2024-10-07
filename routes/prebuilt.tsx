// Same as the index page we're building, just at `/prebuilt` instead.
import MakeQuestions from "../islands/makeQuestionsPrebuilt.tsx";

export default function Prebuilt() {
    // Here, we just return the contents of the island, it does everything for us.
    return <MakeQuestions />;
}
