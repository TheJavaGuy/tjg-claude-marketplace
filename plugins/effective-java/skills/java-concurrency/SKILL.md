---
name: java-concurrency
description: Write thread-safe Java code (synchronization, executors, concurrent utilities, lazy initialization, thread safety documentation)
---

# Java Concurrency (Effective Java Items 78-84)

Apply these patterns when writing concurrent code.

## Item 78: Synchronize Access to Shared Mutable Data

- **Synchronization is required for both mutual exclusion AND reliable communication between threads**
- Reading a non-long/non-double variable is atomic, but **atomicity alone is insufficient** - changes may never be visible to other threads without synchronization
- **Both read and write operations must be synchronized** - synchronizing only writes (or reads) is NOT sufficient
- **Never use `Thread.stop()`** - it is inherently unsafe and can result in data corruption

**Use `volatile` when:**

- You need only inter-thread communication (visibility), not mutual exclusion
- The operation is a single read or write (not compound like `++`)

```java
// GOOD: volatile for simple flags
private static volatile boolean stopRequested;

// BAD: volatile alone is insufficient for non-atomic operations
private static volatile int nextSerialNumber = 0;
public static int generateSerialNumber() {
    return nextSerialNumber++;  // Broken! ++ is not atomic
}

// GOOD: Use AtomicLong for lock-free thread-safe increment
private static final AtomicLong nextSerialNum = new AtomicLong();
public static long generateSerialNumber() {
    return nextSerialNum.getAndIncrement();
}
```

**Best practices:**

- **Confine mutable data to a single thread** - either share immutable data or don't share at all
- Use `java.util.concurrent.atomic` classes for lock-free thread-safe programming on single variables
- For "effectively immutable" objects: synchronize only the act of sharing the object reference
- Safe publication methods: static field during class init, volatile field, final field, normal locking, concurrent collection

## Item 79: Avoid Excessive Synchronization

- **Never call an alien method from within a synchronized region** - methods designed to be overridden or provided by clients as function objects
- Alien methods can cause exceptions, deadlocks, or data corruption
- Java locks are **reentrant** - a thread can reacquire a lock it already holds, which can turn liveness failures into safety failures

**Solution: Open calls (alien methods outside synchronized blocks)**

```java
// BAD: Calls alien method from synchronized block
private void notifyElementAdded(E element) {
    synchronized(observers) {
        for (SetObserver<E> observer : observers)
            observer.added(this, element);  // Alien method!
    }
}

// GOOD: Take snapshot, iterate outside synchronized block
private void notifyElementAdded(E element) {
    List<SetObserver<E>> snapshot = null;
    synchronized(observers) {
        snapshot = new ArrayList<>(observers);
    }
    for (SetObserver<E> observer : snapshot)
        observer.added(this, element);
}

// BETTER: Use CopyOnWriteArrayList for observer lists
private final List<SetObserver<E>> observers = new CopyOnWriteArrayList<>();
```

**Rules:**

- **Do as little work as possible inside synchronized regions** - obtain lock, examine/transform data, drop lock
- For mutable classes, choose: (1) omit synchronization, let client synchronize externally, OR (2) synchronize internally if you can achieve significantly higher concurrency
- Use `StringBuilder` over `StringBuffer`, `ThreadLocalRandom` over `Random` (unsynchronized alternatives)
- **If a method modifies a static field callable from multiple threads, you MUST synchronize internally** - external synchronization is impossible

## Item 80: Prefer Executors, Tasks, and Streams to Threads

- **Use the Executor Framework** instead of working directly with threads
- **Think in terms of tasks (Runnable/Callable), not threads**

```java
// Create executor service
ExecutorService exec = Executors.newSingleThreadExecutor();

// Submit task
exec.execute(runnable);

// Graceful shutdown (required or VM may not exit)
exec.shutdown();
```

**Choosing an executor:**

- Small programs/lightly loaded servers: `Executors.newCachedThreadPool()` - no configuration needed
- **Heavily loaded production servers: `Executors.newFixedThreadPool()`** - cached pools create unbounded threads under load
- For maximum control: use `ThreadPoolExecutor` directly

**Task types:**

- `Runnable` - no return value
- `Callable` - returns value, can throw exceptions

**Fork-join tasks:**

- Use `ForkJoinPool` for tasks that can be split into subtasks
- Parallel streams are built atop fork-join pools - use them for easy parallelism when appropriate (Item 48)

## Item 81: Prefer Concurrency Utilities to wait and notify

- **Use higher-level concurrency utilities** from `java.util.concurrent` instead of `wait` and `notify`
- **Use concurrent collections instead of synchronized collections** - `ConcurrentHashMap` over `Collections.synchronizedMap()`

**Concurrent collections:**

- Manage their own synchronization internally
- **Cannot exclude concurrent activity** - locking only slows the program
- Use state-dependent modify operations like `putIfAbsent()` for atomic compound actions

```java
// Concurrent canonicalizing map - optimized
public static String intern(String s) {
    String result = map.get(s);
    if (result == null) {
        result = map.putIfAbsent(s, s);
        if (result == null)
            result = s;
    }
    return result;
}
```

**Synchronizers:**

- `CountDownLatch` - single-use barrier for thread coordination
- `Semaphore` - controls access to a resource
- `CyclicBarrier`, `Phaser` - reusable barriers
- `BlockingQueue` - for producer-consumer patterns

**If you must use wait/notify:**

- **Always use wait loop idiom** - never invoke wait outside a loop
- **Prefer `notifyAll()` over `notify()`** - guarantees correct waking, protects against malicious waits

```java
// Standard idiom for using wait
synchronized (obj) {
    while (<condition does not hold>)
        obj.wait();
    // Perform action
}
```

**Timing:**

- **Use `System.nanoTime()` for interval timing**, not `System.currentTimeMillis()` - more accurate, unaffected by system clock adjustments

## Item 82: Document Thread Safety

- **Every class should clearly document its thread safety level**
- The `synchronized` modifier is an implementation detail, NOT part of the API - don't rely on it for documentation

**Thread safety levels:**

1. **Immutable** - no synchronization needed (String, Long, BigInteger)
2. **Unconditionally thread-safe** - mutable but internally synchronized (AtomicLong, ConcurrentHashMap)
3. **Conditionally thread-safe** - some methods require external synchronization (Collections.synchronized wrappers - iterators need external sync)
4. **Not thread-safe** - clients must synchronize externally (ArrayList, HashMap)
5. **Thread-hostile** - unsafe even with external synchronization (avoid!)

**Private lock object idiom:**

```java
// Prevents denial-of-service attacks, enables sophisticated concurrency control
private final Object lock = new Object();

public void foo() {
    synchronized(lock) {
        ...
    }
}
```

**Rules:**

- **Lock fields should always be declared `final`**
- Use private lock objects for unconditionally thread-safe classes designed for inheritance
- Document which lock to acquire for conditionally thread-safe classes

## Item 83: Use Lazy Initialization Judiciously

- **Don't use lazy initialization unless you need to** - it's a double-edged sword
- Use lazy initialization when: field accessed on fraction of instances AND costly to initialize
- **Measure performance** with and without lazy initialization to know if it helps

**Normal initialization (preferred):**

```java
private final FieldType field = computeFieldValue();
```

**Lazy initialization with synchronized accessor (for breaking circularities):**

```java
private FieldType field;

private synchronized FieldType getField() {
    if (field == null)
        field = computeFieldValue();
    return field;
}
```

**Lazy initialization holder class idiom (for static fields, performance):**

```java
private static class FieldHolder {
    static final FieldType field = computeFieldValue();
}

private static FieldType getField() { return FieldHolder.field; }
```

**Double-check idiom (for instance fields, performance):**

```java
private volatile FieldType field;

private FieldType getField() {
    FieldType result = field;
    if (result == null) {  // First check (no locking)
        synchronized(this) {
            if (field == null)  // Second check (with locking)
                field = result = computeFieldValue();
        }
    }
    return result;
}
```

**Rules:**

- **For static fields: use lazy initialization holder class idiom**
- **For instance fields: use double-check idiom**
- The local variable `result` in double-check ensures field is read only once - improves performance
- For fields tolerating repeated initialization: use single-check idiom (still needs `volatile`)

## Item 84: Don't Depend on the Thread Scheduler

- **Never rely on thread scheduler for correctness or performance** - makes programs nonportable
- Keep **average number of runnable threads close to number of processors**

**Rules:**

- Threads should do useful work, then wait for more - **don't busy-wait**
- Size thread pools appropriately
- Keep tasks short (but not too short - dispatching overhead)
- **Never use `Thread.yield()`** to fix programs - has no testable semantics, not portable
- **Never use thread priorities** to fix liveness problems - least portable feature of Java

```java
// BAD: Busy-waiting - wastes CPU, nonportable
public void await() {
    while (true) {
        synchronized(this) {
            if (count == 0)
                return;
        }
    }
}
```

**Fix liveness problems by:**

- Restructuring the application to reduce concurrently runnable threads
- Finding and fixing the underlying cause, not masking with yield/priorities
