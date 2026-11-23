import { one, two, defineSet } from "./shared.js";

export const timo = defineSet({
  id: "timo",
  title: `Timo Labs free exam`,
  source: {
    label: `Timo Labs`,
    url: `https://www.timolabs.dev/mock-exams/ccdv-f`,
  },
  questions: [
  one("T1", 1, `Your team changed the system prompt and one tool schema of a Claude application that issues customer refunds. The new version passed every development test, and the product owner wants to switch all production traffic to it today. A faulty change would send wrong refunds to real customers.
What is the best next step for this release?`, [
    `Switch all traffic to the new version today, since it passed every one of the development tests.`,
    `Switch all traffic, then watch token usage and API error rates on a daily dashboard.`,
    `Edit the live prompt in place so that any problem can be fixed without a new deployment.`,
    `Send a small share of traffic to the new version, check its refunds, and keep rollback ready.`,
  ], [3], `A change that can send wrong refunds should reach production gradually, with monitoring of refund results and a ready way back, rather than all at once.
Why A is incorrect. Development tests cannot show every kind of real customer request or integration problem, so a full switch exposes every refund to an untested failure.
Why B is incorrect. Token usage and error rates do not show whether refunds are correct, and every customer is already exposed by the time a problem appears.
Why C is incorrect. Editing the live prompt leaves no fixed version to compare against or roll back to, so a bad refund cannot be traced to the prompt that caused it.
Why D is correct. A small monitored release limits how many refunds a faulty change can affect and gives evidence for either promoting the version or rolling it back.`),

  one("T2", 5, `A bank runs two Claude agents at the same time, each helping an analyst investigate a different customer. Both agents need the same long set of investigation instructions. A developer proposes running both investigations in one shared conversation so the instructions are written only once.
Which design keeps each customer's data out of the other investigation while still reusing the instructions?`, [
    `Use one shared conversation and tell each agent in the system prompt to ignore the other customer.`,
    `Run each investigation in its own conversation with the same instructions in its system prompt.`,
    `Keep separate conversations but sync both histories after each tool call so analysts can compare.`,
    `Keep separate conversations and give both agents one shared scratchpad for the facts they find.`,
  ], [1], `Reusing instructions and isolating customer data are compatible: the instructions are shared, and each customer's data stays in a separate conversation.
Why A is incorrect. Once both customers' data sit in one conversation, each agent can already see the other customer's details; a prompt instruction cannot undo that exposure.
Why B is correct. The shared instructions can be reused in both system prompts, while each customer's data stays in its own conversation.
Why C is incorrect. Syncing the histories copies each customer's data into the other investigation after every tool call, which is the exposure the bank must avoid.
Why D is incorrect. A shared scratchpad of customer facts puts both customers' data in front of both agents, so it creates the same exposure as a shared conversation.`),

  two("T3", 0, `An onboarding agent opens customer accounts. It pauses while the customer uploads identity documents, and when the task resumes, a different worker process may pick it up. In one incident, a worker created the account, then timed out before recording that the step was done, so the next worker ran the step again.
Which TWO changes let any worker resume the task safely? Choose two.`, [
    `Save the outstanding document requests and approval status in a shared database that every worker reads.`,
    `Keep the task's progress in the first worker's memory and route the resumed task back to that worker.`,
    `Record each completed account action with its idempotency key and reuse that key whenever a step is retried.`,
    `Restart the task from the beginning on the new worker and give each account action a fresh operation ID.`,
  ], [0, 2], `Safe resumption needs two things: progress stored where every worker can read it, and a way to recognize an account action that already ran even though its completion was never recorded.
Why A is correct. A shared store lets whichever worker resumes the task see which documents and approvals are still outstanding.
Why B is incorrect. The first worker may be the one that timed out, so its memory can be lost, and a task tied to it cannot resume elsewhere.
Why C is correct. A recorded outcome and a reused idempotency key let the account system recognize the repeated step and return the earlier result instead of creating a second account.
Why D is incorrect. A fresh operation ID makes the repeated account step look new, so the account system cannot detect the duplicate and may open a second account.`),

  one("T4", 4, `A team uses Claude to label customer feedback as positive, negative or mixed. When they send the same borderline comment several times, Claude sometimes returns different but reasonable labels. The manager believes identical prompts should always produce identical results and asks the developer to explain.
What should the developer tell the manager?`, [
    `The different labels point to a network retry fault, so duplicate responses should be filtered out.`,
    `Claude's output is probabilistic, so the team should test repeated runs to measure consistency.`,
    `The first label Claude returns is its main answer, so the application should keep only the first one.`,
    `Setting temperature to 0 guarantees the same label every time, so no further testing is needed.`,
  ], [1], `Claude's output is not fully deterministic, so label reliability has to be measured with repeated, representative tests and managed with clear task rules.
Why A is incorrect. The requests succeed; the labels differ because generation is probabilistic, and filtering duplicates does not tell the team how reliable the labels are.
Why B is correct. Running representative comments many times shows how stable the labels are and where the team needs clearer rules or review.
Why C is incorrect. Nothing makes the first response more correct than later ones; its position in time is not evidence of accuracy.
Why D is incorrect. Temperature 0 does not guarantee identical output: Anthropic notes that results are not fully deterministic even at 0.0, and newer models accept only the default temperature, so consistency must still be measured.`),

  one("T5", 6, `A reporting tool serves many customer companies. Today it places one administrator API token in the system prompt, and Claude includes that token in tool calls to fetch each customer's data.
Which credential design should replace this?`, [
    `The host issues short-lived credentials scoped to each customer and adds them when it runs tools.`,
    `The host keeps the administrator token in a secret store and adds it when it runs any tool.`,
    `The system prompt holds a separate long-lived token per customer, and Claude picks the right one.`,
    `The token is encrypted in the system prompt, and the tool code decrypts it before each call.`,
  ], [0], `Credentials should be handled by the host, never placed in model context, and scoped to the customer and the minimum access each action needs.
Why A is correct. The host adds the credential outside the model's context, and a short-lived, per-customer scope limits what any single call or leaked credential can reach.
Why B is incorrect. Moving the token out of the prompt helps, but every tool call still carries administrator access to all customers, so one customer's request could reach another's data.
Why C is incorrect. The tokens are still visible in the model's context, and relying on Claude to pick the right one does not enforce which customer a call can reach.
Why D is incorrect. The encrypted token still sits in model-visible text, and the call still runs with administrator access to every customer's data.`),

  one("T6", 7, `A team is building an MCP server for HR. It must offer the company policy handbook, which clients browse section by section, and a payroll calculator that takes an employee's salary and hours and returns take-home pay.
How should the server expose these two capabilities?`, [
    `Expose both as prompts, since each of them returns text that Claude reads and uses.`,
    `Expose both as resources, since clients read the results that each one of them returns.`,
    `Expose the handbook as a tool that returns sections on request, and the calculator as a resource.`,
    `Expose the handbook sections as resources and the calculator as a tool with typed inputs.`,
  ], [3], `Choose MCP primitives by what the capability is: resources for data to read, and tools for operations that take inputs and do work.
Why A is incorrect. MCP prompts are reusable message templates; they are not the right primitive for reference data or for running a calculation.
Why B is incorrect. Resources are for reading data by URI; they do not define the calculator's inputs or the fact that it runs a computation.
Why C is incorrect. This reverses the primitives: handbook sections are data to read, while the calculator is an operation that takes inputs and runs.
Why D is correct. Handbook sections are addressable reference data, which fits resources, and the calculator takes parameters and runs, which fits a tool.`),

  two("T7", 2, `A CI pipeline needs to run Claude Code with no interactive terminal, collect output that a script can parse, and prevent any file changes the team has not approved.
Which TWO setup choices meet these needs? Choose two.`, [
    `Run Claude Code in non-interactive mode with the \`-p\` flag instead of an interactive session.`,
    `Pass an explicit list of allowed tools and request JSON with \`--output-format json\`.`,
    `Skip permission prompts with \`--dangerously-skip-permissions\`, since CI runners are discarded.`,
    `Start an interactive session and drive it with a script that types prompts and answers.`,
  ], [0, 1], `A reliable CI job needs a non-interactive mode plus enforced tool permissions and machine-readable output.
Why A is correct. Non-interactive mode with \`-p\` is built for automation such as CI jobs.
Why B is correct. In a \`-p\` run, tool calls that would need approval are denied unless the allowed-tools list covers them, and JSON output gives the pipeline something reliable to parse.
Why C is incorrect. A discarded runner can still push changes to the repository or other systems, so skipping permissions breaks the approval requirement.
Why D is incorrect. Scripted keystrokes are fragile, hide failures, and do not produce output a script can reliably parse.`),

  two("T8", 3, `A tool trace shows that the tool returned the correct customer record, yet the phone number written to the database is not in that record. Retrying reproduces the same wrong value.
Which TWO debugging steps best show where the wrong number comes from? Choose two.`, [
    `Keep the failing trace and inspect each step that transforms the data before the write.`,
    `Retry many more times and compare the outputs to see whether the wrong value changes.`,
    `Add assertions that check the tool result and the final write payload separately.`,
    `Swap in a different model and check whether the wrong value still appears.`,
  ], [0, 2], `Finding the origin needs evidence at each boundary, from the tool result through Claude's output to the database write.
Why A is correct. The trace shows each transformation, so the team can find the first point where the wrong number appears.
Why B is incorrect. The failure already reproduces reliably; more retries add noise without separating model output from application code.
Why C is correct. Separate checks show whether Claude introduced the number or the application changed it between the tool result and the write.
Why D is incorrect. Changing the model before locating the fault removes the reliable reproduction the team needs.`),

  one("T9", 1, `A Python web service built on an async framework handles each request in an \`async\` handler but calls Claude through the SDK's synchronous client. Under load, even requests that do not use Claude stall while Claude is responding.
What is the right fix?`, [
    `Switch to the SDK's async client, or run the synchronous call in a bounded worker pool.`,
    `Shorten the system prompt so Claude responds faster and each call holds the handler for less time.`,
    `Raise the server's request timeout so stalled requests wait longer instead of failing.`,
    `Wrap the synchronous call in a try/except block and retry it when a timeout occurs.`,
  ], [0], `The stalls come from blocking network calls inside an asynchronous server, so the fix is to make the call non-blocking or move it off the event loop.
Why A is correct. The synchronous call blocks the event loop; the async client or a bounded worker pool lets other requests keep running while Claude responds.
Why B is incorrect. A shorter prompt may cut response time a little, but each call still blocks the event loop, so unrelated requests keep stalling.
Why C is incorrect. A longer timeout leaves the event loop blocked for even longer and does not let other requests run.
Why D is incorrect. Catching exceptions and retrying does not change the fact that the call blocks the event loop while it waits.`),

  one("T10", 5, `An accounts-payable system asks Claude to extract invoice data as JSON and creates accounting records from the results automatically. One response matches the invoice schema exactly, but its tax amount does not fit the tax rate for the region given in the request.
What should happen before a record is created?`, [
    `Code checks the tax amount and other business rules against the request and rejects failures.`,
    `The record is created, because the response passed JSON schema validation without any errors.`,
    `The response is sent back to Claude in the same conversation to confirm its own tax calculation.`,
    `The record is created and flagged so that finance can correct any tax errors at month-end close.`,
  ], [0], `JSON that matches the schema still needs business-rule checks before it drives an accounting record, because correct structure does not mean correct values.
Why A is correct. A deterministic check of the tax against the region's rate catches a response that has the right shape but the wrong numbers, before it reaches the ledger.
Why B is incorrect. Schema validation only confirms the structure of the JSON; it cannot tell whether the tax amount is correct for the region.
Why C is incorrect. Asking the same conversation to check its own work is not independent, and it can repeat the same mistake.
Why D is incorrect. Correcting at month-end lets a known-wrong entry sit in the accounts when it could have been rejected before it was written.`),

  one("T11", 0, `A warehouse uses Claude for two jobs. Most requests are routine stock checks that always run the same database query. A few are stock discrepancies, where Claude must compare barcode scans, delivery notes and camera summaries, and the steps differ from case to case.
Which design gives each job only as much freedom as it needs?`, [
    `Send every request, including routine stock checks, to one agent that plans its own steps.`,
    `Handle stock checks with a fixed workflow and send discrepancies to an agent that plans its steps.`,
    `Handle both jobs with one fixed workflow that runs every comparison step on every request.`,
    `Use one agent for both jobs and let it write to the inventory system to correct stock counts.`,
  ], [1], `Match the orchestration to the uncertainty of each job: a fixed workflow for the predictable path and an agent for the cases whose steps cannot be known in advance.
Why A is incorrect. Routine stock checks always follow the same query, so letting an agent plan them adds cost and unpredictability with no benefit.
Why B is correct. The fixed workflow keeps common stock checks predictable, and the agent is used only for discrepancies, where the steps genuinely vary.
Why C is incorrect. Discrepancies need different steps from case to case, which one fixed sequence cannot handle, and running every comparison on routine checks wastes work.
Why D is incorrect. One agent for everything gives routine checks needless freedom, and direct write access adds risk that neither job requires.`),

  one("T12", 4, `A dashboard shows a long Claude analysis to the user while it is being written. After the response finishes, the backend must save one complete copy of it to the conversation history.
How should the application receive and store the response?`, [
    `Stream the response and save each text delta to the history as its own assistant message.`,
    `Open a WebSocket to the API, because the Messages API cannot stream over plain HTTP.`,
    `Send a non-streaming request with a progress spinner, then show and save the full response.`,
    `Stream the response over server-sent events, show each delta, and save the final message.`,
  ], [3], `Streaming serves the live display, while the history should store one complete message only after the stream has finished.
Why A is incorrect. Deltas are fragments of one response, so saving each as its own message breaks the conversation history into many partial turns.
Why B is incorrect. The Messages API streams over HTTP using server-sent events, so a WebSocket is not needed.
Why C is incorrect. A non-streaming request cannot show the analysis while it is being written, which the dashboard requires.
Why D is correct. Server-sent events let the dashboard show text as it arrives, and saving the accumulated final message keeps one complete record.`),

  one("T13", 6, `A Claude Code \`PreToolUse\` hook checks shell commands. When a command touches the \`secrets/\` directory, the hook prints "blocked" and exits with code 0. Traces show the command still runs.
What change and test would make this a working guardrail?`, [
    `Have the hook write its warning to a log file, then check the log after a test run.`,
    `Move the check to a \`PostToolUse\` hook and test that it reports the command.`,
    `Add a system prompt rule not to touch \`secrets/\`, then test it with sample commands.`,
    `Return a blocking result, such as exit code 2, and test that the files are untouched.`,
  ], [3], `A hook guardrail works only if its result actually blocks the call, and only a test that checks for the side effect proves it does.
Why A is incorrect. The hook still exits with code 0, so the command still runs; the log only records that it was not stopped.
Why B is incorrect. A \`PostToolUse\` hook runs after the command, so the secrets have already been accessed when it fires.
Why C is incorrect. A prompt rule depends on the model's compliance, and the hook still allows the command to run.
Why D is correct. Exit code 2 tells Claude Code to block the tool call, and a test that checks the secrets directory proves the command never ran.`),

  one("T14", 7, `Your application defines a \`check_stock\` tool that your own code implements. Claude returns a response with \`stop_reason\` set to \`tool_use\` and a \`tool_use\` block asking for a stock lookup.
What should your application do next?`, [
    `Wait for Claude's next message, since Claude has already queried the inventory service on its own.`,
    `Validate the input, run the lookup, and return a \`tool_result\` with the matching \`tool_use_id\`.`,
    `Run the lookup and send the result to Claude as plain text at the start of a new conversation.`,
    `Run the lookup and add its result to the system prompt of the next request sent to Claude.`,
  ], [1], `Tool use is a protocol: Claude requests the call, and the host validates it, runs it and returns a correlated \`tool_result\`.
Why A is incorrect. Claude only requests a client tool; your code must run it, so no result arrives unless your application supplies it.
Why B is correct. Client tools run in your code, and the \`tool_result\` block with the matching \`tool_use_id\` continues the same tool exchange.
Why C is incorrect. A new conversation loses the request that asked for the lookup, so Claude cannot connect the result to its tool call.
Why D is incorrect. The result belongs in a \`tool_result\` block in the conversation; moving it into the system prompt breaks the link between the request and its result.`),

  one("T15", 2, `A repository has six short conventions that should apply in every Claude Code session. It also has a 20-page database migration procedure that the team uses twice a year.
How should the team set these up?`, [
    `Put the six conventions in CLAUDE.md and package the migration procedure as a Skill.`,
    `Put both in CLAUDE.md so Claude always has the migration procedure available.`,
    `Put both in each developer's personal user settings so everyone has a copy.`,
    `Put the conventions in a subagent's system prompt and link the procedure from it.`,
  ], [0], `Keep always-on guidance short in CLAUDE.md, and package long, occasional procedures so they load only when needed.
Why A is correct. CLAUDE.md keeps the short conventions in every session, and the Skill loads the long procedure only when a migration is under way.
Why B is incorrect. CLAUDE.md is loaded in every session, so a 20-page procedure used twice a year would take up context almost all the time for no benefit.
Why C is incorrect. Personal settings are not shared or reviewed through the repository, so copies drift and new contributors do not get them.
Why D is incorrect. A subagent's prompt applies only when that subagent runs, so the conventions would not reach every session.`),

  two("T16", 1, `Two teams work on a shared service that extracts order details with Claude. One team changes the JSON schema of the service's response; the other changes how the service retries failed calls. Each branch passes its own tests, but the merged code fails.
Which TWO practices would most directly prevent this kind of failure? Choose two.`, [
    `Let each team keep its own copy of the response schema in its branch until the release.`,
    `Add contract tests that check the shared response format that both teams depend on.`,
    `Run each branch's own test suite twice before merging to catch any intermittent failures.`,
    `Require both teams to review any change to the shared interface before it is merged.`,
  ], [1, 3], `The failure happens at an interface both teams share, so the fixes are an executable check of that interface and review of changes to it by both teams.
Why A is incorrect. Separate schema copies are what allowed the two branches to drift apart and fail together after the merge.
Why B is correct. Contract tests check the shared response format directly, so a change that breaks the other team's assumptions fails before the merge.
Why C is incorrect. Each branch already passes its own tests; running them again does not test how the two changes interact.
Why D is correct. Cross-team review makes one team's interface change visible to the other before it is accepted.`),

  one("T17", 5, `An agent reviewing a long legal case is close to its context limit, mostly because of raw results from searches it has already finished. The final report still needs three source document IDs, and a partner's approval is still pending.
When the conversation is compacted, what must the summary keep?`, [
    `The three source document IDs, the decisions made so far, and the pending approval.`,
    `The full search results, so the report can quote them, with the decisions left out.`,
    `Only the latest user message, since the earlier turns can be rebuilt if they are needed.`,
    `A short account of the searches and the decisions made, leaving out any open items.`,
  ], [0], `Compaction should drop bulk the agent no longer needs while keeping the evidence it still depends on and any unfinished steps such as pending approvals.
Why A is correct. These are the facts and open state the agent needs to finish the report and to wait for the partner's approval.
Why B is incorrect. The raw search results are what filled the context; keeping them defeats the compaction, and dropping the decisions loses the case state.
Why C is incorrect. The latest message alone loses the source IDs, the decisions and the pending approval that the report depends on.
Why D is incorrect. Leaving out the pending approval can lead the agent to finish the report without the partner's sign-off.`),

  one("T18", 0, `A payroll team always follows the same four steps: check the employee record, fetch approved hours, calculate deductions, and submit the payment. Any exception must stop for a person to review before submission.
Which design gives the clearest control over this fixed sequence?`, [
    `A coded workflow that runs the four steps in order and routes exceptions to human review.`,
    `An agent that is given the four steps as tools and decides which one to call next.`,
    `Four specialized agents, one per step, that each update the same payroll record when ready.`,
    `One prompt that lists every payroll policy and asks Claude to complete the whole process.`,
  ], [0], `The steps are known and the human review is mandatory, so a deterministic workflow with an explicit exception branch is the right foundation.
Why A is correct. The workflow enforces the known order in code and sends exceptions to a person before anything is submitted.
Why B is incorrect. Letting an agent choose the next step adds variation to a process whose order is already fixed.
Why C is incorrect. Agents that update one record whenever they are ready can conflict and do not guarantee the required order.
Why D is incorrect. A prompt can describe the rules, but it does not control the order of steps or force the exception stop.`),

  one("T19", 4, `A company has two Claude endpoints. One pulls five fields from invoices and must respond within one second. The other combines conflicting audit evidence into findings; a missed item there is costly, but speed matters less.
How should the team choose models for them?`, [
    `Test candidate models on each workload and pick a model for each endpoint from the results.`,
    `Use the most capable model for both endpoints so that neither workload loses any accuracy.`,
    `Use the fastest model for both endpoints and add a second review pass for the audit findings.`,
    `Pick one model for both endpoints based on its score on a widely used public benchmark.`,
  ], [0], `Model choice is workload-specific: each endpoint's model should be chosen from measured quality, latency and cost on that endpoint's real task.
Why A is correct. Testing each workload separately lets the team meet the invoice endpoint's latency target and the audit endpoint's quality need, with different models if needed.
Why B is incorrect. The most capable model may miss the one-second target on simple invoice extraction and costs more than that task needs.
Why C is incorrect. A fast model may miss conflicting evidence, and a second pass by the same kind of model does not guarantee the audit quality the team needs.
Why D is incorrect. A public benchmark does not measure either of these tasks, so it cannot show which model meets each endpoint's requirement.`),

  one("T20", 6, `An agent reads project issues through an MCP resource. One issue description contains instructions telling the agent to export all customer records. The agent is allowed to read issues, but exporting customer data requires separate authorization.
How should the application handle this?`, [
    `Treat the text as a valid request, because it came from the company's own MCP server.`,
    `Let Claude judge whether the author of the issue has the authority to request an export.`,
    `Treat the issue text as untrusted data and enforce export authorization in the backend.`,
    `Give the issue tool its own database credential so that it can check the author's role.`,
  ], [2], `Untrusted content and the authority to act must be separated at a boundary the backend enforces, not left to the model's judgment.
Why A is incorrect. Arriving through the company's MCP server does not make issue text an authorized instruction; anyone who can file an issue can write it.
Why B is incorrect. Claude cannot verify who wrote the text or what they are allowed to do, and persuasive text can mislead it.
Why C is correct. Claude can still read and summarize the issue, while the backend refuses any export that lacks the required authorization.
Why D is incorrect. Giving the tool broader database access increases what a successful injection could reach, and it does not enforce export authorization.`),
  ],
});
