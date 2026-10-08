# CodeQuest curriculum: noob → pro in 3–9 months

**Pace:** 20–30 minutes a day. The 9-month plan is the comfortable pace. If you do 45–60 minutes a day, you can compress it to about 4 months.
**The rule:** AI can *explain* a concept after you've tried. It never writes your challenge code.

## The 9-month plan

| Month | Focus | Realms | You can… | Build (no AI writing code) |
| --- | --- | --- | --- | --- |
| 1 | Think like the computer | Variable Village, Engine Room, Terminal Temple | write small JS functions from a blank file; explain the call stack and references | CLI quiz game in Node |
| 2 | Types & the event loop | Engine Room, Type Fortress | read and fix TS compile errors; predict async output | convert it to strict TypeScript |
| 3 | React for real | Component Kingdom, Bug Bounty Bay | build a React + TS app from `npm create vite`; debug with DevTools | habit tracker (React + TS) |
| 4 | Python, SQL, Alembic | Serpent Swamp, Data Dungeon, Migration Mines | write JOINs and GROUP BYs from memory; explain and run Alembic upgrade/downgrade | FastAPI + SQLAlchemy API with 3 migrations |
| 5 | DSA I | Algorithm Arena | state the Big-O of your own code; solve easy problems in 20 min | 1 easy problem/day |
| 6 | Servers & security | Algorithm Arena, Server Citadel, Security Stronghold | explain the request lifecycle; build an authenticated API | connect the React app to your API, with login |
| 7 | Shipping | Container Docks, Architect's Tower | Dockerize the app; run CI on every push | capstone part 1: docker compose + GitHub Actions |
| 8 | System design & AWS | Architect's Tower, Cloud Archipelago | whiteboard a URL shortener or news feed; deploy to AWS | capstone part 2: deploy to AWS |
| 9 | AI engineering | The AI Lab | build RAG and an agent loop; measure them with evals | capstone part 3: an AI study buddy with RAG over your notes |

## What's built (61 lessons, 49 runnable challenges, 10 animated visuals)

Every concept card opens with a 🧸 "stupid simple" analogy. Lessons marked 👀 include an animated step-through.

- **Variable Village (JS):** values & variables · control flow (FizzBuzz) · map/filter/reduce · 👀 objects & references · 🐉 closures
- **Engine Room (CS):** compilers / interpreters / JIT · 👀 the call stack & recursion · stack vs heap & GC · 👀 the event loop · 🐉 binary, bytes & floating point
- **Terminal Temple (Git):** what a commit really is, rebase vs merge, leaked secrets
- **Type Fortress (TS):** the compiler · interfaces · discriminated unions · generics · 🐉 the Result type
- **Component Kingdom (React):** JSX → createElement · 👀 state & re-rendering · props & lifting state · effects · 🐉 todo app with controlled inputs
- **Bug Bounty Bay:** debugging method + a three-bug hunt
- **Serpent Swamp (Python):** Python for JS devs · comprehensions · classes & dunder methods · 🐉 log parser
- **Data Dungeon (SQL):** SELECT · GROUP BY · 👀 JOINs · indexes & B-trees · 🐉 leaderboard query + the N+1 problem
- **Migration Mines (Alembic):** why migrations exist · 👀 anatomy of a revision · hand-writing the SQL a migration runs · 🐉 build Alembic's upgrade/downgrade planner
- **Algorithm Arena (DSA):** Big-O with speed tests · 👀 hash maps (Two Sum) · stacks (balanced brackets) · 👀 binary search · trees & recursion · 🐉 BFS maze
- **Server Citadel:** 👀 what happens when you type a URL · build a router · middleware `compose()` · 🐉 auth + token-bucket rate limiter
- **Security Stronghold:** SQL injection (exploit it, then understand the fix) · XSS · IDOR
- **Container Docks:** Docker layers · CI/CD · where migrations run in a deploy
- **Architect's Tower:** scaling · caching (build an LRU) · replicas, sharding & CAP · queues & idempotency · 🐉 design a URL shortener (base62)
- **Cloud Archipelago (AWS):** the core services map · IAM (build a policy evaluator) · Lambda handlers · 🐉 3-tier architecture on AWS
- **The AI Lab:** how LLMs work · embeddings & cosine similarity · 👀 RAG from scratch (chunking + prompts) · tool use & the agent loop · 🐉 TF-IDF search engine

## Extras I added that you didn't list (and why)

| Addition | Why it matters for you |
| --- | --- |
| **Git & the terminal** | Every job uses it daily. Knowing what a commit *is* makes merges and rebases stop being scary. |
| **Debugging as a skill** | It's the biggest junior → mid jump, and exactly the muscle that relying on AI never builds. |
| **Testing** (Vitest, pytest, Playwright) | Confidence to change code; required on every serious team. |
| **Web security** | SQL injection, XSS, broken access control. Interviewers ask about it, and attackers exploit it. |
| **Docker & CI/CD** | "Works on my machine" → works everywhere. Ties Alembic, tests and AWS together. |
| **Linux / bash basics** | Servers run Linux; you'll SSH into things and read logs. |
| **Networking fundamentals** | DNS, TCP, HTTP, TLS. Half of "the site is down" bugs live here. |
| **Spaced repetition** | Without review, you forget about 70% within a week. Built into the app. |
| **"Explain it back" journal** | If you can't explain it simply, you don't understand it yet (Feynman). |
| **Monthly no-AI projects** | Lessons teach; projects make it stick. This is where you prove it to yourself. |
| **AI as a tutor, not a crutch** | Ask Claude "why", "what's a hint", or "review my code". Don't ask it "write it". |

## Roadmap: lessons still to build

These show as 🔒 "coming soon" nodes on each realm's path:

- **JS:** destructuring/spread · promises & async/await · try/catch · ES modules · DOM & events · fetch · classes & `this`
- **CS:** how the internet works · processes vs threads · Unicode/UTF-8 · how Git stores data · OS basics · build a tokenizer
- **Git:** branching & PRs · merge conflicts · interactive rebase · bash essentials · SSH
- **TS:** utility types · typing async & APIs · zod · tsconfig · type guards · keyof/mapped types
- **React:** custom hooks · data fetching / React Query · context · useReducer · memo & performance · React Router · Testing Library · Next.js & server components
- **Debugging/testing:** DevTools debugger · pdb · Vitest & pytest · mocking · Playwright e2e · TDD kata
- **Python:** venv/pip/uv · type hints & mypy · exceptions & context managers · decorators · generators · FastAPI · pytest · SQLAlchemy
- **SQL:** INSERT/UPDATE/DELETE · transactions & ACID · CTEs · window functions · normalization · Postgres specifics · ORMs
- **Alembic:** autogenerate limits · data migrations · branches & merge heads · zero-downtime (expand/contract) · migrations in CI/CD · Prisma/Drizzle equivalents
- **DSA:** linked lists · merge & quick sort · heaps · DFS · dynamic programming · two pointers / sliding window · tries · interview patterns
- **Servers:** Express API · FastAPI API · CORS · caching headers · WebSockets · REST vs GraphQL vs tRPC · OAuth · Linux for backend devs
- **Security:** password hashing · CSRF · CORS ≠ security · secrets management · dependency audits · threat modeling
- **DevOps:** Dockerfile for FastAPI · docker compose stack · GitHub Actions · 12-factor config · blue/green & canary · Kubernetes basics
- **System design:** consistent hashing · CDNs · design a news feed · design a chat app · monolith vs microservices · observability · estimation drills
- **AWS:** VPC networking · S3 deep dive · DynamoDB single-table design · CDK · Terraform · CloudWatch · cost control · Cloud Practitioner → SAA prep
- **AI:** prompt engineering · structured outputs · streaming UI · real RAG with pgvector · evals · build an MCP server · fine-tuning vs RAG · prompt injection & guardrails · using AI as a learning partner

## Ideas for future game features

- Weekly **boss raids** that mix topics ("fix this slow, insecure endpoint")
- **Code review mode**: find the bugs in someone else's PR
- **Speed runs**: re-solve old challenges against your own best time
- A **skill tree** visualization of prerequisites
- An optional **AI tutor** that only gives Socratic hints, never answers
