---
name: java-general-programming
description: Apply Java general programming best practices (variable scope, for-each loops, libraries, primitives, strings, naming)
---

# Java General Programming (Effective Java Items 57-68)

Apply these general programming best practices.

## Item 57: Minimize the Scope of Local Variables

- **Declare variables where they are first used** - not at the beginning of a block
- **Nearly every local variable declaration should contain an initializer**
- Exception: if initialization requires a try-catch, declare before try block if needed outside
- **Prefer for loops to while loops** - for loops limit variable scope to the loop body

```java
// BAD: while loop - variable i remains in scope after loop
Iterator<Element> i = c.iterator();
while (i.hasNext()) {
    doSomething(i.next());
}
// i is still in scope here - copy-paste errors possible

// GOOD: for loop - variable i scoped to loop only
for (Iterator<Element> i = c.iterator(); i.hasNext(); ) {
    Element e = i.next();
    // ...
}
// i is not in scope here - safer
```

- **Cache expensive computations in loop variables:**

```java
for (int i = 0, n = expensiveComputation(); i < n; i++) {
    // n computed once, not on every iteration
}
```

- **Keep methods small and focused** - separates variable scopes naturally

## Item 58: Prefer for-each Loops to Traditional for Loops

- **Use for-each loops for all collections and arrays** - cleaner, safer, no performance penalty
- Hides iterator/index variable, eliminating clutter and opportunity for error

```java
// GOOD: for-each loop
for (Element e : elements) {
    // Do something with e
}

// GOOD: Nested iteration - no bugs possible
for (Suit suit : suits)
    for (Rank rank : ranks)
        deck.add(new Card(suit, rank));
```

**Three situations where you can't use for-each:**

1. **Destructive filtering** - need iterator's `remove()` method (or use `Collection.removeIf()` in Java 8+)
2. **Transforming** - need list iterator or array index to replace elements
3. **Parallel iteration** - need explicit control over multiple iterators/indices

- **Implement `Iterable`** for types representing groups of elements to enable for-each

## Item 59: Know and Use the Libraries

- **Use standard library facilities** instead of ad hoc implementations
- Benefits: expert knowledge, tested by millions, performance improvements over time, new features added
- **Use `ThreadLocalRandom`** instead of `Random` (Java 7+) - faster, higher quality
- **Use `SplittableRandom`** for fork-join pools and parallel streams
- **Know these packages well:** `java.lang`, `java.util`, `java.io`, and their subpackages
- **Essential libraries:** collections framework, streams (Items 45-48), `java.util.concurrent` (Items 80-81)
- Use high-quality third-party libraries (e.g., Guava) when platform libraries don't meet needs

```java
// Java 9+: Use InputStream.transferTo()
try (InputStream in = new URL(url).openStream()) {
    in.transferTo(System.out);
}
```

## Item 60: Avoid float and double if Exact Answers Are Required

- **Never use float or double for monetary calculations** - cannot represent 0.1 exactly
- **Use `BigDecimal`** for exact decimal calculations (use String constructor, not double)
- **Use `int` or `long`** for performance when tracking decimal point yourself

```java
// BAD: Floating-point arithmetic
System.out.println(1.03 - 0.42);  // Prints 0.6100000000000001

// GOOD: BigDecimal with String constructor
BigDecimal funds = new BigDecimal("1.00");
BigDecimal price = new BigDecimal("0.10");
funds = funds.subtract(price);  // Exact result

// GOOD: int for cents (tracking decimal point yourself)
int funds = 100;  // cents
int price = 10;   // cents
funds -= price;   // Exact
```

**Choosing the right type:**

- `int`: up to 9 decimal digits
- `long`: up to 18 decimal digits
- `BigDecimal`: beyond 18 digits or when you need control over rounding

## Item 61: Prefer Primitive Types to Boxed Primitives

- **Use primitives over boxed primitives** - simpler and faster
- **Three key differences:**
  1. Primitives have only values; boxed primitives have identity distinct from value
  2. Primitives have only functional values; boxed have `null`
  3. Primitives are more time- and space-efficient

```java
// BAD: == on boxed primitives compares identity, not value
Comparator<Integer> naturalOrder = (i, j) -> (i < j) ? -1 : (i == j ? 0 : 1);
// Broken! i == j compares object references

// GOOD: Unbox to primitives first
Comparator<Integer> naturalOrder = (iBoxed, jBoxed) -> {
    int i = iBoxed, j = jBoxed;  // Auto-unboxing
    return i < j ? -1 : (i == j ? 0 : 1);
};
```

- **Applying `==` to boxed primitives is almost always wrong**
- **Mixing primitives and boxed primitives auto-unboxes** - can throw `NullPointerException`
- **Unintentional autoboxing causes performance problems** in loops

**Legitimate uses for boxed primitives:**

1. Elements, keys, and values in collections
2. Type parameters in parameterized types (`List<Integer>`, not `List<int>`)
3. Reflective method invocations

## Item 62: Avoid Strings Where Other Types Are More Appropriate

- **Strings are poor substitutes for other value types** - use numeric types, enums, booleans
- **Strings are poor substitutes for enum types** - use enums for enumerated constants
- **Strings are poor substitutes for aggregate types** - use classes

```java
// BAD: String as aggregate type
String compoundKey = className + "#" + i.next();  // Fragile!

// GOOD: Dedicated class
class CompoundKey {
    private final String className;
    private final String element;
    // ...
}
```

- **Strings are poor substitutes for capabilities** - use unforgeable key objects instead

```java
// BAD: String key for thread-local variable
public static void set(String key, Object value);  // Key collision possible

// GOOD: Typesafe, no collision
public final class ThreadLocal<T> {
    public void set(T value);
    public T get();
}
```

## Item 63: Beware the Performance of String Concatenation

- **String concatenation operator (+) is quadratic for n strings** - strings are immutable
- **Use `StringBuilder`** to build strings in loops

```java
// BAD: Quadratic time complexity
public String statement() {
    String result = "";
    for (int i = 0; i < numItems(); i++)
        result += lineForItem(i);  // Creates new String each iteration
    return result;
}

// GOOD: Linear time complexity
public String statement() {
    StringBuilder b = new StringBuilder(numItems() * LINE_WIDTH);
    for (int i = 0; i < numItems(); i++)
        b.append(lineForItem(i));
    return b.toString();
}
```

- Preallocate `StringBuilder` capacity if you know the size
- Concatenating a few strings with `+` is fine; avoid it in loops

## Item 64: Refer to Objects by Their Interfaces

- **Use interface types for parameters, return values, variables, and fields**
- Only use the class when creating with a constructor

```java
// GOOD: Interface as type - flexible
Set<Son> sonSet = new LinkedHashSet<>();

// BAD: Class as type - inflexible
LinkedHashSet<Son> sonSet = new LinkedHashSet<>();
```

- Allows easy implementation swapping: `new LinkedHashSet<>()` -> `new HashSet<>()`
- **Caveat:** If code depends on implementation-specific behavior (e.g., `LinkedHashSet` ordering), document it

**When to use classes instead of interfaces:**

1. **Value classes** with no interface (e.g., `String`, `BigInteger`)
2. **Class-based frameworks** - use the base class (e.g., `OutputStream`)
3. **Classes with extra methods** beyond the interface (use only if program relies on them)

**Rule:** Use the least specific class in the hierarchy that provides the required functionality

## Item 65: Prefer Interfaces to Reflection

- **Reflection disadvantages:**
  1. Lose compile-time type checking and exception checking
  2. Code is clumsy and verbose
  3. Performance is significantly slower

- **Use reflection only to instantiate objects**, then access via interface/superclass

```java
// Reflective instantiation with interface access
Class<? extends Set<String>> cl = (Class<? extends Set<String>>)
    Class.forName(args[0]);
Constructor<? extends Set<String>> cons = cl.getDeclaredConstructor();
Set<String> s = cons.newInstance();

// From here, use s through the Set interface - no more reflection
s.addAll(Arrays.asList(args).subList(1, args.length));
```

- Legitimate use: managing dependencies on classes that may be absent at runtime
- **If you must use reflection, minimize its scope** - instantiate reflectively, access normally

## Item 66: Use Native Methods Judiciously

- **Rarely advisable to use native methods for performance** - JVMs are now very fast
- Legitimate uses: accessing platform-specific facilities, using native libraries with no Java equivalent

**Native method disadvantages:**

- Not safe - memory corruption errors possible
- Less portable
- Harder to debug
- Performance overhead entering/exiting native code
- Difficult glue code required

**Rule:** Think twice before using native methods; if you must, use as little native code as possible and test thoroughly

## Item 67: Optimize Judiciously

- **Strive to write good programs, not fast ones** - speed will follow
- **Don't sacrifice sound architectural principles for performance**
- **Premature optimization is the root of all evil** (Knuth)

**Design considerations for performance:**

- **Avoid design decisions that limit performance** - especially APIs, wire-level protocols, persistent data formats
- **Consider performance consequences of API design:**
  - Making public types mutable may require defensive copying
  - Using inheritance where composition is appropriate limits performance
  - Using implementation types instead of interfaces ties to specific implementation

**Optimization process:**

1. Write a clear, well-structured program first
2. If not fast enough, **measure performance** before optimizing
3. Use profiling tools to find actual bottlenecks (90% of time in 10% of code)
4. **Fix algorithmic issues first** - no tuning can fix a quadratic algorithm
5. Measure again after each change - optimizations often have no effect or make things worse
6. Test on multiple platforms/implementations

## Item 68: Adhere to Generally Accepted Naming Conventions

**Typographical conventions:**

| Identifier Type | Convention                  | Examples                                              |
| --------------- | --------------------------- | ----------------------------------------------------- |
| Package/module  | lowercase, hierarchical     | `org.junit.jupiter.api`, `com.google.common.collect`  |
| Class/Interface | PascalCase                  | `Stream`, `FutureTask`, `LinkedHashMap`, `HttpClient` |
| Method/Field    | camelCase                   | `remove`, `groupingBy`, `getCrc`                      |
| Constant field  | UPPER_SNAKE_CASE            | `MIN_VALUE`, `NEGATIVE_INFINITY`                      |
| Local variable  | camelCase, abbreviations OK | `i`, `denom`, `houseNum`                              |
| Type parameter  | single letter               | `T`, `E`, `K`, `V`, `X`, `R`                          |

**Grammatical conventions:**

- **Classes:** singular noun/noun phrase (`Thread`, `PriorityQueue`)
- **Utility classes:** plural noun (`Collectors`, `Collections`)
- **Interfaces:** like classes or adjective ending in `-able`/`-ible` (`Runnable`, `Iterable`)
- **Methods performing actions:** verb/verb phrase (`append`, `drawImage`)
- **Boolean methods:** `is`/`has` prefix (`isEmpty`, `hasNext`, `isEnabled`)
- **Non-boolean getters:** noun or `get` prefix (`size`, `hashCode`, `getTime`)
- **Type converters:** `toType` (`toString`, `toArray`)
- **View methods:** `asType` (`asList`)
- **Primitive extraction:** `typeValue` (`intValue`)
- **Static factories:** `from`, `of`, `valueOf`, `instance`, `getInstance`, `newInstance`, `getType`, `newType`
