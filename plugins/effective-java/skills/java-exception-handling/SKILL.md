---
name: java-exception-handling
description: Handle Java exceptions correctly (checked vs unchecked, standard exceptions, failure atomicity, documentation)
---

# Java Exception Handling (Effective Java Items 69-77)

Apply these patterns when working with exceptions.

## Item 69: Use Exceptions Only for Exceptional Conditions

- **Never use exceptions for ordinary control flow** - they are designed for exceptional circumstances only
- **Do NOT use exception-based loops** - they are slower, obscure intent, and can mask bugs
- **A well-designed API must not force clients to use exceptions for ordinary control flow**
- For state-dependent methods, provide one of:
  1. **State-testing method** (e.g., `hasNext()` before `next()`) - preferred for single-threaded use
  2. **Optional return value** - good when no additional failure info needed
  3. **Distinguished return value** (e.g., `null`) - for concurrent access or performance-critical code
- Use optional/distinguished value if object accessed concurrently without synchronization or subject to external state transitions
- Use state-testing method when neither of above applies - offers better readability and easier bug detection

```java
// BAD: Exception-based loop
try {
    int i = 0;
    while(true)
        range[i++].climb();
} catch (ArrayIndexOutOfBoundsException e) { }

// GOOD: Standard idiom
for (Mountain m : range)
    m.climb();
```

## Item 70: Use Checked Exceptions for Recoverable Conditions and Runtime Exceptions for Programming Errors

- **Use checked exceptions for conditions from which the caller can reasonably be expected to recover**
- **Use runtime exceptions for programming errors** (precondition violations)
- **All unchecked throwables you implement should subclass `RuntimeException`** (directly or indirectly)
- **Never define `Error` subclasses** - errors are reserved for JVM resource deficiencies
- **Never throw `Error` or its subclasses** (except `AssertionError`)
- **Never define throwables that are not subclasses of `Exception`, `RuntimeException`, or `Error`**
- **Provide accessor methods on checked exceptions** to furnish information that helps callers recover
- Do NOT parse exception string representations - use accessor methods instead

```java
// GOOD: Checked exception with recovery information
public class InsufficientFundsException extends Exception {
    private final BigDecimal shortfall;

    public InsufficientFundsException(BigDecimal shortfall) {
        super("Shortfall: " + shortfall);
        this.shortfall = shortfall;
    }

    public BigDecimal getShortfall() { return shortfall; }
}
```

## Item 71: Avoid Unnecessary Use of Checked Exceptions

- **Use checked exception only when BOTH conditions are met:**
  1. The exceptional condition cannot be prevented by proper use of the API
  2. The programmer using the API can take some useful action once confronted with the exception
- **If callers will just wrap in `AssertionError` or `System.exit(1)`, use unchecked exception**
- Checked exceptions in methods **cannot be used directly in streams** (Java 8+)
- **Consider returning an `Optional`** instead of throwing checked exception (but loses detailed failure info)
- **Consider splitting into state-testing method + unchecked exception:**

```java
// Instead of:
try {
    obj.action(args);
} catch (TheCheckedException e) {
    // Handle exceptional condition
}

// Consider:
if (obj.actionPermitted(args)) {
    obj.action(args);
} else {
    // Handle exceptional condition
}
```

- State-testing approach is NOT appropriate for concurrent access or when it would duplicate work of the action method

## Item 72: Favor the Use of Standard Exceptions

**Most commonly reused exceptions:**

| Exception                         | Occasion for Use                                    |
| --------------------------------- | --------------------------------------------------- |
| `IllegalArgumentException`        | Non-null parameter value is inappropriate           |
| `IllegalStateException`           | Object state is inappropriate for method invocation |
| `NullPointerException`            | Parameter value is null where prohibited            |
| `IndexOutOfBoundsException`       | Index parameter value is out of range               |
| `ConcurrentModificationException` | Concurrent modification detected where prohibited   |
| `UnsupportedOperationException`   | Object does not support method                      |

**Rules:**

- **Do NOT reuse `Exception`, `RuntimeException`, `Throwable`, or `Error` directly** - treat as abstract
- **Throw `IllegalStateException` if no argument values would have worked**, otherwise throw `IllegalArgumentException`
- Reuse must be based on **documented semantics, not just on name**
- May subclass standard exceptions to add more detail (but remember exceptions are serializable)
- Also consider `ArithmeticException`, `NumberFormatException` where appropriate

## Item 73: Throw Exceptions Appropriate to the Abstraction

- **Use exception translation**: catch lower-level exceptions and throw exceptions explained in terms of the higher-level abstraction
- **Use exception chaining** when lower-level exception might help debugging - pass as cause

```java
// Exception Translation
try {
    ... // Use lower-level abstraction
} catch (LowerLevelException e) {
    throw new HigherLevelException(...);
}

// Exception Chaining
try {
    ... // Use lower-level abstraction
} catch (LowerLevelException cause) {
    throw new HigherLevelException(cause);
}
```

- **Do NOT overuse exception translation** - best approach in order of preference:
  1. Prevent lower-level exceptions (validate parameters before passing to lower layers)
  2. Have higher layer silently work around and log the exception
  3. Use exception translation
- Most standard exceptions have chaining-aware constructors; use `initCause()` for those that don't

```java
// Exception with chaining-aware constructor
class HigherLevelException extends Exception {
    HigherLevelException(Throwable cause) {
        super(cause);
    }
}
```

## Item 74: Document All Exceptions Thrown by Each Method

- **Declare checked exceptions individually** using the Javadoc `@throws` tag
- **Do NOT declare that a method throws `Exception` or `Throwable`** (except `main`)
- **Document unchecked exceptions** as carefully as checked - describes preconditions for successful execution
- **Use `@throws` tag for all exceptions** (checked and unchecked) in Javadoc
- **Do NOT use `throws` keyword in method declaration for unchecked exceptions** - visual cue to programmer
- **Document unchecked exceptions in interfaces** - part of interface's general contract
- If an exception is thrown by many methods for the same reason, document in class-level Javadoc instead

```java
/**
 * Returns the element at the specified position in this list.
 *
 * @param  index index of element to return; must be non-negative
 *         and less than the size of this list
 * @return the element at the specified position
 * @throws IndexOutOfBoundsException if index is out of range
 *         ({@code index < 0 || index >= size()})
 */
E get(int index);
```

## Item 75: Include Failure-Capture Information in Detail Messages

- **Include values of all parameters and fields that contributed to the exception**
- **Do NOT include security-sensitive information** (passwords, encryption keys)
- Detail messages are for **developers/SREs, not end users** - information content over prose
- **Do NOT confuse with user-level error messages** - those must be intelligible and often localized
- **Require failure-capture information in exception constructors** to ensure it's captured

```java
public IndexOutOfBoundsException(int lowerBound, int upperBound, int index) {
    // Generate a detail message that captures the failure
    super(String.format(
        "Lower bound: %d, Upper bound: %d, Index: %d",
        lowerBound, upperBound, index));

    // Save failure information for programmatic access
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.index = index;
}
```

- **Provide accessor methods for failure-capture information** (especially important for checked exceptions)

## Item 76: Strive for Failure Atomicity

- **A failed method invocation should leave the object in the state it was in prior to invocation**
- Especially important for checked exceptions (caller expected to recover)

**Ways to achieve failure atomicity (in order of preference):**

1. **Use immutable objects** - failure atomicity is free (state can't change after creation)
2. **Check parameters for validity before performing operation** - most exceptions thrown before modification

```java
public Object pop() {
    if (size == 0)
        throw new EmptyStackException();  // Check before modification
    Object result = elements[--size];
    elements[size] = null;
    return result;
}
```

3. **Order computation so failing parts occur before any object modification**
4. **Perform operation on temporary copy**, then replace object contents on success
5. **Write recovery code** to roll back state (mainly for disk-based structures)

**When failure atomicity is not achievable:**

- Concurrent modification without synchronization (object may be in inconsistent state)
- `AssertionError` and other `Error` types (unrecoverable)
- When it would significantly increase cost or complexity

**Rule:** If failure atomicity is not achieved, API documentation should clearly indicate what state the object will be left in.

## Item 77: Don't Ignore Exceptions

- **Never have empty catch blocks** - defeats the purpose of exceptions
- Ignoring an exception is like ignoring a fire alarm

```java
// BAD: Empty catch block - Highly suspect!
try {
    ...
} catch (SomeException e) {
}
```

- **If intentionally ignoring an exception:**
  1. Add a comment explaining why it is appropriate
  2. Name the variable `ignored`

```java
// GOOD: Justified ignoring with explanation
Future<Integer> f = exec.submit(planarMap::chromaticNumber);
int numColors = 4; // Default; guaranteed sufficient for any map
try {
    numColors = f.get(1L, TimeUnit.SECONDS);
} catch (TimeoutException | ExecutionException ignored) {
    // Use default: minimal coloring is desirable, not required
}
```

- Applies equally to **checked and unchecked exceptions**
- Empty catch blocks cause programs to **continue silently in the face of error** and fail at arbitrary times later
