export const semaphore = (
  permits = 1
): {
  acquire: (callback?: () => Promise<void>) => Promise<void>
  release: () => void
} => {
  let resources = permits
  const queues: (() => void)[] = []

  const acquire = (): void => {
    if (resources > 0 && queues.length > 0) {
      resources--
      const queue = queues.shift()
      if (queue) {
        queue()
      }
    }
  }

  const release = (): void => {
    resources++
    acquire()
  }

  return {
    acquire: async (callback?: () => Promise<void>): Promise<void> => {
      await new Promise((resolve) => {
        queues.push(resolve)
        setTimeout(async () => {
          acquire()
        }, 0)
      })
      if (callback) {
        await callback()
        release()
      }
    },
    release: (): void => {
      setTimeout(() => {
        release()
      }, 0)
    },
  }
}
