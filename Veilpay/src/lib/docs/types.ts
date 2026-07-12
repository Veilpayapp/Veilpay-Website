export type DocsPageRecord = {
  id: string;
  title: string;
  sourcePath: string;
  routePath: string;
  depth: number;
  parentId?: string;
  order: number;
};

export type DocsGroup = {
  title: string;
  pages: DocsPageRecord[];
};

export type DocsRegistry = {
  pages: DocsPageRecord[];
  routeToPage: Record<string, DocsPageRecord>;
  sourceToPage: Record<string, DocsPageRecord>;
};
