---
name: java-generics
description: Use Java generics correctly (type safety, wildcards, PECS principle, bounded type parameters)
---

# Java Generics (Effective Java Items 26-33)

Apply these patterns when working with generic types.

## Item 26: Don't Use Raw Types

- **Never use raw types in new code** - raw types exist only for compatibility with pre-generics code
- Use `Set<Object>` for a set that can contain objects of any type (type safe)
- Use `Set<?>` (unbounded wildcard) when the element type is unknown/irrelevant (type safe, immutable)
- Raw type `Set` opts out of the type system entirely (NOT type safe)
- **Exceptions where raw types are permitted:**
  1. Class literals: `List.class` is legal, `List<String>.class` is NOT
  2. instanceof checks: use raw type, then cast to wildcard type

```java
// Legitimate use of raw type - instanceof operator
if (o instanceof Set) {       // Raw type
    Set<?> s = (Set<?>) o;    // Cast to wildcard type
}
```

## Item 27: Eliminate Unchecked Warnings

- **Eliminate every unchecked warning that you can** - each represents potential ClassCastException
- Use diamond operator `<>` for type inference
- If you can't eliminate a warning but can prove the code is typesafe, suppress with `@SuppressWarnings("unchecked")`
- **Always use @SuppressWarnings on the smallest scope possible** - prefer variable declaration over method/class
- **Always add a comment explaining why the suppression is safe**
- Never use @SuppressWarnings on an entire class

```java
// Adding local variable to reduce scope of @SuppressWarnings
@SuppressWarnings("unchecked")  // Safe: array contains only T instances from push(E)
T[] result = (T[]) Arrays.copyOf(elements, size, a.getClass());
```

## Item 28: Prefer Lists to Arrays

- **Arrays are covariant** (`Sub[]` is subtype of `Super[]`), **generics are invariant** (`List<Sub>` is NOT subtype of `List<Super>`)
- **Arrays are reified** (enforce type at runtime), **generics use erasure** (enforce at compile-time only)
- Arrays catch type errors at runtime, lists catch them at compile time - prefer compile-time
- **Cannot create arrays of generic types**: `new List<E>[]`, `new List<String>[]`, `new E[]` are all illegal
- When mixing arrays and generics causes errors/warnings, **replace arrays with lists**
- Non-reifiable types (E, List<E>, List<String>) cannot be used as array element types

```java
// BAD: Array with cast and warning
T[] choiceArray = (T[]) choices.toArray();

// GOOD: List - typesafe, no warnings
List<T> choiceList = new ArrayList<>(choices);
```

## Item 29: Favor Generic Types

- **Make your types generic** to avoid casts in client code
- Use conventional type parameter names: E (element), K (key), V (value), T (type), N (number)
- **Two techniques for generic types backed by arrays:**
  1. Cast `Object[]` to `E[]` in constructor with `@SuppressWarnings` - more readable, preferred
  2. Keep `Object[]` field, cast elements on retrieval - avoids heap pollution
- Use **bounded type parameters** for restrictions: `<E extends Delayed>`

```java
// Technique 1: Cast array once in constructor
@SuppressWarnings("unchecked")  // Safe: elements only contains E instances
public Stack() {
    elements = (E[]) new Object[DEFAULT_INITIAL_CAPACITY];
}

// Technique 2: Cast on each retrieval
@SuppressWarnings("unchecked")  // Safe: push() only accepts E
E result = (E) elements[--size];
```

## Item 30: Favor Generic Methods

- **Static utility methods should typically be generic**
- Type parameter list goes between modifiers and return type: `public static <E> Set<E> union(...)`
- Use **generic singleton factory pattern** for immutable objects applicable to many types
- Use **recursive type bounds** for mutual comparability: `<E extends Comparable<E>>`

```java
// Generic method
public static <E> Set<E> union(Set<E> s1, Set<E> s2) {
    Set<E> result = new HashSet<>(s1);
    result.addAll(s2);
    return result;
}

// Recursive type bound for mutually comparable elements
public static <E extends Comparable<E>> E max(Collection<E> c)
```

## Item 31: Use Bounded Wildcards to Increase API Flexibility

- **PECS: Producer-Extends, Consumer-Super**
- If parameter produces T instances, use `<? extends T>`
- If parameter consumes T instances, use `<? super T>`
- **Do NOT use bounded wildcard types as return types**
- **Use `Comparable<? super T>` in preference to `Comparable<T>`**
- **Use `Comparator<? super T>` in preference to `Comparator<T>`**
- If type parameter appears only once in method declaration, replace with wildcard

```java
// Producer: src produces E instances for the Stack
public void pushAll(Iterable<? extends E> src) { ... }

// Consumer: dst consumes E instances from the Stack
public void popAll(Collection<? super E> dst) { ... }

// Maximum flexibility for Comparable
public static <T extends Comparable<? super T>> T max(List<? extends T> list)
```

## Item 32: Combine Generics and Varargs Judiciously

- Varargs + generics can cause heap pollution (variable of parameterized type refers to wrong type)
- **Use @SafeVarargs** on every method with a generic varargs parameter that is safe
- Method with generic varargs is safe if:
  1. It doesn't store anything into the varargs parameter array
  2. It doesn't expose the array (or clone) to untrusted code
- @SafeVarargs is legal only on methods that can't be overridden (static, final, private)
- **Never return a generic varargs parameter array** - causes heap pollution
- **Alternative**: replace varargs parameter with List

```java
// Safe: doesn't store into array or expose it
@SafeVarargs
static <T> List<T> flatten(List<? extends T>... lists) {
    List<T> result = new ArrayList<>();
    for (List<? extends T> list : lists)
        result.addAll(list);
    return result;
}

// Typesafe alternative using List instead of varargs
static <T> List<T> flatten(List<List<? extends T>> lists)
```

## Item 33: Consider Typesafe Heterogeneous Containers

- **Parameterize the key instead of the container** when you need more flexibility
- Use `Class<T>` objects as type tokens (keys)
- Use `Class.cast()` for typesafe dynamic casting
- Use checked collection wrappers (`checkedSet`, `checkedList`, `checkedMap`) for runtime type safety
- **Cannot use non-reifiable types as type tokens** (no `List<String>.class`)
- Use **bounded type tokens** to restrict allowable types: `Class<? extends Annotation>`
- Use `Class.asSubclass()` to safely cast to bounded type tokens

```java
// Typesafe heterogeneous container
public class Favorites {
    private Map<Class<?>, Object> favorites = new HashMap<>();

    public <T> void putFavorite(Class<T> type, T instance) {
        favorites.put(Objects.requireNonNull(type), type.cast(instance)); // Runtime safety
    }

    public <T> T getFavorite(Class<T> type) {
        return type.cast(favorites.get(type));
    }
}
```
