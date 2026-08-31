CMAIL — POST-PoC DEVELOPMENT AND RELEASE PLAN

DOCUMENT PURPOSE

The Cmail proof of concept has been successfully completed.

The PoC established that the core technical premise is viable:

- HTML emails can be rendered locally.
- Multiple rendering strategies can be represented as Cmail environments.
- Different environments can produce meaningful rendering differences.
- Environment implementations can be hidden behind a common abstraction.
- Rendered output can be captured as screenshots.
- Snapshots and visual differences can be detected.
- The workflow can operate locally and return CI-compatible exit codes.

The project should now transition from "technical experiment" into "developer tool."

This document defines the next development phase and the path toward an initial public release.

The objective is NOT to immediately build the entire long-term Cmail vision.

The objective is to build a small, reliable, installable developer tool that developers can actually use in real projects.

==================================================

1. CURRENT STATE
   \==================================================

The PoC has answered the primary technical question positively.

The architecture has demonstrated that:

Email source
->
Cmail environment
->
Environment-specific processing
->
Rendering engine
->
Rendered output
->
Screenshot
->
Snapshot comparison
->
Test result

is a viable model.

The next phase should preserve this architecture while improving:

- reliability
- developer experience
- environment definitions
- configuration
- snapshot management
- CLI usability
- CI/CD integration
- packaging
- documentation
- test coverage
- reproducibility

The project should now start behaving like a real developer tool rather than a research project.

================================================== 2. RELEASE STRATEGY
==================================================

Do not jump directly to a 1.0 release.

Use staged releases.

Recommended progression:

Phase A
Internal development release

Phase B
Alpha

Phase C
Beta

Phase D
1.0

Each stage should have a clear purpose.

Internal development:
Make the architecture robust.

Alpha:
Let technically capable developers experiment with Cmail.

Beta:
Make the interface stable enough for real projects.

1.0:
Provide a dependable developer workflow with documented behaviour and a reasonable initial environment set.

================================================== 3. PHASE A — TURN THE PoC INTO A REAL PROJECT
==================================================

The first task is to clean up the PoC implementation.

Do not add large new features yet.

Focus on establishing a stable project structure.

Tasks:

- Establish the final repository structure.
- Separate CLI code from core rendering logic.
- Separate environment implementations from the test runner.
- Separate snapshot logic from rendering logic.
- Separate configuration parsing from execution.
- Establish a consistent logging/error system.
- Establish project-level TypeScript or equivalent configuration.
- Establish linting.
- Establish formatting.
- Establish unit tests.
- Establish integration tests.
- Establish fixture tests.
- Establish build scripts.
- Establish package boundaries where appropriate.

The architecture should make it possible to change an environment implementation without changing the Cmail test runner.

================================================== 4. DEFINE THE PUBLIC API BEFORE EXPANDING FEATURES
==================================================

Before implementing a large number of features, formally define what developers interact with.

There are three important public surfaces:

1. CLI
2. Configuration
3. Environment identifiers

These should be treated as public APIs.

Do not allow internal implementation details to accidentally become part of the public API.

================================================== 5. CLI DESIGN
==================================================

The CLI should become the main developer interface.

The initial command set should be small.

Required:

cmail test

Purpose:

Run email rendering tests.

Required:

cmail test --update

Purpose:

Create or update snapshots.

Recommended:

cmail open

Purpose:

Open the local test report.

Potential:

cmail list

Purpose:

List available environments.

Potential:

cmail inspect

Purpose:

Show environment capabilities and compatibility information.

Potential:

cmail init

Purpose:

Create a basic Cmail configuration in an existing project.

Do not implement every command immediately.

The minimum release candidate should make:

cmail test
cmail test --update

excellent.

Additional commands should only be implemented when their purpose is clear.

================================================== 6. CONFIGURATION API
==================================================

The configuration system should now become a stable developer-facing API.

The configuration should answer:

- Which emails should be tested?
- Which environments should be tested?
- Which variants/conditions should be tested?
- Where are snapshots stored?
- What comparison settings are used?
- What report behaviour is desired?

Keep the common configuration small.

A developer should be able to start with almost no configuration.

Sensible defaults should be preferred over mandatory configuration.

The configuration API should support future expansion without requiring breaking changes.

Avoid exposing browser-specific implementation details in the standard configuration.

================================================== 7. ENVIRONMENT NAMING
==================================================

Environment identifiers are one of the most important parts of the product.

The naming system should be clear, stable, and predictable.

Examples:

gmail-desktop
gmail-mobile
apple-mail-macos
apple-mail-ios
outlook-classic

An environment represents a real-world target.

A version represents a Cmail representation of that target.

For example:

gmail-desktop@v1

Do not make the environment identifier depend on the underlying renderer.

For example, avoid names like:

chromium-gmail

because Chromium is an implementation detail.

The developer cares about Gmail.

================================================== 8. ENVIRONMENT VERSIONING
==================================================

Formalize environment versioning before adding many environments.

Each environment version should define:

- target client
- target platform
- Cmail environment version
- rendering engine
- rendering engine version
- compatibility rules
- viewport defaults
- supported conditions
- capabilities
- fidelity information

Environment versions must be immutable.

If the environment changes significantly, create a new version.

Do not silently alter an existing environment version.

================================================== 9. LOCKFILE
==================================================

Implement a real Cmail lockfile.

The lockfile should pin:

- environment versions
- renderer versions where necessary
- relevant environment dependencies
- any other information required for reproducible rendering

The purpose is that a project tested today should not unexpectedly render differently next month because an environment changed.

The lockfile should be generated or updated through Cmail rather than requiring manual editing.

Do not build a complex package manager.

The lockfile should simply provide deterministic resolution.

================================================== 10. ENVIRONMENT REGISTRY
==================================================

Create a formal environment registry.

The registry should allow Cmail to answer:

- What environments exist?
- What versions exist?
- What platform does each environment represent?
- What renderer does it use?
- What capabilities does it claim?
- What fidelity level does it have?
- What conditions does it support?

The registry is likely to become one of Cmail's most important pieces of infrastructure.

Do not make the first registry overly complicated.

A local/static registry is sufficient initially.

The architecture should eventually allow the registry to be distributed with or alongside Cmail.

================================================== 11. INITIAL ENVIRONMENT SET
==================================================

Do not immediately attempt to support every email client.

Instead, harden the three PoC environments:

- gmail-desktop
- apple-mail-macos
- outlook-classic

Then add Gmail Mobile as the first major additional environment.

Recommended early environment progression:

1. gmail-desktop
2. apple-mail-macos
3. outlook-classic
4. gmail-mobile
5. apple-mail-ios
6. outlook-new
7. other major clients based on demand and technical feasibility

The ordering should ultimately be driven by:

- developer demand
- market relevance
- technical feasibility
- uniqueness of rendering behaviour
- confidence in reproducibility

Do not add an environment merely to increase the number shown on a marketing page.

A smaller number of high-quality environments is more valuable.

================================================== 12. ENVIRONMENT FIDELITY
==================================================

Introduce explicit fidelity metadata.

An environment should communicate how it represents the real-world target.

For example:

Exact:
The actual target rendering mechanism is being used.

High:
The environment is a very close reproduction but does not use the original complete runtime.

Simulated:
The environment models known behaviour through transformations or restrictions.

Analytical:
The environment provides compatibility information without claiming to reproduce final pixels.

These labels should appear in developer-facing documentation and potentially in reports.

This prevents Cmail from making misleading claims.

================================================== 13. COMPATIBILITY RULES
==================================================

Move environment-specific compatibility behaviour into explicit, testable definitions.

For example:

- unsupported CSS
- transformed CSS
- stripped HTML
- sanitised attributes
- unsupported properties
- client-specific colour behaviour
- image behaviour
- font behaviour
- layout restrictions

Compatibility rules should not be scattered throughout the rendering engine.

They should belong to the environment.

The goal is:

Core renderer:
"I know how to render."

Environment:
"I know what this client does to the email."

================================================== 14. TEST THE ENVIRONMENTS THEMSELVES
==================================================

Cmail needs two levels of testing.

LEVEL 1 — CMAIL TESTS

These test that the Cmail system works correctly.

Examples:

- configuration parsing
- CLI behaviour
- snapshot handling
- diff detection
- environment resolution
- lockfile behaviour

LEVEL 2 — ENVIRONMENT TESTS

These test that an environment behaves as intended.

Examples:

- Outlook rejects/changes a specific CSS feature.
- Gmail processes a specific HTML structure.
- Apple Mail supports a particular feature.
- Dark mode behaves according to the environment definition.

Every environment should have a fixture suite.

Do not rely solely on screenshots.

Where possible, compatibility rules should also have deterministic behavioural tests.

================================================== 15. SNAPSHOT SYSTEM
==================================================

The snapshot system should become production-quality.

Requirements:

- deterministic filenames
- deterministic environment identifiers
- deterministic variants
- stable directory structure
- update mode
- comparison mode
- diff generation
- configurable thresholds
- useful failure output

The snapshot system should eventually support:

- per-environment snapshots
- per-condition snapshots
- per-viewport snapshots
- optional tolerance thresholds

The system must avoid false positives caused by irrelevant rendering noise where practical.

Do not overcomplicate the comparison algorithm before real-world testing demonstrates the need.

================================================== 16. VISUAL DIFF DESIGN
==================================================

The diff output should become one of Cmail's strongest developer experiences.

When a test fails, the developer should immediately understand:

- what changed
- where it changed
- which environment changed
- how significant the change was

The report should eventually support:

Expected
Actual
Difference

The diff image should make changed regions obvious.

If possible, provide a percentage or metric describing the difference.

Do not treat a tiny anti-aliasing difference as equivalent to an entire broken layout.

The comparison system should eventually distinguish between meaningful and insignificant changes.

================================================== 17. TEST OUTPUT
==================================================

The CLI output should be designed for both humans and CI.

Human output should be:

- concise
- readable
- actionable
- grouped by email/environment

CI output should be:

- deterministic
- machine-readable where possible
- free from unnecessary interactive behaviour

Eventually consider output formats such as:

- human
- JSON
- JUnit

Do not necessarily implement all three immediately.

Human-readable output is the first priority.

================================================== 18. CI/CD
==================================================

Cmail's ability to run in CI is a primary product requirement.

The following workflow should eventually work without special integration:

install dependencies
run cmail test
receive success/failure

Cmail should not require a hosted service to perform its basic tests.

Important CI considerations:

- deterministic exit codes
- reproducible environment versions
- predictable snapshot paths
- predictable generated artifacts
- no interactive prompts
- useful logs
- optional machine-readable output

Later, provide documentation for common CI platforms.

Do not build proprietary CI integrations.

================================================== 19. LOCAL REPORTING
==================================================

Build a useful local report after the CLI is stable.

The report should show:

- test summary
- emails
- environments
- variants
- pass/fail status
- expected image
- actual image
- diff image
- environment metadata

The report should be generated locally.

No account or server should be required.

A static HTML report is preferred initially.

The report should be a convenience layer over the CLI results rather than a second independent test system.

================================================== 20. DARK MODE
==================================================

Now that the core architecture is proven, expand dark-mode support carefully.

Dark mode should remain a condition.

Do not create a giant matrix of environment names such as:

gmail-dark
gmail-light
gmail-mobile-dark
gmail-mobile-light

Instead model:

Environment +
Condition

Examples:

gmail-desktop@v1 + light
gmail-desktop@v1 + dark

Different clients may apply different dark-mode transformations.

The environment should own those rules.

The release should clearly document which dark-mode behaviours are supported and which are approximations.

================================================== 21. VIEWPORTS AND DEVICES
==================================================

Formalize viewport definitions.

Every environment should have a sensible default viewport.

Examples:

gmail-desktop:
desktop viewport

gmail-mobile:
mobile viewport

apple-mail-ios:
mobile viewport

Developers should be able to override viewport settings later.

However, custom viewport support should not undermine the concept of environment presets.

The standard developer workflow should use tested, known environment configurations.

================================================== 22. RESOURCE AND RENDERER MANAGEMENT
==================================================

Rendering environments may require large dependencies.

This needs to be handled carefully before public release.

Determine:

- how browsers are installed
- whether they are downloaded automatically
- how versions are pinned
- where they are stored
- how CI installs them
- how offline operation works
- how cache invalidation works
- how unsupported host systems are reported

The developer experience should be predictable.

If an environment cannot run on the current host, Cmail should provide a clear error explaining why.

Do not silently fall back to a different rendering engine if doing so would invalidate reproducibility.

================================================== 23. CROSS-PLATFORM SUPPORT
==================================================

The first release should have a clearly defined supported host matrix.

Do not claim universal support until it has been tested.

Likely targets:

- Linux
- macOS
- Windows

Determine which environments are actually possible on each host.

The architecture should distinguish:

Cmail host platform

from:

Target email environment platform.

For example, a developer running Cmail on Linux may still be testing an Apple Mail representation.

This distinction is important.

================================================== 24. ERROR HANDLING
==================================================

Turn internal errors into useful developer messages.

Examples of errors that need clear handling:

- invalid Cmail configuration
- missing email file
- unsupported environment
- environment version unavailable
- renderer dependency missing
- browser startup failure
- malformed HTML
- snapshot missing
- snapshot comparison failure
- unsupported condition
- environment cannot run on host

Errors should explain:

What happened?

Why did it happen?

What should the developer do next?

Avoid dumping raw stack traces by default.

Provide a verbose/debug mode for developers who need detailed diagnostics.

================================================== 25. INITIAL DOCUMENTATION
==================================================

Documentation becomes a release requirement.

At minimum document:

- what Cmail is
- installation
- quick start
- configuration
- environments
- environment versions
- snapshots
- visual regression
- CI usage
- supported platforms
- environment fidelity
- limitations
- troubleshooting
- contributing
- environment development

The README should allow a developer to understand the product in under a few minutes.

The quick-start workflow should be extremely short.

================================================== 26. DOCUMENT THE LIMITATIONS
==================================================

Cmail should be explicit about what it does not guarantee.

Especially:

- simulations are not identical to real clients
- browser-based approximations may differ from proprietary clients
- email clients can change behaviour
- environment versions are Cmail representations
- screenshots are not necessarily proof of pixel-perfect real-world rendering

Do not market the system as "perfect email rendering."

The strength of Cmail is reproducibility and developer workflow.

================================================== 27. ENVIRONMENT CONTRIBUTION MODEL
==================================================

Before 1.0, define how a new environment is added.

A contributor should eventually be able to create:

environment metadata
renderer configuration
compatibility rules
capabilities
fixtures
snapshots
documentation

An environment should have its own validation suite.

Do not build a marketplace.

Do not build dynamic third-party environment installation yet.

Simply establish a clean internal contribution model.

================================================== 28. PACKAGE AND DISTRIBUTION STRATEGY
==================================================

Cmail should eventually be installable as a normal developer dependency.

The likely primary distribution mechanism is npm.

The package should provide the cmail executable.

The developer experience should eventually resemble:

install Cmail
initialize/configure
run cmail test

Avoid requiring developers to clone the Cmail repository.

Before publishing publicly, ensure:

- package metadata is correct
- executable is correctly exposed
- build output is clean
- source maps are appropriate
- unnecessary files are excluded
- versioning is established
- licensing is established

================================================== 29. VERSIONING POLICY
==================================================

Cmail itself should use semantic versioning once the public API stabilizes.

Before 1.0, breaking changes are acceptable but should still be documented.

After 1.0:

Major:
Breaking CLI/configuration/API changes.

Minor:
New functionality that remains backwards compatible.

Patch:
Bug fixes and compatibility corrections that do not change the public contract.

Environment versions are separate from Cmail versions.

Do not confuse:

Cmail 1.2.0

with:

gmail-desktop@v2

They represent different things.

================================================== 30. ALPHA RELEASE
==================================================

The Alpha release should target developers who understand that the project is experimental.

The Alpha should provide:

- installable CLI
- configuration
- at least three stable environment definitions
- environment versioning
- snapshots
- visual regression
- CI-compatible exit codes
- basic local reporting
- documentation

The Alpha does not need:

- huge environment coverage
- polished UI
- perfect fidelity
- advanced compatibility analysis

The goal is to get real developers using it.

================================================== 31. ALPHA FEEDBACK
==================================================

The primary questions during Alpha should be:

1. Is the CLI intuitive?

2. Is configuration intuitive?

3. Are the environment names understandable?

4. Are rendering differences useful?

5. Are false positives manageable?

6. Are snapshots easy to update?

7. Are failures easy to diagnose?

8. Does CI work reliably?

9. Are environments reproducible?

10. Which environments do developers actually want?

Do not primarily measure success by GitHub stars.

Measure whether developers can integrate Cmail into a real email project.

================================================== 32. BETA OBJECTIVES
==================================================

The Beta should focus on reliability.

Priorities:

- cross-platform testing
- deterministic rendering
- snapshot stability
- renderer lifecycle reliability
- environment correctness
- better errors
- CI reliability
- documentation
- performance

The Beta should be suitable for developers to use on real projects while still allowing some API changes if necessary.

================================================== 33. PERFORMANCE
==================================================

Rendering emails can become expensive.

Do not prematurely optimise.

First measure:

- startup time
- environment startup time
- rendering time
- screenshot time
- comparison time
- total test suite time

Then optimise the expensive areas.

Likely future optimisations include:

- browser reuse
- environment reuse
- parallel rendering
- caching
- incremental testing

However, correctness and determinism come before speed.

Do not introduce concurrency that makes rendering flaky.

================================================== 34. PARALLEL EXECUTION
==================================================

Eventually Cmail should support parallel environment rendering.

For example:

gmail
apple mail
outlook

could render concurrently where safe.

But only implement this after the serial workflow is stable.

The architecture should not assume that every environment can safely share a renderer instance.

Each environment should declare or imply its lifecycle requirements.

================================================== 35. TEST DATA AND FIXTURES
==================================================

Build a comprehensive internal fixture suite as development continues.

Fixtures should include:

- basic email
- table email
- responsive email
- multi-column email
- image-heavy email
- typography test
- button test
- background-image test
- flexbox test
- grid test
- SVG test
- media-query test
- dark-mode test
- nested-table test
- malformed/edge-case HTML

The fixture suite should become a permanent part of the project.

It is not throwaway PoC material.

================================================== 36. ENVIRONMENT VALIDATION
==================================================

Each environment should have a validation suite.

The purpose is to ensure that future changes do not accidentally alter the environment.

If:

gmail-desktop@v1

claims a particular behaviour, a fixture should verify it.

If that behaviour changes, the environment should either:

- remain unchanged if the change is a bug fix to Cmail implementation, or
- become a new environment version if the representation intentionally changes.

This is essential to preserving reproducibility.

================================================== 37. SECURITY
==================================================

Because Cmail renders HTML supplied by developers, treat email input as potentially unsafe.

The renderer architecture should consider:

- JavaScript execution
- local filesystem access
- external resource loading
- network requests
- malicious HTML
- browser sandboxing
- resource exhaustion

The default environment should be as isolated as practical.

Do not allow an email fixture to unexpectedly gain access to the developer's filesystem.

Determine whether external network requests should be:

- blocked
- explicitly allowed
- mocked
- configurable

For the first release, a secure default is preferred.

================================================== 38. EXTERNAL RESOURCE HANDLING
==================================================

Email rendering often depends on:

- images
- fonts
- remote CSS
- external URLs

This creates reproducibility problems.

Cmail should eventually have an explicit model for external resources.

For the initial release, determine a predictable policy.

Possibilities include:

- external resources disabled by default
- explicit opt-in
- resource capture/cache
- fixture-local resources

Do not allow network-dependent rendering to silently undermine snapshot reproducibility.

================================================== 39. RELEASE QUALITY GATE
==================================================

Do not release 1.0 until the following are true.

INSTALLATION

- Cmail installs cleanly.
- The CLI is available after installation.
- Supported platforms are documented.

CONFIGURATION

- Configuration is documented.
- Invalid configuration produces useful errors.
- Defaults are sensible.

RENDERING

- Environments render reliably.
- Renderer versions are controlled.
- Rendering is deterministic enough for snapshot testing.

ENVIRONMENTS

- Environment names are stable.
- Environment versions are explicit.
- Fidelity is documented.
- Environment-specific tests exist.

SNAPSHOTS

- Snapshot generation works.
- Snapshot comparison works.
- Diffs are useful.
- False positives are acceptably low.

CI

- Exit codes are correct.
- Non-interactive execution works.
- Artifacts can be collected.

DOCUMENTATION

- Quick start exists.
- Configuration is documented.
- Environment limitations are documented.
- CI usage is documented.

================================================== 40. WHAT SHOULD NOT HAPPEN BEFORE 1.0
==================================================

Avoid major distractions.

Do not build:

- hosted Cmail
- user accounts
- subscriptions
- billing
- analytics platform
- cloud rendering farm
- enterprise dashboard
- team management
- comments/annotations
- browser extension
- desktop GUI
- mobile application
- AI-generated compatibility fixes

These may eventually become products or features.

They are not necessary to prove Cmail as a developer tool.

================================================== 41. POTENTIAL FUTURE FEATURES
==================================================

Keep these in the roadmap but outside the initial release.

Future possibilities include:

- larger environment library
- environment version updater
- compatibility matrix
- HTML/CSS static analysis
- DOM-level comparisons
- accessibility testing
- link validation
- image validation
- image loading simulation
- font loading simulation
- client-specific dark-mode analysis
- automatic compatibility warnings
- machine-readable reports
- GitHub integrations
- editor integrations
- VS Code integration
- watch mode
- interactive local report
- parallel execution
- remote optional rendering
- environment plugins
- community-contributed environments

The key is that these should build on the same environment abstraction.

================================================== 42. LONG-TERM PRODUCT DIFFERENTIATOR
==================================================

The product should not compete purely on the number of email clients supported.

The deeper differentiator is:

Cmail provides reproducible, versioned email rendering environments that developers can run locally and in CI.

The core promise is:

"Your email rendering tests should behave like software tests."

That means:

- deterministic inputs
- deterministic environments
- versioned dependencies
- repeatable output
- snapshots
- diffs
- exit codes
- CI integration
- source-controlled configuration

This should guide future architectural decisions.

================================================== 43. RECOMMENDED DEVELOPMENT ORDER
==================================================

Follow this order unless technical constraints require otherwise.

STEP 1

Harden the PoC architecture.

STEP 2

Define the public CLI and configuration API.

STEP 3

Formalize environment metadata and versioning.

STEP 4

Implement the Cmail lockfile.

STEP 5

Stabilize the three existing environments.

STEP 6

Build comprehensive environment fixtures.

STEP 7

Harden snapshot and visual diff behaviour.

STEP 8

Improve CLI output and errors.

STEP 9

Add local HTML reporting.

STEP 10

Add CI documentation and machine-friendly output.

STEP 11

Add Gmail Mobile.

STEP 12

Test across supported host platforms.

STEP 13

Package Cmail for npm distribution.

STEP 14

Perform an internal release.

STEP 15

Release Alpha.

STEP 16

Gather real developer feedback.

STEP 17

Improve reliability and compatibility based on real usage.

STEP 18

Release Beta.

STEP 19

Freeze the public API.

STEP 20

Release Cmail 1.0.

================================================== 44. THE FIRST IMMEDIATE MILESTONE
==================================================

Do not attempt to complete the entire release plan immediately.

The first milestone after the PoC should be:

"Cmail Developer Preview"

The Developer Preview should transform the PoC into a clean, repeatable repository that a second developer can clone and use without understanding the internals.

Success means:

Clone repository
-> install
-> configure an email
-> run cmail test
-> see results
-> update snapshots
-> make a change
-> see a regression
-> inspect expected/actual/diff

If another developer can perform that workflow without assistance, the project has successfully moved beyond PoC.

================================================== 45. FIRST RELEASE TARGET
==================================================

The first public release should be intentionally modest.

A good initial promise is:

"Run your email rendering tests locally across reproducible Cmail environments."

Do not promise:

"Perfectly reproduce every email client."

The initial release should be judged by whether it is:

- useful
- deterministic
- easy to install
- easy to understand
- easy to integrate into CI
- honest about fidelity
- extensible

================================================== 46. FINAL ARCHITECTURAL NORTH STAR
==================================================

The architecture should continue to move toward:

EMAIL SOURCE

    ->

CMAIL TEST RUNNER

    ->

VERSIONED ENVIRONMENT

    ->

CLIENT PROCESSING

    ->

RENDERING ENGINE

    ->

DEVICE / VIEWPORT

    ->

CONDITIONS

    ->

DETERMINISTIC OUTPUT

    ->

SNAPSHOT / ANALYSIS

    ->

TEST RESULT

    ->

LOCAL DEVELOPMENT
AND
CI/CD

The test runner should remain independent from individual environment
implementations.

The environment should remain the abstraction that represents real-world
email rendering.

The version should preserve reproducibility.

The lockfile should preserve project stability.

The snapshot system should detect regressions.

The CLI should make all of this feel like a normal developer testing tool.

================================================== 47. FINAL INSTRUCTION TO THE IMPLEMENTING AGENT
==================================================

The PoC has already proven that the core idea works.

Do not restart the project from scratch.

Do not replace the successful architecture merely because it was created as a PoC.

Instead:

1. Inspect the existing PoC.
2. Identify which components are already reusable.
3. Refactor only where necessary.
4. Stabilize the architecture.
5. Define the public developer interface.
6. Formalize environments and versioning.
7. Build reliable snapshots and regression testing.
8. Make the CLI pleasant to use.
9. Make CI execution reliable.
10. Package the project as a real developer tool.
11. Add environments based on value rather than quantity.
12. Document limitations honestly.
13. Release incrementally.

The next major goal is not "more email clients."

The next major goal is:

Turn the successful Cmail PoC into a reliable developer workflow that another developer can install, understand, integrate into a real email project, and trust in CI.

The ultimate test of this phase is:

A developer who has never seen the Cmail source code should be able to install Cmail, configure their email project, run a test, understand a rendering failure, update a snapshot intentionally, and commit Cmail into their CI pipeline.

Once that workflow is reliable, Cmail is no longer merely a successful PoC.

It is a real developer product.
