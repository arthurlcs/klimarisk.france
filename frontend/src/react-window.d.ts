declare module 'react-window' {
  import * as React from 'react';

  export interface ListChildComponentProps<T = any> {
    index: number;
    style: React.CSSProperties;
    data?: T;
    isScrolling?: boolean;
  }

  export interface FixedSizeListProps<T = any> {
    ref?: React.Ref<FixedSizeList<T>>;
    height: number;
    itemCount: number;
    itemSize: number;
    width: string | number;
    children: React.ComponentType<ListChildComponentProps<T>>;
    initialScrollOffset?: number;
    onScroll?: (props: any) => void;
  }

  export class FixedSizeList<T = any> extends React.Component<FixedSizeListProps<T>> {
    scrollToItem(index: number, align?: 'auto' | 'start' | 'center' | 'end'): void;
    scrollToPosition(offset: number): void;
    state: { isScrolling: boolean; scrollOffset: number };
  }
}
