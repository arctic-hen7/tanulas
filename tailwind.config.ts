// This is a config file for Tailwind, our styling library. You could put custom colours etc. in here if
// you like.

import { type Config } from "tailwindcss";

export default {
  // This just tells Tailwind where all our code is.
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
} satisfies Config;
