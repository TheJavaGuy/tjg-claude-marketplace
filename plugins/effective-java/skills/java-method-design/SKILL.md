---
name: java-method-design
description: Design Java methods correctly (parameter validation, defensive copies, optionals, overloading, varargs)
---

# Java Method Design (Effective Java Items 49-56)

Apply these patterns when designing methods.

## Item 49: Check Parameters for Validity

- **Check parameters for validity at the beginning of method body** - detect errors early
- Document parameter restrictions with `@throws` tag (typically `IllegalArgumentException`, `IndexOutOfBoundsException`, `NullPointerException`)
- **Use `Objects.requireNonNull()`** for null checks - flexible, can be used inline

```java
this.strategy = Objects.requireNonNull(strategy, "strategy");
```

- Use Java 9+ range-checking: `Objects.checkFromIndexSize()`, `checkFromToIndex()`, `checkIndex()`
- **For private methods, use assertions** instead of explicit checks

```java
private static void sort(long a[], int offset, int length) {
    assert a != null;
    assert offset >= 0 && offset <= a.length;
    assert length >= 0 && length <= a.length - offset;
    // ...
}
```

- **Especially important**: check validity of parameters stored for later use (constructors, factory methods)
- **Exception**: when validity check is expensive and performed implicitly during computation (e.g., `Collections.sort()` implicitly checks `Comparable`)
- Use exception translation if computation throws wrong exception type

## Item 50: Make Defensive Copies When Needed

- **Program defensively** - assume clients will do their best to destroy invariants
- **Make defensive copies of mutable parameters** before storing them

```java
// Repaired constructor - makes defensive copies
public Period(Date start, Date end) {
    this.start = new Date(start.getTime());  // Copy before validation
    this.end = new Date(end.getTime());

    if (this.start.compareTo(this.end) > 0)
        throw new IllegalArgumentException(this.start + " after " + this.end);
}
```

**Critical rules:**

- **Copy before validation** (prevents TOCTOU attacks) - validate the copies, not originals
- **Do NOT use `clone()` for defensive copies** of parameters whose type can be subclassed by untrusted parties
- **Return defensive copies of mutable internal fields**

```java
public Date start() {
    return new Date(start.getTime());  // Defensive copy
}
```

- In accessors, `clone()` is safe (we know the actual type)
- **Best approach**: use immutable components when possible (`Instant` instead of `Date`)
- May skip defensive copying if class trusts its caller (same package, documented contract)

## Item 51: Design Method Signatures Carefully

- **Choose method names carefully** - understandable, consistent with package and broader conventions
- **Don't go overboard with convenience methods** - each method should "pull its weight"
- **Avoid long parameter lists** - aim for 4 parameters or fewer
  - Long sequences of identically typed parameters are especially harmful

**Techniques for shortening parameter lists:**

1. **Break method into multiple methods** with fewer parameters each
2. **Create helper classes** (static member classes) to hold groups of parameters
3. **Adapt Builder pattern** for method invocation - object with setters + execute method

**Parameter type guidelines:**

- **Favor interfaces over classes** for parameter types (`Map` instead of `HashMap`)
- **Prefer two-element enum types over boolean parameters** (unless meaning is obvious)

```java
// BAD: Boolean meaning unclear
Thermometer.newInstance(true);

// GOOD: Self-documenting
public enum TemperatureScale { FAHRENHEIT, CELSIUS }
Thermometer.newInstance(TemperatureScale.CELSIUS);
```

## Item 52: Use Overloading Judiciously

- **Overloading selection is static (compile-time)**, overriding selection is dynamic (runtime)
- **Avoid confusing uses of overloading** - users shouldn't need to know which overloading applies

```java
// BAD: Confusing - always prints "Unknown Collection" three times
public static String classify(Set<?> s) { return "Set"; }
public static String classify(List<?> lst) { return "List"; }
public static String classify(Collection<?> c) { return "Unknown Collection"; }

// GOOD: Use explicit instanceof checks
public static String classify(Collection<?> c) {
    return c instanceof Set ? "Set" :
           c instanceof List ? "List" : "Unknown Collection";
}
```

**Safe practices:**

- **Never export two overloadings with the same number of parameters** (conservative but safe)
- **Use different method names** instead of overloading (e.g., `writeBoolean`, `writeInt`, `writeLong`)
- For constructors: consider static factories instead (Item 1)
- Overloadings with same parameter count are OK if parameters are "radically different" types (can't cast between them)
- **Do NOT overload methods to take different functional interfaces** in the same argument position
- If must violate guidelines: ensure all overloadings behave identically when passed same parameters (forward to most general)

```java
public boolean contentEquals(StringBuffer sb) {
    return contentEquals((CharSequence) sb);  // Forward to general overloading
}
```

## Item 53: Use Varargs Judiciously

- Varargs creates an array on every invocation
- **For one or more required arguments**, use regular parameter + varargs

```java
// BAD: Fails at runtime if no arguments
static int min(int... args) {
    if (args.length == 0)
        throw new IllegalArgumentException("Too few arguments");
    // ...
}

// GOOD: Compile-time enforcement of at least one argument
static int min(int firstArg, int... remainingArgs) {
    int min = firstArg;
    for (int arg : remainingArgs)
        if (arg < min)
            min = arg;
    return min;
}
```

- **Performance optimization**: provide fixed-arity overloadings for common cases

```java
public void foo() { }
public void foo(int a1) { }
public void foo(int a1, int a2) { }
public void foo(int a1, int a2, int a3) { }
public void foo(int a1, int a2, int a3, int... rest) { }
```

## Item 54: Return Empty Collections or Arrays, Not Nulls

- **Never return null instead of an empty collection or array**
- Returning null requires special-case code in every client and causes bugs

```java
// BAD: Returns null
public List<Cheese> getCheeses() {
    return cheesesInStock.isEmpty() ? null : new ArrayList<>(cheesesInStock);
}

// GOOD: Returns empty collection
public List<Cheese> getCheeses() {
    return new ArrayList<>(cheesesInStock);
}

// GOOD: Optimization if needed (rarely)
public List<Cheese> getCheeses() {
    return cheesesInStock.isEmpty() ? Collections.emptyList()
        : new ArrayList<>(cheesesInStock);
}
```

**For arrays:**

```java
// GOOD: Returns possibly empty array
public Cheese[] getCheeses() {
    return cheesesInStock.toArray(new Cheese[0]);
}

// Optimization: Reuse empty array
private static final Cheese[] EMPTY_CHEESE_ARRAY = new Cheese[0];
public Cheese[] getCheeses() {
    return cheesesInStock.toArray(EMPTY_CHEESE_ARRAY);
}

// BAD: Don't preallocate - counterproductive
return cheesesInStock.toArray(new Cheese[cheesesInStock.size()]);
```

## Item 55: Return Optionals Judiciously

- **Use `Optional<T>`** for methods that might not be able to return a value and where clients must handle this
- **Never return null from an Optional-returning method**
- Create optionals with `Optional.empty()`, `Optional.of(value)`, or `Optional.ofNullable(value)`

```java
public static <E extends Comparable<E>> Optional<E> max(Collection<E> c) {
    if (c.isEmpty())
        return Optional.empty();
    E result = null;
    for (E e : c)
        if (result == null || e.compareTo(result) > 0)
            result = Objects.requireNonNull(e);
    return Optional.of(result);
}
```

**Processing optionals:**

```java
// Default value
String lastWord = max(words).orElse("No words...");

// Throw exception (lazy - factory, not actual exception)
Toy myToy = max(toys).orElseThrow(TemperTantrumException::new);

// When you know it's present (throws NoSuchElementException if wrong)
Element lastNobleGas = max(Elements.NOBLE_GASES).get();

// Expensive default - computed only if needed
orElseGet(Supplier<T>)

// Advanced: filter, map, flatMap, ifPresent, or, ifPresentOrElse
```

**Rules:**

- **Do NOT wrap container types in Optional** (collections, maps, streams, arrays, optionals) - return empty container instead
- **Never return an optional of a boxed primitive** - use `OptionalInt`, `OptionalLong`, `OptionalDouble`
- **Do NOT use optionals as map values, keys, or collection/array elements**
- Storing optional in instance field is usually a "bad smell" (consider subclass)
- Optionals have allocation cost - not for performance-critical code

## Item 56: Write Doc Comments for All Exposed API Elements

- **Precede every exported class, interface, constructor, method, and field** with a doc comment
- Document serialized form for serializable classes
- Public classes should not use default constructors (can't document them)

**Method documentation should include:**

- **Preconditions** (via `@throws` for unchecked exceptions, `@param` tags)
- **Postconditions** (what will be true after successful invocation)
- **Side effects** (observable state changes not required for postcondition)
- `@param` tag for every parameter
- `@return` tag (unless void)
- `@throws` tag for every exception (checked and unchecked)

```java
/**
 * Returns the element at the specified position in this list.
 *
 * <p>This method is <i>not</i> guaranteed to run in constant time.
 *
 * @param  index index of element to return; must be non-negative
 *         and less than the size of this list
 * @return the element at the specified position in this list
 * @throws IndexOutOfBoundsException if the index is out of range
 *         ({@code index < 0 || index >= this.size()})
 */
E get(int index);
```

**Formatting conventions:**

- Use `{@code}` for code fragments (renders in code font, suppresses HTML processing)
- Use `{@literal}` to escape HTML metacharacters (`<`, `>`, `&`)
- Use `@implSpec` to document self-use patterns for inheritance
- First sentence becomes summary description (ends at first period + space)

**Special documentation requirements:**

- **Generic types**: document all type parameters with `@param <T>`
- **Enum types**: document the type AND each constant
- **Annotation types**: document the type AND each member
- **Thread-safety**: always document thread-safety level (Item 82)
- **Serializability**: document serialized form (Item 87)
