import { semaphore } from '../src'

const delay = (millis = 0): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, millis)
  })
}

describe('semaphore', () => {
  describe('construct with zero permits', () => {
    describe('acquire and release', () => {
      it('should work', async () => {
        const s = semaphore(0)

        const mockFunc = jest.fn((x) => x)

        mockFunc(0)
        setTimeout(() => {
          s.release()
        }, 100)
        mockFunc(1)
        await s.acquire()
        mockFunc(2)

        expect(mockFunc.mock.calls[0][0]).toBe(0)
        expect(mockFunc.mock.calls[1][0]).toBe(1)
        expect(mockFunc.mock.calls[2][0]).toBe(2)
      })
    })
  })

  describe('construct with two permits', () => {
    describe('acquire and release', () => {
      it('should work', async () => {
        const s = semaphore(2)

        const mockFunc = jest.fn((x) => x)

        mockFunc(0)
        setTimeout(() => {
          s.release()
          mockFunc(4)
          s.release()
          mockFunc(5)
          s.release()
        }, 100)
        mockFunc(1)
        s.acquire()
        mockFunc(2)
        s.acquire()
        mockFunc(3)
        await s.acquire()
        mockFunc(6)

        expect(mockFunc.mock.calls[0][0]).toBe(0)
        expect(mockFunc.mock.calls[1][0]).toBe(1)
        expect(mockFunc.mock.calls[2][0]).toBe(2)
        expect(mockFunc.mock.calls[3][0]).toBe(3)
        expect(mockFunc.mock.calls[4][0]).toBe(4)
        expect(mockFunc.mock.calls[5][0]).toBe(5)
        expect(mockFunc.mock.calls[6][0]).toBe(6)
      })
    })
  })

  describe('construct as mutex', () => {
    describe('acquire and release', () => {
      it('should work', async () => {
        const s = semaphore()

        const mockFunc = jest.fn((x) => x)

        mockFunc(0)
        setTimeout(() => {
          s.release()
          mockFunc(3)
          s.release()
        }, 100)
        mockFunc(1)
        s.acquire()
        mockFunc(2)
        await s.acquire()
        mockFunc(4)

        expect(mockFunc.mock.calls[0][0]).toBe(0)
        expect(mockFunc.mock.calls[1][0]).toBe(1)
        expect(mockFunc.mock.calls[2][0]).toBe(2)
        expect(mockFunc.mock.calls[3][0]).toBe(3)
        expect(mockFunc.mock.calls[4][0]).toBe(4)
      })

      it('should work with parallels', async () => {
        const s = semaphore()

        const mockFunc = jest.fn((x) => x)

        const heavyFunc = async (label: number): Promise<void> => {
          await s.acquire()
          for (let i = 0; i < 10; i++) {
            await delay()
            mockFunc(label)
          }
          s.release()
        }

        const promises = []
        for (let i = 0; i < 10; i++) {
          promises.push(heavyFunc(i))
        }

        await Promise.all(promises)

        expect(mockFunc.mock.calls.length).toBe(100)
        for (let i = 0; i < 100; i++) {
          expect(mockFunc.mock.calls[i][0]).toBe(Math.floor(i / 10))
        }
      })
    })

    describe('acquire with callback', () => {
      it('should work', async () => {
        const s = semaphore()

        const mockFunc = jest.fn((x) => x)

        mockFunc(0)
        await s.acquire(async () => {
          mockFunc(1)
        })
        mockFunc(2)

        expect(mockFunc.mock.calls[0][0]).toBe(0)
        expect(mockFunc.mock.calls[1][0]).toBe(1)
        expect(mockFunc.mock.calls[2][0]).toBe(2)
      })

      it('should work with parallels', async () => {
        const s = semaphore()

        const mockFunc = jest.fn((x) => x)

        const heavyFunc = async (label: number): Promise<void> => {
          await s.acquire(async () => {
            for (let i = 0; i < 10; i++) {
              await delay()
              mockFunc(label)
            }
          })
        }

        const promises = []
        for (let i = 0; i < 10; i++) {
          promises.push(heavyFunc(i))
        }

        await Promise.all(promises)

        expect(mockFunc.mock.calls.length).toBe(100)
        for (let i = 0; i < 100; i++) {
          expect(mockFunc.mock.calls[i][0]).toBe(Math.floor(i / 10))
        }
      })
    })
  })
})
