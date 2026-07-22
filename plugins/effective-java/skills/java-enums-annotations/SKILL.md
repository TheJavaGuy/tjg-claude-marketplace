---
name: java-enums-annotations
description: Use Java enums and annotations effectively (EnumSet, EnumMap, extensible enums, custom annotations)
---

# Java Enums and Annotations (Effective Java Items 34-41)

Apply these patterns when working with enums and annotations.

## Item 34: Use Enums Instead of int Constants

- **Never use the int enum pattern** (`public static final int`) - no type safety, no namespace, brittle
- **Never use the String enum pattern** - leads to hard-coded strings, performance issues
- **Use Java enum types** - they are full-fledged classes with type safety, namespace, and methods
- Enum types are instance-controlled and effectively final (no accessible constructors)
- Enums provide compile-time type safety and their own namespace

**Associate data with enum constants using instance fields:**

```java
public enum Planet {
    MERCURY(3.302e+23, 2.439e6),
    VENUS  (4.869e+24, 6.052e6),
    EARTH  (5.975e+24, 6.378e6);

    private final double mass;
    private final double radius;
    private final double surfaceGravity;
    private static final double G = 6.67300E-11;

    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
        surfaceGravity = G * mass / (radius * radius);
    }

    public double mass() { return mass; }
    public double surfaceGravity() { return surfaceGravity; }
}
```

**Use constant-specific method implementations for behavior that varies by constant:**

```java
public enum Operation {
    PLUS("+")   { public double apply(double x, double y) { return x + y; } },
    MINUS("-")  { public double apply(double x, double y) { return x - y; } },
    TIMES("*")  { public double apply(double x, double y) { return x * y; } },
    DIVIDE("/") { public double apply(double x, double y) { return x / y; } };

    private final String symbol;
    Operation(String symbol) { this.symbol = symbol; }
    @Override public String toString() { return symbol; }

    public abstract double apply(double x, double y);
}
```

**Use the strategy enum pattern for shared behavior among subsets of constants:**

```java
enum PayrollDay {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY,
    SATURDAY(PayType.WEEKEND), SUNDAY(PayType.WEEKEND);

    private final PayType payType;
    PayrollDay(PayType payType) { this.payType = payType; }
    PayrollDay() { this(PayType.WEEKDAY); }  // Default

    int pay(int minutesWorked, int payRate) {
        return payType.pay(minutesWorked, payRate);
    }

    private enum PayType {
        WEEKDAY { int overtimePay(int mins, int rate) { /* weekday logic */ } },
        WEEKEND { int overtimePay(int mins, int rate) { /* weekend logic */ } };
        abstract int overtimePay(int mins, int rate);
    }
}
```

**Rules:**

- Enums are immutable - all fields should be `final`
- Make fields `private` and provide accessors
- If an enum is generally useful, make it top-level; if tied to one class, make it a member class
- Use switch on enums only to augment external enums with constant-specific behavior
- Consider providing a `fromString` method if you override `toString`

## Item 35: Use Instance Fields Instead of Ordinals

- **Never derive a value associated with an enum from its ordinal**
- Ordinal-based code breaks if constants are reordered or new constants are added
- Cannot have multiple constants with the same associated value using ordinals
- Cannot add constants for values without adding all intervening values

```java
// BAD: Using ordinal
public enum Ensemble {
    SOLO, DUET, TRIO, QUARTET, QUINTET;
    public int numberOfMusicians() { return ordinal() + 1; }  // Fragile!
}

// GOOD: Using instance field
public enum Ensemble {
    SOLO(1), DUET(2), TRIO(3), QUARTET(4), QUINTET(5),
    SEXTET(6), SEPTET(7), OCTET(8), DOUBLE_QUARTET(8),
    NONET(9), DECTET(10), TRIPLE_QUARTET(12);

    private final int numberOfMusicians;
    Ensemble(int size) { this.numberOfMusicians = size; }
    public int numberOfMusicians() { return numberOfMusicians; }
}
```

**Rule:** The `ordinal()` method is designed for use by `EnumSet` and `EnumMap` - avoid it in application code.

## Item 36: Use EnumSet Instead of Bit Fields

- **Never use the int bit field pattern** (`STYLE_BOLD = 1 << 0`) - all disadvantages of int enums plus harder to interpret
- **Use `EnumSet`** - efficient bit vector representation with full `Set` interface

```java
// BAD: Bit field pattern
public class Text {
    public static final int STYLE_BOLD          = 1 << 0;  // 1
    public static final int STYLE_ITALIC        = 1 << 1;  // 2
    public static final int STYLE_UNDERLINE     = 1 << 2;  // 4
    public static final int STYLE_STRIKETHROUGH = 1 << 3;  // 8

    public void applyStyles(int styles) { ... }
}
// Usage: text.applyStyles(STYLE_BOLD | STYLE_ITALIC);

// GOOD: EnumSet
public class Text {
    public enum Style { BOLD, ITALIC, UNDERLINE, STRIKETHROUGH }

    public void applyStyles(Set<Style> styles) { ... }
}
// Usage: text.applyStyles(EnumSet.of(Style.BOLD, Style.ITALIC));
```

**Rules:**

- Accept `Set<Style>` (interface type) rather than `EnumSet<Style>` in method parameters
- EnumSet uses a single `long` for enums with 64 or fewer elements - comparable performance to bit fields
- To create immutable EnumSet, wrap with `Collections.unmodifiableSet()`

## Item 37: Use EnumMap Instead of Ordinal Indexing

- **Never use `ordinal()` to index into arrays** - no type safety, requires manual labeling, risk of `ArrayIndexOutOfBoundsException`
- **Use `EnumMap`** - type-safe, fast (uses array internally), self-documenting

```java
// BAD: Ordinal indexing
Set<Plant>[] plantsByLifeCycle =
    (Set<Plant>[]) new Set[Plant.LifeCycle.values().length];
for (int i = 0; i < plantsByLifeCycle.length; i++)
    plantsByLifeCycle[i] = new HashSet<>();
for (Plant p : garden)
    plantsByLifeCycle[p.lifeCycle.ordinal()].add(p);

// GOOD: EnumMap
Map<Plant.LifeCycle, Set<Plant>> plantsByLifeCycle =
    new EnumMap<>(Plant.LifeCycle.class);
for (Plant.LifeCycle lc : Plant.LifeCycle.values())
    plantsByLifeCycle.put(lc, new HashSet<>());
for (Plant p : garden)
    plantsByLifeCycle.get(p.lifeCycle).add(p);

// BETTER: Stream with EnumMap
System.out.println(Arrays.stream(garden)
    .collect(groupingBy(p -> p.lifeCycle,
        () -> new EnumMap<>(LifeCycle.class), toSet())));
```

**For multi-dimensional relationships, use nested EnumMaps:**

```java
public enum Phase {
    SOLID, LIQUID, GAS;

    public enum Transition {
        MELT(SOLID, LIQUID), FREEZE(LIQUID, SOLID),
        BOIL(LIQUID, GAS),   CONDENSE(GAS, LIQUID),
        SUBLIME(SOLID, GAS), DEPOSIT(GAS, SOLID);

        private final Phase from;
        private final Phase to;

        Transition(Phase from, Phase to) {
            this.from = from;
            this.to = to;
        }

        private static final Map<Phase, Map<Phase, Transition>> m =
            Stream.of(values()).collect(groupingBy(t -> t.from,
                () -> new EnumMap<>(Phase.class),
                toMap(t -> t.to, t -> t,
                    (x, y) -> y, () -> new EnumMap<>(Phase.class))));

        public static Transition from(Phase from, Phase to) {
            return m.get(from).get(to);
        }
    }
}
```

## Item 38: Emulate Extensible Enums with Interfaces

- Enum types cannot be extended (by design - extensibility complicates things)
- **For opcodes/operations, define an interface and have the enum implement it**
- Use the interface type in APIs, not the enum type

```java
// Define the interface
public interface Operation {
    double apply(double x, double y);
}

// Basic implementation
public enum BasicOperation implements Operation {
    PLUS("+")  { public double apply(double x, double y) { return x + y; } },
    MINUS("-") { public double apply(double x, double y) { return x - y; } },
    TIMES("*") { public double apply(double x, double y) { return x * y; } },
    DIVIDE("/"){ public double apply(double x, double y) { return x / y; } };

    private final String symbol;
    BasicOperation(String symbol) { this.symbol = symbol; }
    @Override public String toString() { return symbol; }
}

// Extension
public enum ExtendedOperation implements Operation {
    EXP("^")       { public double apply(double x, double y) { return Math.pow(x, y); } },
    REMAINDER("%") { public double apply(double x, double y) { return x % y; } };

    private final String symbol;
    ExtendedOperation(String symbol) { this.symbol = symbol; }
    @Override public String toString() { return symbol; }
}
```

**Two ways to pass all operations of an implementation:**

```java
// 1. Bounded type token
private static <T extends Enum<T> & Operation> void test(
        Class<T> opEnumType, double x, double y) {
    for (Operation op : opEnumType.getEnumConstants())
        System.out.printf("%f %s %f = %f%n", x, op, y, op.apply(x, y));
}

// 2. Bounded wildcard collection
private static void test(Collection<? extends Operation> opSet,
        double x, double y) {
    for (Operation op : opSet)
        System.out.printf("%f %s %f = %f%n", x, op, y, op.apply(x, y));
}
```

**Limitation:** Implementation code cannot be inherited between enum types - use helper class or static helper methods if significant shared code.

## Item 39: Prefer Annotations to Naming Patterns

- **Never use naming patterns** (e.g., `testMethodName`) - typos cause silent failures, can't ensure proper usage, no way to associate parameters
- **Use annotations** - compile-time checking, clear semantics, can carry parameters

**Marker annotation:**

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Test { }

// Usage
public class Sample {
    @Test public static void m1() { }  // Test should pass
    public static void m2() { }         // Not a test
    @Test public static void m3() {     // Test should fail
        throw new RuntimeException("Boom");
    }
}
```

**Annotation with parameter:**

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
    Class<? extends Throwable> value();
}

// Usage
@ExceptionTest(ArithmeticException.class)
public static void m1() {
    int i = 0;
    i = i / i;  // Should throw ArithmeticException
}
```

**Array parameter annotation:**

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
    Class<? extends Exception>[] value();
}

// Usage
@ExceptionTest({ IndexOutOfBoundsException.class, NullPointerException.class })
public static void doublyBad() { ... }
```

**Repeatable annotation (Java 8+):**

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Repeatable(ExceptionTestContainer.class)
public @interface ExceptionTest {
    Class<? extends Exception> value();
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTestContainer {
    ExceptionTest[] value();
}

// Usage
@ExceptionTest(IndexOutOfBoundsException.class)
@ExceptionTest(NullPointerException.class)
public static void doublyBad() { ... }
```

**Processing repeatable annotations:**

- Use `getAnnotationsByType()` to get all instances
- Check for both the annotation type AND its container type with `isAnnotationPresent()`

## Item 40: Consistently Use the Override Annotation

- **Use `@Override` on every method declaration that overrides a supertype declaration**
- Prevents accidental overloading instead of overriding
- Compiler catches errors immediately

```java
// BUG: Overloads instead of overrides
public class Bigram {
    public boolean equals(Bigram b) {  // Wrong parameter type!
        return b.first == first && b.second == second;
    }
}

// CORRECT: Compiler catches the error with @Override
public class Bigram {
    @Override public boolean equals(Object o) {  // Correct parameter type
        if (!(o instanceof Bigram)) return false;
        Bigram b = (Bigram) o;
        return b.first == first && b.second == second;
    }
}
```

**Rules:**

- Parameter type for `equals` must be `Object`, not your class type
- Use `@Override` on concrete implementations of interface methods
- Exception: In concrete classes, you may omit `@Override` on methods that override abstract methods (compiler will catch missing implementations anyway)
- In abstract classes and interfaces, annotate all methods that override supertype declarations

## Item 41: Use Marker Interfaces to Define Types

- **Marker interface**: Interface with no method declarations that marks implementing classes
- Example: `Serializable` - indicates instances can be serialized

**Advantages of marker interfaces over marker annotations:**

1. **Define a type** - allows compile-time type checking
2. **Can be targeted more precisely** - can extend specific interfaces

**Advantages of marker annotations over marker interfaces:**

1. **Part of larger annotation facility** - consistency in annotation-based frameworks
2. **Can mark any program element**, not just classes/interfaces

**When to use which:**

- **Use marker interface** if:
  - Marking applies only to classes/interfaces
  - You might write methods that accept only objects with this marking
  - You want compile-time type checking
- **Use marker annotation** if:
  - Marking applies to program elements other than classes/interfaces
  - Framework already makes heavy use of annotations

```java
// Marker interface - allows compile-time checking
public interface Serializable { }

// If ObjectOutputStream.writeObject used Serializable as parameter type,
// serialization errors would be caught at compile time
void writeObject(Serializable obj) throws IOException;  // Better API design
```

**Rule:** If writing a marker annotation with `@Target(ElementType.TYPE)`, consider whether a marker interface would be more appropriate.
