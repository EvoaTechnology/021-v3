import * as React from 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends React.HTMLAttributes<T> {
    /** allow using `inline` on <code> without TypeScript errors (non-invasive) */
    inline?: boolean;
  }
}

export {};
