import React, { ComponentPropsWithRef, ComponentType, Suspense } from 'react'

export class LazySuspenseError extends Error {}

export interface LazySuspenseRetryOption {
  loader?: React.ReactNode
  maxRetryAttempt: number
  interval: number // interval in ms between retryAttempt
  crashPlaceholder: React.FC<{ error?: Error; details?: string }> // if we need different crash message for failed to load, we can update crashPlaceholder
}

lazySuspenseRetry.defaultOption = {
  maxRetryAttempt: 10,
  interval: 1000,
} as LazySuspenseRetryOption

export function lazySuspenseRetry<T extends ComponentType<any>>(
  fn: () => Promise<{
    default: T
  }>,
  opt?: LazySuspenseRetryOption
) {
  const loader = opt?.loader ?? lazySuspenseRetry.defaultOption.loader
  const crashPlaceholder = opt?.crashPlaceholder || lazySuspenseRetry.defaultOption.crashPlaceholder
  const retriesLeft = opt?.maxRetryAttempt ?? lazySuspenseRetry.defaultOption.maxRetryAttempt
  const interval = opt?.interval ?? lazySuspenseRetry.defaultOption.interval
  const Component = React.lazy(() => retry<T>(fn, retriesLeft, interval, crashPlaceholder))

  return React.forwardRef((props: ComponentPropsWithRef<T>, ref) => {
    return (
      <Suspense fallback={loader}>
        <Component {...props} ref={ref} />
      </Suspense>
    )
  })
}

// https://dev.to/goenning/how-to-retry-when-react-lazy-fails-mb5
function retry<T>(
  fn: () => Promise<{ default: T }>,
  retriesLeft: number,
  // when retriesLeft > 0, Component will be null, while browser is trying to fetch component
  interval: number,
  crashPlaceholder?: React.FC<{ error?: Error; details?: string }>
): Promise<{ default: any }> {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error: Error) => {
        setTimeout(() => {
          if (retriesLeft === 0) {
            if (crashPlaceholder) {
              console.log('error', error)
              return resolve({
                default: () => crashPlaceholder({ error }) || <></>,
              })
            }
            throw new Error('Error LSR attempt has been exhausted')
          }

          retry(fn, retriesLeft - 1, interval, crashPlaceholder).then(resolve, reject)
        }, interval)
      })
  })
}
