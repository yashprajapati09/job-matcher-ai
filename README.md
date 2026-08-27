# Job Matcher AI

You must build a working proof-of-concept.

* Frontend (Lovable / Vibe Coding): Create a web interface where the user (Sarah) can upload a Job Description (JD) and a Resume, and see the Al's analysis. It doesn't need to be production-perfect, but the core flow must be clickable.

Backend (n8n Agent): Build an agent workflow that: 
i. Accepts the text/file/PDFs inputs and make readable.

ii. Uses an LLM to analyze the resume against the JD

iii. Outputs a structured score (0-100), a summary, and a "Recommended Action" (e.g., Interview, Reject).

iv. Bonus: Simulate a calendar integration or email draft generation.

Integration: Ideally, connect your Frontend to your Backend. If technical blockers arise, run them

independently but document exactly how the API handshake would work.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f8eea141-a47b-4fad-8b02-33ea9cc2b9d6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
