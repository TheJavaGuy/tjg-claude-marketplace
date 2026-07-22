---
name: java-lambdas-streams
description: Use Java lambdas and streams effectively (functional interfaces, method references, stream best practices, parallel streams)
---

# Java Lambdas and Streams (Effective Java Items 42-48)

Apply these patterns when working with lambdas and streams.

## Item 42: Prefer Lambdas to Anonymous Classes

- **Use lambdas for functional interfaces** - far more concise than anonymous classes
- Omit lambda parameter types unless their presence makes the program clearer
- **Keep lambdas short** - one line is ideal, three lines is a reasonable maximum
- If a lambda is long or difficult to read, extract it to a named method
- Lambdas in enum constructors can't access instance members (evaluated in static context)
- **Use constant-specific class bodies** if behavior is difficult to understand, can't be implemented in a few lines, or requires access to instance fields/methods

```java
// Anonymous class - verbose (obsolete)
Collections.sort(words, new Comparator<String>() {
    public int compare(String s1, String s2) {
        return Integer.compare(s1.length(), s2.length());
    }
});

// Lambda - concise
Collections.sort(words, (s1, s2) -> Integer.compare(s1.length(), s2.length()));

// Even better with comparator construction method
words.sort(comparingInt(String::length));
```

**When to use anonymous classes instead of lambdas:**

- Creating instances of abstract classes (not functional interfaces)
- Creating instances of interfaces with multiple abstract methods
- When you need a reference to the function object from within its body (`this` in lambda refers to enclosing instance)

**Rules:**

- **Never serialize lambdas** (or anonymous class instances) - use private static nested classes instead
- Use generics (Item 26, 29, 30) to enable type inference in lambdas

## Item 43: Prefer Method References to Lambdas

- **Use method references when they are shorter and clearer**
- Method references are more succinct and give clearer names to operations

```java
// Lambda
map.merge(key, 1, (count, incr) -> count + incr);

// Method reference - clearer
map.merge(key, 1, Integer::sum);
```

**Five kinds of method references:**

| Type              | Example                  | Lambda Equivalent              |
| ----------------- | ------------------------ | ------------------------------ |
| Static            | `Integer::parseInt`      | `str -> Integer.parseInt(str)` |
| Bound             | `Instant.now()::isAfter` | `t -> then.isAfter(t)`         |
| Unbound           | `String::toLowerCase`    | `str -> str.toLowerCase()`     |
| Class Constructor | `TreeMap<K,V>::new`      | `() -> new TreeMap<K,V>()`     |
| Array Constructor | `int[]::new`             | `len -> new int[len]`          |

**When lambdas are preferable:**

- When the method is in the same class as the lambda (long class names make method refs verbose)
- Identity function: prefer `x -> x` over `Function.identity()`
- When parameter names provide useful documentation

## Item 44: Favor the Use of Standard Functional Interfaces

- **Use standard functional interfaces from `java.util.function`** in preference to custom ones
- Reduces API conceptual surface area and provides interoperability benefits

**Six basic functional interfaces:**

| Interface           | Function Signature    | Example               |
| ------------------- | --------------------- | --------------------- |
| `UnaryOperator<T>`  | `T apply(T t)`        | `String::toLowerCase` |
| `BinaryOperator<T>` | `T apply(T t1, T t2)` | `BigInteger::add`     |
| `Predicate<T>`      | `boolean test(T t)`   | `Collection::isEmpty` |
| `Function<T,R>`     | `R apply(T t)`        | `Arrays::asList`      |
| `Supplier<T>`       | `T get()`             | `Instant::now`        |
| `Consumer<T>`       | `void accept(T t)`    | `System.out::println` |

**Primitive variants exist** for int, long, double (e.g., `IntPredicate`, `LongBinaryOperator`)

**When to write your own functional interface:**

- It will be commonly used and could benefit from a descriptive name
- It has a strong contract associated with it
- It would benefit from custom default methods

**Rules:**

- **Don't use basic functional interfaces with boxed primitives** - use primitive variants for performance
- **Always annotate functional interfaces with `@FunctionalInterface`**
- **Never overload methods with different functional interfaces in the same argument position** - causes ambiguity

## Item 45: Use Streams Judiciously

- Streams ease bulk operations but **don't convert all loops to streams**
- Stream pipelines are evaluated lazily; **don't forget the terminal operation**
- Calling `parallel()` is seldom appropriate (Item 48)

**Streams are good for:**

- Uniformly transforming sequences of elements
- Filtering sequences of elements
- Combining sequences using a single operation (add, concatenate, min)
- Accumulating elements into a collection, grouping by attribute
- Searching for elements satisfying a criterion

**Code blocks (iteration) are needed when you must:**

- Read or modify local variables (lambdas can only read final/effectively final)
- Return from enclosing method, break/continue loops, throw checked exceptions

**Best practices:**

- **Use helper methods** - even more important for readability in stream pipelines than iterative code
- **Name stream variables descriptively** - use plural nouns (e.g., `words`, `primes`)
- **Refrain from using streams to process char values** - `String.chars()` returns int stream

```java
// GOOD: Tasteful use of streams
try (Stream<String> words = Files.lines(dictionary)) {
    words.collect(groupingBy(word -> alphabetize(word)))
        .values().stream()
        .filter(group -> group.size() >= minGroupSize)
        .forEach(g -> System.out.println(g.size() + ": " + g));
}
```

**Rule:** If you're not sure whether streams or iteration is better, try both and see which works better.

## Item 46: Prefer Side-Effect-Free Functions in Streams

- **Structure computations as pure functions** - result depends only on input, no mutable state
- Function objects passed to stream operations should be free of side-effects

```java
// BAD: Uses streams API but not the paradigm - mutates external state
Map<String, Long> freq = new HashMap<>();
try (Stream<String> words = new Scanner(file).tokens()) {
    words.forEach(word -> {
        freq.merge(word.toLowerCase(), 1L, Long::sum);  // Mutates external state!
    });
}

// GOOD: Proper use of streams
Map<String, Long> freq;
try (Stream<String> words = new Scanner(file).tokens()) {
    freq = words.collect(groupingBy(String::toLowerCase, counting()));
}
```

**forEach rules:**

- **Use forEach only to report results**, not to perform computation
- If forEach does anything more than present results, it's a "bad smell in code"

**Essential collectors:**

- `toList()`, `toSet()`, `toCollection(collectionFactory)` - gather into Collection
- `toMap(keyMapper, valueMapper)` - simple map creation
- `toMap(keyMapper, valueMapper, mergeFunction)` - handles collisions
- `groupingBy(classifier)` - group elements by category
- `groupingBy(classifier, downstream)` - with downstream collector (e.g., `counting()`, `toSet()`)
- `joining()` - concatenate CharSequence elements

```java
// Get top 10 words by frequency
List<String> topTen = freq.keySet().stream()
    .sorted(comparing(freq::get).reversed())
    .limit(10)
    .collect(toList());
```

**Rule:** Statically import all members of `Collectors` for readable stream pipelines.

## Item 47: Prefer Collection to Stream as a Return Type

- **`Collection` or subtype is generally the best return type** for public sequence-returning methods
- Collection provides both iteration (for-each) and stream access (`stream()` method)
- Arrays provide both via `Arrays.asList()` and `Stream.of()`

**If sequence is small:** Return `ArrayList` or `HashSet`

**If sequence is large but can be represented concisely:** Implement a custom collection

```java
// Custom collection for power set - memory efficient
public static final <E> Collection<Set<E>> of(Set<E> s) {
    List<E> src = new ArrayList<>(s);
    if (src.size() > 30)
        throw new IllegalArgumentException("Set too big " + s);
    return new AbstractList<Set<E>>() {
        @Override public int size() { return 1 << src.size(); }
        @Override public Set<E> get(int index) {
            Set<E> result = new HashSet<>();
            for (int i = 0; index != 0; i++, index >>= 1)
                if ((index & 1) == 1)
                    result.add(src.get(i));
            return result;
        }
    };
}
```

**Adapter methods when needed:**

```java
// Stream to Iterable adapter
public static <E> Iterable<E> iterableOf(Stream<E> stream) {
    return stream::iterator;
}

// Iterable to Stream adapter
public static <E> Stream<E> streamOf(Iterable<E> iterable) {
    return StreamSupport.stream(iterable.spliterator(), false);
}
```

**Rules:**

- Don't store large sequences in memory just to return as a collection
- If infeasible to return a collection, return a stream or iterable (whichever feels more natural)

## Item 48: Use Caution When Making Streams Parallel

- **Do not parallelize stream pipelines indiscriminately** - performance consequences can be disastrous
- Parallelism is unlikely to help if source is from `Stream.iterate` or intermediate operation `limit` is used

**Parallelism works best with:**

- `ArrayList`, `HashMap`, `HashSet`, `ConcurrentHashMap`
- Arrays, int ranges, long ranges
- Data structures that are accurately and cheaply splittable
- Data structures with good locality of reference (primitive arrays are best)

**Best terminal operations for parallelism:**

- Reductions: `reduce()`, `min()`, `max()`, `count()`, `sum()`
- Short-circuiting: `anyMatch()`, `allMatch()`, `noneMatch()`
- **Avoid:** `collect()` (mutable reductions) - overhead of combining collections is costly

```java
// GOOD candidate for parallelism - benefits from parallel()
static long pi(long n) {
    return LongStream.rangeClosed(2, n)
        .parallel()
        .mapToObj(BigInteger::valueOf)
        .filter(i -> i.isProbablePrime(50))
        .count();
}
```

**Safety requirements for parallel streams:**

- Accumulator and combiner functions must be associative, non-interfering, and stateless
- Use `forEachOrdered()` instead of `forEach()` to preserve encounter order

**Rules:**

- **Test performance before and after parallelization** - measure under realistic conditions
- All parallel stream pipelines share a common fork-join pool - one misbehaving pipeline affects others
- For random number streams, use `SplittableRandom` (not `ThreadLocalRandom` or `Random`)
- Only parallelize when you have good reason to believe it will preserve correctness AND increase speed
