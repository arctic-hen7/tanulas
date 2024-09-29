// This is our config file for Fresh, the framework we're using to develop our app. You can put more things
// in here if you need them.

import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";

export default defineConfig({
  // Someone else has written code that makes Tailwind and Fresh work nicely together. With this, we can have
  // our tailwind.config.ts file and a static/styles.css file, and everything *just works*.
  plugins: [tailwind()],
});
