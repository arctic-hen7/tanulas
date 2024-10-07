// This file creates a new page at `/index`, which is also aliased as `/`, i.e. the home page of our
// site! Because we're building an *interactive* interface (i.e. one with inputs, buttons, etc.), we
// can't code it all in here --- Fresh requires the interactive parts of our site to be written as
// *components* in `islands/`, which is why we import an island here.

// To see the pre-made version of this and compare it to what you have, replace this with
// `../islands/makeQuestionsPrebuilt.tsx`.
import MakeQuestions from "../islands/makeQuestions.tsx";

export default function Home() {
    // Here, we just return the contents of the island, it does everything for us.
    return <MakeQuestions />;
}
