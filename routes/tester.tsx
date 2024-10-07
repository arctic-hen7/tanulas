// This file creates a new page at `/tester`, which can be used to make sure the connection to
// the server is working properly. While very useful when running a workshop with multiple people,
// you probably won't need this, so you can safely delete both this file and `islands/serverTester.tsx`.

import ServerTester from "../islands/serverTester.tsx";

export default function Tester() {
    return (
        <div class="flex flex-col justify-center items-center h-screen">
            <p class="text-lg mb-2">
                Press the below button to ensure your access to the server is
                working as expected.
            </p>
            <ServerTester />
        </div>
    );
}
