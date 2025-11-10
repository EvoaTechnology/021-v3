import * as React from 'react';

declare module 'react' {
  interface LiHTMLAttributes<T> extends React.HTMLAttributes<T> {
    /** allow using `ordered` on <li> without TypeScript errors (non-invasive) */
    ordered?: boolean;
  }
}

export {};
