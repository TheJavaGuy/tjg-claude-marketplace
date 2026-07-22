---
name: java-object-methods
description: Implement equals, hashCode, toString, clone, and Comparable correctly following Effective Java guidelines
---

# Java Object Methods (Effective Java Items 10-14)

Apply these patterns when implementing methods common to all objects.

## Item 10: Obey the equals Contract

**When NOT to override equals:**

- Each instance is inherently unique (e.g., `Thread`)
- No need for "logical equality" test
- Superclass equals is already appropriate
- Class is private/package-private and equals will never be invoked

**When to override equals:**

- Class has a notion of logical equality different from object identity
- Superclass has not already overridden equals appropriately
- Value classes (e.g., `Integer`, `String`) typically need equals

**The equals contract (must satisfy all):**

1. **Reflexive**: `x.equals(x)` returns `true`
2. **Symmetric**: `x.equals(y)` iff `y.equals(x)`
3. **Transitive**: if `x.equals(y)` and `y.equals(z)`, then `x.equals(z)`
4. **Consistent**: multiple invocations return same result (if objects unchanged)
5. **Non-null**: `x.equals(null)` returns `false`

**Recipe for high-quality equals:**

1. Use `==` to check if argument is reference to `this` (performance optimization)
2. Use `instanceof` to check correct type (also handles null check)
3. Cast argument to correct type
4. Compare significant fields:
   - Primitives (except float/double): use `==`
   - float: `Float.compare(float, float)`
   - double: `Double.compare(double, double)`
   - Objects: use `Objects.equals(a, b)` for null-safety
   - Arrays: `Arrays.equals()`

```java
@Override public boolean equals(Object o) {
    if (o == this) return true;
    if (!(o instanceof PhoneNumber)) return false;
    PhoneNumber pn = (PhoneNumber) o;
    return pn.lineNum == lineNum && pn.prefix == prefix
        && pn.areaCode == areaCode;
}
```

**Critical rules:**

- **Always override hashCode when you override equals**
- Use `@Override` annotation to prevent accidental overloading
- Parameter type must be `Object`, not your class type
- **Never extend an instantiable class and add a value component** - use composition instead
- Do NOT write equals that depends on unreliable resources (e.g., network)

## Item 11: Always Override hashCode When You Override equals

**hashCode contract:**

1. Consistent within same execution (if equals inputs unchanged)
2. **Equal objects must have equal hash codes**
3. Unequal objects should (but need not) have different hash codes

**Recipe for hashCode:**

1. Initialize `result` to hash code of first significant field
2. For each remaining significant field:
   - Primitives: `Type.hashCode(f)` (e.g., `Integer.hashCode(f)`)
   - Objects: recursively call `hashCode()`, use 0 for null
   - Arrays: `Arrays.hashCode()`
3. Combine: `result = 31 * result + c`
4. Return result

```java
@Override public int hashCode() {
    int result = Short.hashCode(areaCode);
    result = 31 * result + Short.hashCode(prefix);
    result = 31 * result + Short.hashCode(lineNum);
    return result;
}
```

**Alternatives:**

- `Objects.hash(field1, field2, ...)` - convenient but slower (creates array, autoboxing)
- Cache hash code for immutable classes with expensive computation

**Rules:**

- Include all fields used in equals
- Exclude derived fields (can be computed from other fields)
- Do NOT exclude significant fields to improve performance
- Do NOT specify exact hash code value in documentation (limits future changes)

## Item 12: Always Override toString

- **Override toString in every instantiable class** (unless superclass already did)
- Return all interesting information contained in the object
- For large objects, return a summary
- **Provide programmatic access** to information in toString (via getters)
- Document whether format is specified or unspecified
- If format is specified, provide a static factory or constructor for parsing

```java
@Override public String toString() {
    return String.format("%03d-%03d-%04d", areaCode, prefix, lineNum);
}
```

**Skip toString for:**

- Static utility classes
- Most enum types (Java provides a good default)

## Item 13: Override clone Judiciously

**Prefer copy constructors or copy factories over Cloneable:**

```java
// Copy constructor
public Yum(Yum yum) { ... }

// Copy factory
public static Yum newInstance(Yum yum) { ... }
```

**If you must implement Cloneable:**

1. Call `super.clone()` (never use constructor)
2. For classes with only primitives/immutable references: `super.clone()` is sufficient
3. For mutable object references: deep copy the mutable objects
4. Use covariant return type (return your class, not Object)
5. Public clone methods should NOT declare `throws CloneNotSupportedException`
6. Thread-safe classes must synchronize clone method

```java
@Override public Stack clone() {
    try {
        Stack result = (Stack) super.clone();
        result.elements = elements.clone(); // Deep copy mutable state
        return result;
    } catch (CloneNotSupportedException e) {
        throw new AssertionError();
    }
}
```

**Problems with Cloneable:**

- Incompatible with final fields referring to mutable objects
- Creates objects without calling constructor
- Fragile and extralinguistic
- Immutable classes should never provide clone (wasteful)
- Arrays are the only compelling use case for clone

## Item 14: Consider Implementing Comparable

**Implement Comparable for value classes with natural ordering** (alphabetical, numerical, chronological)

**compareTo contract:**

1. `sgn(x.compareTo(y)) == -sgn(y.compareTo(x))`
2. Transitive: `(x.compareTo(y) > 0 && y.compareTo(z) > 0)` implies `x.compareTo(z) > 0`
3. `x.compareTo(y) == 0` implies `sgn(x.compareTo(z)) == sgn(y.compareTo(z))`
4. Strongly recommended: `(x.compareTo(y) == 0) == (x.equals(y))`

**Implementation rules:**

- Use `Type.compare()` for primitives (e.g., `Integer.compare(x, y)`)
- Do NOT use `<` and `>` operators (verbose, error-prone)
- Do NOT use subtraction (integer overflow risk)
- Compare most significant fields first

```java
// Multiple-field Comparable
public int compareTo(PhoneNumber pn) {
    int result = Short.compare(areaCode, pn.areaCode);
    if (result == 0) {
        result = Short.compare(prefix, pn.prefix);
        if (result == 0)
            result = Short.compare(lineNum, pn.lineNum);
    }
    return result;
}
```

**Java 8+ Comparator construction methods:**

```java
private static final Comparator<PhoneNumber> COMPARATOR =
    comparingInt((PhoneNumber pn) -> pn.areaCode)
        .thenComparingInt(pn -> pn.prefix)
        .thenComparingInt(pn -> pn.lineNum);

public int compareTo(PhoneNumber pn) {
    return COMPARATOR.compare(this, pn);
}
```
