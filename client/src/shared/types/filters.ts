// types/filters.ts
export type FilterField =
  | {
      type: 'text' | 'number';
      key: string;
      placeholder: string;
    }
  | {
      type: 'select';
      key: string;
      placeholder: string;
      options: { label: string; value: string }[];
    };
