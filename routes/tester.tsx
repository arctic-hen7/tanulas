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
