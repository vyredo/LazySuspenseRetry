# Lazy-Load React Component Package Documentation

## Overview

This package is designed to help lazy-load React components, providing features such as loading components, retry attempts, and error components when all retry attempts have been exhausted. By using this package, you can significantly improve the performance and user experience of your application by loading components only when needed.

## Installation

To install the package, run the following command:

```bash
npm install lazy_suspense_retry
```

or 

```bash
yarn add react-lazyload-component
```


# Usage

First, import the package in your project:

```javascript
import { lazySuspenseRetry as LSR } from "lazy_suspense_retry"
```


Then wrap and import your component. Below is example with react-router

```javascript
const Home = LSR(() => import("home/home"))
const PostPage = LSR(() => import("posts/postpage"))
const EventsPage = LSR(() => import("events/Events"))
const ErrPage = LSR(() => import("errpage"))

const App = () => {
    return useRoutes([
		{ path: "", element: <Home /> },
		{ path: "post/:postId", element: <PostPage /> },
		{ path: "events/:eventId", element: <EventsPage /> },
		{ path: "*", element: <ErrPage /> },
	])
}
```

# Configuration

## Loading Component
To display a custom loading component while the target component is being loaded, pass the loader prop:
### Global Option *applicable to all component*
```javascript
LSR.defaultOption = {
	loader: (
		<div className={"circular-loader"}>
			<CircularProgress size={24} thickness={2} />
		</div>
	),
}
```

### Individual option *only affect Home Component*
```javascript
const Home = LSR(() => import("home/home"), {
    loader: (
		<div className={"circular-loader"}>
			<CircularProgress size={24} thickness={2} />
		</div>
	)
})
```
----
##  Retry Attempt
To set the number of retry attempts before displaying an error component, use the maxRetryAttempt prop, and set the interval of each attempt:
### Global Option *applicable to all component*
```javascript
LSR.defaultOption = {
	maxRetryAttempt: 5, // will stop after 5 retry attempt
    interval: 1000, // 1 sec interval of each retry 
}
```

### Individual Option *only affect Home Component*
```javascript
const Home = LSR(() => import("home/home"), {
    maxRetryAttempt: 5, // will stop after 5 retry attempt
    interval: 1000, // 1 sec interval of each retry 
})
```

### Error Component 
To display a custom error component when all retry attempts have been exhausted.
Pass a Component that accepts props with `{ error: Error, detail: string }` :
```typescript
// global option
LSR.defaultOption = {
	crashPlaceholder: FallbackComponent
}

// individual option
const Home = LSR(() => import("home/home"), {
    crashPlaceholder: FallbackComponent
})


const FallbackComponent: React.FC<{
	error?: Error
	details?: string | undefined
}> = ({ error, details }) => {
	return (
        <div>
            <ErrorMessage error={error || new Error("unknown error")} />
            <pre>{details}</pre>
            <Button $colorVariant={Variant.ERROR} onClick={() => window.location.reload()}>
                Error Please Reload
            </Button>
        </div>
	)
}
```


# Advanced Usage
You can combine all configurations for a complete implementation:

```javascript
import { lazySuspenseRetry as LSR } from "lazy_suspense_retry"
```


Then wrap and import your component. Below is example with react-router

```javascript
const Home = LSR(() => import("home/home"))
const PostPage = LSR(() => import("posts/postpage"))
const EventsPage = LSR(() => import("events/Events"))
const ErrPage = LSR(() => import("errpage"))


LSR.defaultOption = {
	loader: (
		<div className={"circular-loader"}>
			<CircularProgress size={24} thickness={2} />
		</div>
	),
	maxRetryAttempt: 10,
	interval: 1000,
	crashPlaceholder: FallbackComponent,
}

export const App = () => {
    return useRoutes([
		{ path: "", element: <Home /> },
		{ path: "post/:postId", element: <PostPage /> },
		{ path: "events/:eventId", element: <EventsPage /> },
		{ path: "*", element: <ErrPage /> },
	])
}


const FallbackComponent: React.FC<{
	error?: Error
	details?: string | undefined
}> = ({ error, details }) => {
	return (
        <div>
            <ErrorMessage error={error || new Error("unknown error")} />
            <pre>{details}</pre>
            <Button $colorVariant={Variant.ERROR} onClick={() => window.location.reload()}>
                Error Please Reload
            </Button>
        </div>
	)
}
```


# API
## Props
- **loader?: React.ReactNode** (optional): The Component to be displayed while the target component is loaded

- **maxRetryAttempt: number** (required): The maximum number of retry attempts before showing the error component. Default: 10, 0 means no retries.

  interval: number // interval in ms between retryAttempt
  crashPlaceholder: React.FC<{ error?: Error; details?: string }>
