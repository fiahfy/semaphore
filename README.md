<!-- markdownlint-disable MD024 -->

# semaphore

![badge](https://github.com/fiahfy/semaphore/workflows/Node.js%20Package/badge.svg)

> [Semaphore](<https://en.wikipedia.org/wiki/Semaphore_(programming)>) implementation in JavaScript.

## Installation

```bash
npm install @fiahfy/semaphore
```

## Usage

### Mutex

```js
import fs from 'fs'
import { semaphore } from '@fiahfy/semaphore'

const s = semaphore()

const heavyFunc = () => {
  return s.acquire().then(() => {
    console.log('heavy process')
    s.release()
    console.log('released')
  })
}
```

### Mutex with callback (auto release)

```js
import fs from 'fs'
import { semaphore } from '@fiahfy/semaphore'

const s = semaphore()

const heavyFunc = () => {
  return s.acquire(() => {
    console.log('heavy process')
  }).then(() => {
    console.log('released')
  })
}
```

### Zero permits

```js
import fs from 'fs'
import { semaphore } from '@fiahfy/semaphore'

const s = semaphore(0)

console.log('first')

setTimeout(() => {
  console.log('second')
  s.release() // increment permit
}, 100)

s.acquire().then(() => { // wait until permit is available
  console.log('third')
})
```

## API

### semaphore(permits)

Creates a Semaphore with the given number of permits.

#### permits

Type: `number`  
Default: `1`

The initial number of permits available.  
This value may be negative, in which case releases must occur before any acquires will be granted.

### semaphore.acquire(callback)

Acquires a permit from this semaphore, blocking until one is available.  
If a callback is given, a permit is released automatically after a given callback is finished.

#### callback

Type: `IcnsImage`  
Default: `undefined`

Holds a permit until a callback is finished.

### semaphore.release()

Releases a permit, returning it to the semaphore.
