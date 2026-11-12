# Country Search — Design Decisions

## 1. Request Cancellation and Race Conditions

The application uses `AbortController` to cancel outdated network requests.

In `src/searchController.ts`, the `setQuery()` method cancels the pending debounce timer and immediately aborts the active request whenever the user changes the search input.

Cancellation happens before the next debounced request starts. This is important because an outdated response could arrive during the 300 ms debounce delay and display results that no longer match the current input.

The application combines two abort signals using `AbortSignal.any()`:

- `AbortController.signal` cancels requests when the user changes the input.
- `AbortSignal.timeout(5000)` cancels requests that take longer than five seconds.

An `AbortError` caused by user input is handled silently because it is an expected cancellation, not a failure.

A timeout is treated as a real error, so the application displays an error message and allows the user to retry.

Using `AbortController` is preferable to checking a boolean flag or comparing request timestamps because it actually cancels the previous request instead of merely ignoring its result.

The behavior is covered by `src/searchController.test.ts` and `src/searchRace.test.ts`.

## 2. Debounce Strategy

The application uses a custom `debounce()` function implemented in `src/debounce.ts`, without third-party libraries.

The function uses `setTimeout()` to delay execution and `clearTimeout()` to reset the timer when another call occurs before the delay expires.

It also provides a `cancel()` method to stop a pending invocation.

In `src/searchController.ts`, the debounce delay is **300 milliseconds**.

This value balances responsiveness and network efficiency:

- Without debounce, typing several characters could trigger a separate API request for each character, increasing unnecessary network traffic.
- With a much longer delay, such as 1000 ms, users would experience a noticeable pause before the search starts.
- A 300 ms delay reduces unnecessary requests while keeping the interface responsive.

Importantly, debounce and request cancellation solve different problems.

Debounce delays new requests, while `AbortController` cancels requests that have already started.

In `SearchController.setQuery()`, the pending debounce timer is cancelled and the active request is aborted immediately. The application does not wait another 300 ms before cancelling an outdated request.

The debounce behavior is covered by `src/debounce.test.ts`, and its integration with request cancellation is tested in `src/searchController.test.ts`.

## 3. Time and Space Complexity

The `mapCountryResponse()` function is implemented in `src/mapCountryResponse.ts`.

It converts a raw API response into a simplified `Country` object suitable for rendering in the UI.

Most properties, including `name`, `flag`, `capital`, `region`, `population`, `area`, `borders`, and `subregion`, are copied directly. Each property assignment takes constant time, O(1).

Two properties require array transformations:

- `languages` is transformed using `.map()` to extract language names.
- `currencies` is transformed using optional chaining and `.map()` to extract currency names.

Let:

- `L` be the number of languages.
- `C` be the number of currencies.

**Time complexity: O(L + C).**

Each array is traversed once. There are no nested loops, so the processing time grows linearly with the total number of languages and currencies.

**Auxiliary space complexity: O(L + C).**

The function creates new arrays for language and currency names. The other properties are copied without creating additional collections.

The function does not mutate the original API response.

Caching and in-flight request deduplication are not implemented, so no cache complexity analysis is required.

## 4. Clean Code Principles

The project follows several clean code principles to make the application easier to understand, test, and maintain.

### Single Responsibility Principle (SRP)

Different parts of the application have separate responsibilities:

- `src/debounce.ts` — delays function execution and manages the debounce timer.
- `src/searchCountries.ts` — communicates with the countries.dev API and handles HTTP responses.
- `src/mapCountryResponse.ts` — transforms raw API data into a simplified country object.
- `src/searchController.ts` — coordinates search requests, cancellation, timeouts, and application states.
- `src/main.ts` — creates DOM elements and updates the user interface.

This separation makes it possible to modify one part of the application without unnecessarily changing unrelated functionality.

### Pure Functions

The `mapCountryResponse()` function is pure.

It returns a new object based on its input, does not modify the original response, and does not perform network requests or DOM operations.

For the same input, it produces the same output.

### Separation of Concerns

Network requests, data transformation, search state management, and DOM rendering are implemented in separate modules.

For example, `SearchController` communicates with the UI through a state-change callback rather than directly manipulating HTML elements.

This allows the search logic to be tested without a browser.

### Meaningful Naming

Functions and variables use descriptive names that communicate their purpose.

Examples include:

- `searchCountries()` — fetches matching countries.
- `mapCountryResponse()` — transforms API data.
- `cancelActiveRequest()` — aborts the active request.
- `setQuery()` — processes changes to the search input.
- `activeController` — stores the controller for the current request.

### Explicit State and Error Handling

The `SearchState` union type in `src/searchController.ts` defines the possible application states: `idle`, `loading`, `success`, `empty`, and `error`.

This makes state transitions explicit and helps prevent invalid combinations of UI states.

The application also distinguishes expected request cancellation from real failures.

An `AbortError` is handled silently, while network failures, HTTP errors, and timeouts result in an error state.

### Testability

The core logic is independent of the DOM and is tested using Vitest.

Tests use mocked `fetch` responses and fake timers instead of real network requests or delays.

This makes tests faster, more predictable, and easier to reproduce.

The test files include `src/debounce.test.ts`, `src/searchCountries.test.ts`, `src/mapCountryResponse.test.ts`, `src/searchController.test.ts`, `src/classifySearchResult.test.ts`, and `src/searchRace.test.ts`.
