---
name: java-object-creation
description: Apply Effective Java patterns for object creation (static factories, builders, singletons, DI, avoiding unnecessary objects, try-with-resources)
---

# Java Object Creation Patterns (Effective Java Items 1-9)

Apply these patterns when creating, initializing, and managing object lifecycles in Java.

## Item 1: Static Factory Methods

- **Prefer static factory methods over public constructors** when multiple constructors with the same signature are needed, or when descriptive naming improves clarity
- Use standard naming conventions: `from()`, `of()`, `valueOf()`, `getInstance()`, `create()`, `newInstance()`, `getType()`, `newType()`, `type()`
- Static factories can return cached instances (avoiding unnecessary object creation) or return subtypes of the declared return type
- Static factories enable instance-controlled classes (singletons, noninstantiable, or ensuring no duplicate equal instances)

## Item 2: Builder Pattern

- **Use the Builder pattern when constructors would have more than 4 parameters**, especially if many are optional or of the same type
- Builder provides named parameters, is safer than JavaBeans (no inconsistent state), and produces immutable objects
- For class hierarchies, use parallel builder hierarchies with the "simulated self-type" idiom: `abstract static class Builder<T extends Builder<T>>` with `protected abstract T self()`
- Builder's `build()` method in subclasses should use covariant return typing (return the specific subtype)

## Item 3: Singletons

- **Prefer single-element enum for implementing singletons** - provides serialization for free and guarantees against multiple instantiation
- Alternative: private constructor + public static final field, or private constructor + static factory method
- If using non-enum singleton with serialization, declare instance fields `transient` and provide `readResolve()` method

## Item 4: Noninstantiable Utility Classes

- **Enforce noninstantiability with a private constructor that throws AssertionError**
- Do NOT use abstract classes for this purpose (they can be subclassed)
- Add a comment explaining the private constructor's purpose

```java
// Suppress default constructor for noninstantiability
private UtilityClass() {
    throw new AssertionError();
}
```

## Item 5: Dependency Injection

- **Prefer dependency injection over hardwired resources** - pass resources into the constructor
- Do NOT use singletons or static utility classes for classes whose behavior depends on underlying resources
- Use `Supplier<T>` as a factory parameter for maximum flexibility: `Supplier<? extends T>`
- DI improves flexibility, reusability, and testability

```java
public SpellChecker(Lexicon dictionary) {
    this.dictionary = Objects.requireNonNull(dictionary);
}
```

## Item 6: Avoid Unnecessary Objects

- **Reuse immutable objects** instead of creating new functionally equivalent ones
- Never use `new String("...")` - use string literals directly
- Prefer `Boolean.valueOf()` over `Boolean(String)` constructor
- **Cache expensive objects** like compiled `Pattern` instances as static final fields
- **Prefer primitives over boxed primitives** - watch for unintentional autoboxing in loops
- Do NOT maintain your own object pools except for extremely heavyweight objects (e.g., database connections)

```java
// BAD: Creates Pattern on every call
static boolean isRomanNumeral(String s) {
    return s.matches("^(?=.)M*...$");
}

// GOOD: Compile Pattern once
private static final Pattern ROMAN = Pattern.compile("^(?=.)M*...$");
static boolean isRomanNumeral(String s) {
    return ROMAN.matcher(s).matches();
}
```

## Item 7: Eliminate Obsolete Object References

- **Null out references when a class manages its own memory** (e.g., array-based collections)
- Define variables in the narrowest possible scope - let references fall out of scope naturally
- Common memory leak sources:
  1. **Self-managed memory** (arrays, caches) - null out obsolete references
  2. **Caches** - use `WeakHashMap` or periodic cleanup
  3. **Listeners/callbacks** - store as weak references or in `WeakHashMap` keys

```java
public Object pop() {
    if (size == 0) throw new EmptyStackException();
    Object result = elements[--size];
    elements[size] = null; // Eliminate obsolete reference
    return result;
}
```

## Item 8: Avoid Finalizers and Cleaners

- **Never use finalizers** - they are unpredictable, slow, and can enable security attacks
- **Avoid cleaners except as safety nets** for resources when clients forget to call `close()`
- Implement `AutoCloseable` instead and require clients to use try-with-resources
- Track closed state in a field; throw `IllegalStateException` if methods called after close
- To protect against finalizer attacks on non-final classes, write `final void finalize() {}`
- Cleaners must use static nested classes (not lambdas or non-static nested classes) to avoid capturing references to enclosing instances

## Item 9: Try-with-Resources

- **Always use try-with-resources for closeable resources** instead of try-finally
- Resources must implement `AutoCloseable`
- Handles multiple resources cleanly with proper exception handling
- Suppressed exceptions are preserved and accessible via `getSuppressed()`

```java
// GOOD: try-with-resources
static void copy(String src, String dst) throws IOException {
    try (InputStream in = new FileInputStream(src);
         OutputStream out = new FileOutputStream(dst)) {
        byte[] buf = new byte[BUFFER_SIZE];
        int n;
        while ((n = in.read(buf)) >= 0)
            out.write(buf, 0, n);
    }
}
```
