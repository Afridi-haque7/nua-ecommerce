import 'react';

// React 18's types don't know the standard `fetchpriority` attribute yet
// (React 19 adds camelCase `fetchPriority`). The lowercase form passes
// through JSX to the DOM unchanged, so we just teach TypeScript about it.
declare module 'react' {
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}
