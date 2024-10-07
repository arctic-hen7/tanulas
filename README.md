# Tanulas

This is a boilerplate repository for learning and teaching the basics of web development. It's all written with [Deno](https://deno.com) and [Fresh](https://fresh.deno.dev), using [Tailwind](https://tailwindcss.com) for styling. The app itself takes in notes and generates revision questions using AI.

## Usage

It's recommended to run this in GitHub Codespaces, but, after the initial workshop, you can download the code with `git clone https://github.com/arctic-hen7/tanulas` and use the following command to run everything:

```
OPENAI_API_KEY=your-key deno task start
```

Make sure to replace `your-key` with an API key from an [OpenAI account](https://openai.com) you've created (you will need to pay once you've used up your free tokens). This will start your app at <http://localhost:8000>! Note that you'll need to get a token from your own server first to make things work: you can do that with this command:

```
bash token.sh --local
```

This is the same as we used in the workshop to get a key for the public server (which means you don't have to have an OpenAI account to participate), but `--local` will talk to your local server. Note that you have to run this while the previous command is running, so you'll need two terminals open!

For the password, you'll want to change `WORKSHOP_PASSWORD` to some strong password in `.env`, and you can also set the `JWT_SECRET` (check out the backend code to see how this is used). Make sure not to commit your changes to this file though, because then you'll be publishing your passwords to the world!

From here, you can put your token into `routes/config.ts` just like in the workshop, and everything should work for three hours, and then the token will expire. If you want your tokens to last longer, or you want to use some other authentication mechanism, check out the backend.

Happy hacking!

## License

See [`LICENSE`](./LICENSE).
