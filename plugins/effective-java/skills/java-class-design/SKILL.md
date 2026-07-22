---
name: java-class-design
description: Design classes and interfaces following Effective Java principles (accessibility, immutability, composition, inheritance)
---

# Java Class and Interface Design (Effective Java Items 15-25)

Apply these patterns when designing classes and interfaces.

## Item 15: Minimize Accessibility

- **Make each class or member as inaccessible as possible**
- Access levels (increasing accessibility): `private` -> package-private -> `protected` -> `public`
- Top-level classes: use package-private unless it needs to be part of the API
- If a package-private class is used by only one class, make it a private static nested class
- **Instance fields of public classes should rarely be public**
- `public static final` fields are acceptable only for constants (primitive values or immutable objects)
- **Never have a public static final array field** (or accessor returning one) - it's mutable

```java
// BAD: Mutable array exposed
public static final Thing[] VALUES = { ... };

// GOOD: Return immutable list
private static final Thing[] PRIVATE_VALUES = { ... };
public static final List<Thing> VALUES =
    Collections.unmodifiableList(Arrays.asList(PRIVATE_VALUES));

// OR: Return defensive copy
public static final Thing[] values() {
    return PRIVATE_VALUES.clone();
}
```

## Item 16: Use Accessors in Public Classes

- **Public classes should never expose fields directly** - use getters/setters
- Package-private or private nested classes may expose fields (confined scope)
- Exposing immutable fields in public classes is less harmful but still questionable

```java
// BAD for public class
public class Point {
    public double x;
    public double y;
}

// GOOD for public class
public class Point {
    private double x;
    private double y;

    public double getX() { return x; }
    public double getY() { return y; }
    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
}
```

## Item 17: Minimize Mutability

**Five rules for immutable classes:**

1. Don't provide mutators (setters)
2. Ensure class can't be extended (make it `final` or use private constructor + static factories)
3. Make all fields `final`
4. Make all fields `private`
5. Ensure exclusive access to mutable components (defensive copies)

**Benefits of immutability:**

- Simple - one state only
- Thread-safe - no synchronization needed
- Can be shared freely (cache instances)
- Internals can be shared between instances
- Great building blocks for other objects
- Provide failure atomicity for free

**Functional approach:** Methods return new instances instead of modifying `this`

```java
public Complex plus(Complex c) {
    return new Complex(re + c.re, im + c.im);  // Returns new instance
}
```

**Performance mitigation:**

- Provide public mutable companion class if needed (e.g., `StringBuilder` for `String`)
- Package-private mutable companion for internal use

**Rules:**

- **Classes should be immutable unless there's a very good reason for mutability**
- If immutability is impractical, limit mutability as much as possible
- **Declare every field `private final` unless there's a good reason otherwise**
- Constructors should create fully initialized objects with all invariants established

## Item 18: Favor Composition Over Inheritance

- **Inheritance violates encapsulation** - subclass depends on superclass implementation details
- Safe to use inheritance: within a package, or with classes designed for inheritance
- **Dangerous**: inheriting from ordinary concrete classes across package boundaries

**Problems with inheritance:**

- Superclass changes can break subclasses
- Self-use patterns in superclass can cause unexpected behavior
- New methods in superclass can conflict with subclass methods

**Solution: Composition and forwarding (Wrapper/Decorator pattern)**

```java
// Wrapper class - uses composition
public class InstrumentedSet<E> extends ForwardingSet<E> {
    private int addCount = 0;

    public InstrumentedSet(Set<E> s) { super(s); }

    @Override public boolean add(E e) {
        addCount++;
        return super.add(e);
    }
    @Override public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }
}

// Forwarding class
public class ForwardingSet<E> implements Set<E> {
    private final Set<E> s;
    public ForwardingSet(Set<E> s) { this.s = s; }

    public boolean add(E e) { return s.add(e); }
    // ... delegate all other Set methods to s
}
```

**Use inheritance only when:**

- Genuine "is-a" relationship exists
- Subclass really is a subtype of superclass
- Superclass API has no flaws you'd inherit

## Item 19: Design for Inheritance or Prohibit It

**If designing for inheritance:**

- Document self-use of overridable methods (use `@implSpec`)
- Provide hooks via judiciously chosen `protected` methods
- **Constructors must never invoke overridable methods** (subclass not yet initialized)
- Same rule for `clone()` and `readObject()` - never invoke overridable methods
- Test by writing subclasses (at least 3)

**If NOT designing for inheritance:**

- **Prohibit subclassing** - make class `final` or make constructors private with static factories
- If must allow inheritance, ensure class never invokes overridable methods

```java
// BAD: Constructor invokes overridable method
public class Super {
    public Super() { overrideMe(); }  // Broken!
    public void overrideMe() { }
}
```

## Item 20: Prefer Interfaces to Abstract Classes

**Advantages of interfaces:**

- Existing classes can easily implement new interfaces
- Ideal for defining mixins (e.g., `Comparable`)
- Allow nonhierarchical type frameworks
- Enable safe, powerful wrapper classes

**Skeletal implementations (AbstractInterface pattern):**

- Combine interface benefits with implementation assistance
- Convention: `AbstractCollection`, `AbstractSet`, `AbstractList`, `AbstractMap`
- Provide default methods where possible, skeletal class for the rest

```java
// Skeletal implementation
public abstract class AbstractMapEntry<K,V> implements Map.Entry<K,V> {
    @Override public V setValue(V value) {
        throw new UnsupportedOperationException();
    }

    @Override public boolean equals(Object o) {
        if (!(o instanceof Map.Entry)) return false;
        Map.Entry<?,?> e = (Map.Entry) o;
        return Objects.equals(e.getKey(), getKey())
            && Objects.equals(e.getValue(), getValue());
    }
    // hashCode, toString...
}
```

## Item 21: Design Interfaces for Posterity

- **Design interfaces with great care** - flaws irritate users forever
- Adding default methods to existing interfaces is risky (may break implementations)
- Default methods can't maintain invariants of all implementations
- **Test new interfaces thoroughly** with multiple diverse implementations

## Item 22: Use Interfaces Only to Define Types

- Interfaces should define what a class can do, not export constants
- **Never use constant interfaces** (interface with only `static final` fields)

```java
// BAD: Constant interface antipattern
public interface PhysicalConstants {
    static final double AVOGADROS_NUMBER = 6.022e23;
}

// GOOD: Constant utility class
public class PhysicalConstants {
    private PhysicalConstants() { }  // Prevent instantiation
    public static final double AVOGADROS_NUMBER = 6.022e23;
}
```

## Item 23: Prefer Class Hierarchies to Tagged Classes

- **Tagged classes are verbose, error-prone, and inefficient**
- Replace with class hierarchy: abstract base class + concrete subclasses

```java
// BAD: Tagged class
class Figure {
    enum Shape { RECTANGLE, CIRCLE }
    final Shape shape;
    double length, width;  // Used if RECTANGLE
    double radius;         // Used if CIRCLE

    double area() {
        switch(shape) {
            case RECTANGLE: return length * width;
            case CIRCLE: return Math.PI * radius * radius;
        }
    }
}

// GOOD: Class hierarchy
abstract class Figure {
    abstract double area();
}

class Circle extends Figure {
    final double radius;
    Circle(double radius) { this.radius = radius; }
    @Override double area() { return Math.PI * radius * radius; }
}

class Rectangle extends Figure {
    final double length, width;
    Rectangle(double length, double width) {
        this.length = length;
        this.width = width;
    }
    @Override double area() { return length * width; }
}
```

## Item 24: Favor Static Member Classes Over Nonstatic

**Four kinds of nested classes:**

1. **Static member class** - use when nested class doesn't need enclosing instance
2. **Nonstatic member class** - each instance has implicit reference to enclosing instance
3. **Anonymous class** - for one-time use, declared and instantiated at point of use
4. **Local class** - can be declared anywhere a local variable can be declared

**Key rules:**

- **If member class doesn't need access to enclosing instance, always make it `static`**
- Nonstatic member classes hold hidden reference -> memory leaks, prevents GC
- Use nonstatic member class for Adapters (e.g., iterators, collection views)
- Use private static member classes for components (e.g., `Map.Entry`)

```java
// GOOD: Static member class (no enclosing instance reference)
public class MyMap<K,V> {
    private static class Entry<K,V> {  // static!
        K key;
        V value;
    }
}

// Nonstatic: Used for iterators that need access to enclosing collection
public class MySet<E> extends AbstractSet<E> {
    private class MyIterator implements Iterator<E> {
        // Can access MySet.this
    }
}
```

## Item 25: Limit Source Files to a Single Top-Level Class

- **Never put multiple top-level classes in a single source file**
- Compilation behavior depends on order files are passed to compiler
- If classes are related, use static member classes instead
