import { one, defineSet } from "./shared.js";

export const demo = defineSet({
  id: "demo",
  title: `Certs Club free demo`,
  source: {
    label: `Certs Club`,
    url: `https://certsclub.com/anthropic/claude-certified-developer-foundations-demo-practice-questions`,
  },
  questions: [
  one("D1", -1, `Your Claude agent has access to a tool that retrieves customer records. A teammate has noticed that the agent occasionally calls the tool with arguments the schema does not declare, and the tool's downstream service returns an error each time. The teammate proposes loosening the schema so the tool accepts whatever arguments the model produces.
How would you respond?`, [
    `Add a system prompt instruction telling the model to produce schema-conforming arguments, treating the prompt instruction as the primary mechanism for keeping the agent's tool calls valid.`,
    `Keep the schema strict, validate arguments before dispatching, and return a structured error so the agent can retry.`,
    `Remove the schema entirely and rely on the downstream service to reject invalid calls, treating the downstream service as the team's primary enforcement layer.`,
    `Loosen the schema as the teammate proposed so the downstream service receives every call the agent makes during normal operation.`,
  ], [1], `The supplied question identifies B as the intended answer. Tool schemas are contracts between Claude and executable application code. When the downstream service accepts only a defined set of arguments, relaxing that schema merely shifts invalid data farther into the system and increases runtime failures.
Anthropic's current tooling provides an even stronger implementation of this principle through strict tool use. Setting strict: true constrains tool inputs to the declared JSON Schema, preventing undeclared properties, missing required values, and incompatible parameter types where the supported schema subset is used.
In a non-strict or legacy implementation, the application should still validate arguments before dispatch and convert invalid calls into structured tool errors that Claude can interpret and potentially correct. A prompt instruction can reinforce behavior, but it should not replace deterministic validation. C and D weaken the system boundary and knowingly send invalid calls downstream.
Therefore, maintain the contract rather than adapting the contract to malformed model output.`),

  one("D2", -1, `Your Claude agent has too many tools, and many of them have overlapping functionality. The agent often picks an inappropriate tool when several could plausibly handle a request.
How would you address the tool selection problem?`, [
    `Add more tools to cover every variation of the requests the agent handles, on the grounds that more tools give the agent more accurate options to choose from.`,
    `Remove all tools and rely on the agent's general capability instead, with the application losing the workflows that previously relied on tools.`,
    `Add detailed examples to each tool's description so the agent can match incoming requests to the right tool by example, treating the examples as the team's selection mechanism.`,
    `Restructure the tool set by consolidating overlapping tools, removing unused tools, and clarifying tool descriptions so each tool has a distinct purpose.`,
  ], [3], `Option D addresses the architectural cause of the failure: an ambiguous tool surface. Claude chooses tools partly from their names, descriptions, schemas, and the relationship between the request and the capability described. If multiple tools appear to perform substantially the same task, selection becomes unnecessarily difficult.
Anthropic's tool-definition guidance explicitly recommends consolidating related operations into fewer tools and making descriptions clear about both what a tool does and when it should be used. Fewer, more capable tools reduce selection ambiguity and make the available tool surface easier for Claude to navigate.
Option A makes the ambiguity worse by expanding an already overlapping tool set. B destroys required application capabilities. C could improve selection somewhat, because examples can clarify complex inputs, but it leaves the underlying duplication intact. Examples complement good tool design; they are not a substitute for distinct tool responsibilities.
Therefore, D is the strongest solution: remove unused tools, merge functions that represent the same conceptual operation, and write discriminative descriptions defining appropriate and inappropriate usage.`),

  one("D3", -1, `Your Claude application uses tool calling to fetch patient data and generate summary reports. The flow occasionally fails because the model returns a tool_use block that references arguments not present in the schema, and your application code does not handle this case gracefully.
How would you address this?`, [
    `Validate the tool_use block's arguments against the tool schema before dispatching the tool and handle invalid arguments as a recognized error path.`,
    `Log invalid tool_use blocks when they occur and allow the tool dispatch to proceed, relying on the tool's own error handling to surface failures back to the application.`,
    `Retry the same request repeatedly until the model returns a valid tool_use block that matches the schema as expected.`,
    `Stop using tool calling entirely and replace tools with prompted text generation that asks the model to describe what it would do.`,
  ], [0], `The question presents a trust-boundary failure: model-generated tool arguments are being accepted without sufficient validation before an external operation executes. A tool call should therefore be treated like input arriving at any typed application interface: the application must ensure that the tool name and arguments satisfy the declared contract before dispatch.
Anthropic describes tool use as a contract in which the application defines the tool's schema and Claude returns structured tool_use input. Current Claude functionality also supports strict: true, which guarantees schema-compliant tool inputs through constrained generation and specifically addresses invented parameters, incompatible types, and missing required fields. For applications not using strict tool use, explicit application-side validation and a controlled error path remain essential.
B knowingly executes invalid input. C relies on uncontrolled repetition rather than deterministic validation and bounded recovery. D eliminates a useful capability instead of correcting its execution boundary.
Therefore, A provides the correct defensive design.`),

  one("D4", -1, `Your Claude agent performs database operations. A recent incident occurred where the agent ran a destructive query that affected production data. The team wants to add deterministic controls to prevent similar incidents.
How would you prevent similar incidents?`, [
    `Run the agent only during business hours when humans are available to monitor its activity, treating the schedule as the primary control mechanism for destructive operations.`,
    `Add Claude hooks that intercept database operations and apply deterministic checks, such as blocking destructive queries or requiring approval, before the queries execute.`,
    `Switch to a higher-capability Claude model on the grounds that a more capable model is less likely to run destructive queries during normal operation across all requests.`,
    `Add a system prompt instruction telling the agent to be careful with database operations on every request the application handles during normal operation across all incoming traffic.`,
  ], [1], `Option B is correct because destructive production operations require deterministic enforcement outside the model's probabilistic reasoning. Claude Code hooks can intercept lifecycle events before tool execution and explicitly allow, deny, or request further handling based on concrete rules.
Anthropic's hooks documentation provides this exact security pattern. A PreToolUse hook can inspect a proposed command before execution and return a blocking decision. Anthropic's example demonstrates blocking destructive operations such as drop table, while other commands proceed normally.
That mechanism can be adapted to database controls: block DROP, destructive DELETE, unauthorized schema modifications, or production writes; require explicit approval for high-risk operations; and allow read-only or known-safe queries automatically.
A merely increases the probability that someone might notice an unsafe operation and does not prevent execution. C assumes model capability can replace access controls, which is an unacceptable safety boundary. D is useful behavioral guidance but remains probabilistic and cannot guarantee prevention.
Therefore, B creates a deterministic control between model intent and side-effect execution.`),

  one("D5", -1, `You are designing a Claude application that processes user-submitted text. Some of that text could include sensitive information such as account numbers or passwords that the application should not send to Claude.
How would you design the application?`, [
    `Define the application boundary explicitly, identify what content can leave the boundary for Claude, and add filtering or redaction at the boundary.`,
    `Add a prompt instruction in the system prompt specifying the categories of sensitive information Claude should disregard when processing user-submitted text.`,
    `Log all user-submitted text before it is sent to Claude and review the logs periodically to identify whether sensitive information is reaching the model.`,
    `Apply filtering at the boundary for the most commonly observed sensitive data patterns and expand coverage to additional patterns based on findings from production monitoring.`,
  ], [0], ``),

  one("D6", -1, `You are building a Claude application that processes 10,000 customer emails overnight to extract structured data. The work is non-interactive, runs once daily, and has a flexible completion window of several hours. Which Claude API would you use?`, [
    `The Batch API, which is designed for non-interactive workloads with flexible completion windows.`,
    `The streaming responses API to process each email and return partial results to a database as the model generates them.`,
    `The real-time Messages API, processing the emails one at a time sequentially to ensure consistent ordering of results.`,
    `The real-time Messages API with concurrent requests to process the emails as fast as possible during the overnight window.`,
  ], [0], ``),

  one("D7", -1, `You are deciding between Claude models for a task. The team has identified three relevant tradeoff dimensions: quality, latency, and cost.
The right model is the one that...`, [
    `Satisfies the task's latency requirement first, then is evaluated against quality and cost thresholds to confirm the selection is acceptable across all three dimensions.`,
    `Meets the task's cost target within a defined latency budget, with quality validated against a representative sample of inputs after the model is selected.`,
    `Fits the task's quality, latency, and cost requirements together, recognizing that improving one dimension typically affects the others.`,
    `Meets the task's quality requirements at an acceptable latency, with cost reviewed separately once the quality and latency bar has been established.`,
  ], [2], ``),

  one("D8", -1, `The team is debating whether to integrate with the Claude API directly or through a third-party abstraction layer that supports multiple LLM providers. The team has identified that all current and projected use cases run on Claude, no internal customer has requested LLM portability, and the team's product roadmap does not mention multi-provider support over the next two years. The third-party abstraction would add roughly 15 percent overhead in code complexity and introduce one additional dependency.
Which integration approach would you recommend?`, [
    `The third-party abstraction layer, on the grounds that multi-provider support is valuable for any application as a matter of long-term flexibility across vendors.`,
    `Both integration paths in parallel, where the application uses each path on different runs to compare which performs better in production over time.`,
    `A custom multi-provider abstraction layer the team builds in-house so that the team controls every part of the abstraction the application uses for its API calls.`,
    `Direct integration with Claude through its SDK, because no multi-provider need exists and abstraction would add complexity that does not pay off.`,
  ], [3], ``),

  one("D9", -1, `A teammate has asked you to explain the difference between context engineering and prompt engineering. They have heard the terms used interchangeably and are unsure how each applies to a Claude application that processes long-running multi-step tasks.
How would you describe the distinction?`, [
    `Prompt engineering focuses on the model's response, while context engineering focuses on the user's input across many sessions in a long-running multi-step Claude application.`,
    `Prompt engineering is the older term for prompt design, while context engineering is the newer term that has replaced it in modern Claude applications across the industry.`,
    `Prompt engineering shapes individual prompts for specific outputs, while context engineering manages how content flows across turns and steps and takes steps to keep relevant state visible.`,
    `Prompt engineering and context engineering each address content the team gives Claude, but the team can group them under a single workflow because the practices use overlapping techniques.`,
  ], [2], ``),

  one("D10", -1, `You are implementing a custom tool for your Claude agent. The tool needs to interact with an external pricing service that returns product data.
Which of the following best practices would you apply as you develop this tool?`, [
    `Omit the tool description and let the model infer when to use the tool based on the tool's name and the rest of the prompt context.`,
    `Define the tool with a loose schema and let the model interpret the inputs flexibly on each call the agent makes.`,
    `Implement the tool with no error handling and let the agent loop catch failures whenever the pricing service returns an error during operation.`,
    `Define the tool with a clear schema, write a precise description for when to call it, and handle pricing service errors explicitly.`,
  ], [3], ``),

  one("D11", -1, `A Claude application is producing outputs that drift away from the expected JSON format after several conversation turns. The first few turns produce correctly formatted output, but later turns gradually lose structure.
How would you address the drift?`, [
    `Identify the failure mode as format drift, examine how the conversation context evolves over turns, and address the drift through context management or output validation.`,
    `Truncate every response to the first few characters, validate that the truncated output matches the expected JSON structure, and log any mismatches for review.`,
    `Restart the application after every turn and monitor whether the format remains consistent across subsequent interactions.`,
    `Switch to a smaller Claude model and re-test the application to determine whether the drift persists across conversation turns.`,
  ], [0], ``),

  one("D12", -1, `A new Claude model release includes performance improvements for several reasoning tasks but has changed the format of its responses to system prompts that use multi-section instructions. Your application uses multi-section system prompts heavily. Initial evaluation on the application's actual workload shows the new model performs 8 percent better on reasoning tasks but produces malformed output on roughly 3 percent of requests because of the format change. The team is debating whether to upgrade.
How would you decide?`, [
    `Upgrade immediately, because the 8 percent reasoning improvement outweighs the 3 percent malformed output rate across the application's typical request distribution.`,
    `Adapt the application's system prompt to the new model's format expectations and re-evaluate, then upgrade only if the adapted prompt eliminates the malformed output while preserving the reasoning improvements.`,
    `Upgrade and add a downstream validation step that catches the 3 percent malformed output before it reaches users, treating the validation step as the team's mitigation for the format change.`,
    `Stay on the previous model permanently to avoid the malformed output rate and any future format changes that subsequent model releases might introduce in the application.`,
  ], [1], ``),

  one("D13", -1, `Your Claude application's outputs are inconsistent in format. The team’s instructions are scattered across the system prompt and user messages, with some instructions stated only once and others repeated.
How would you fix the inconsistency?`, [
    `Move all instructions into the user message so the application's behavior is controlled at the input point.`,
    `Consolidate behavioral and format instructions in the system prompt and keep user messages focused on the user's input.`,
    `Place each instruction wherever the developer who first wrote it found most natural, retaining the original intent.`,
    `Repeat all instructions in both the system prompt and the user message so the model sees each instruction more than once.`,
  ], [1], ``),
  ],
});
