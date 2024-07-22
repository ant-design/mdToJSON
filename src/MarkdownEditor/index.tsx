import { observable } from 'mobx';
import { nanoid } from 'nanoid';
import React, { useImperativeHandle, useMemo } from 'react';
import { EditorFrame } from './editor/EditorFrame';
import { parserMdToSchema } from './editor/parser/parser';
import { EditorStore } from './editor/store';
import { EditorUtils } from './editor/utils/editorUtils';
import { useSystemKeyboard } from './editor/utils/keyboard';
import './index.css';

export { EditorUtils, parserMdToSchema };

export * from './editor/elements';
export * from './el';

export type IFileItem = {
  cid: string;
  filePath: string;
  root?: boolean;
  ext: string;
  filename: string;
  spaceId?: string;
  folder: boolean;
  parent?: IFileItem;
  children?: IFileItem[];
  expand?: boolean;
  editName?: string;
  changed?: boolean;
  refresh?: boolean;
  ghost?: boolean;
  sort: number;
  schema?: any[];
  history?: any;
  lastOpenTime?: number;
  hidden?: boolean;
  links?: { path: number[]; target: string }[];
};
export interface Tab {
  get current(): IFileItem | undefined;
  history: IFileItem[];
  index: number;
  hasNext: boolean;
  hasPrev: boolean;
  range?: Range;
  store: EditorStore;
  id: string;
}

export const MarkdownEditor: React.FC<{
  width?: string | number;
  height?: string | number;
  initValue?: string;
  styles?: React.CSSProperties;
  tabRef?: React.MutableRefObject<Tab | undefined>;
}> = (props) => {
  const { initValue, width, tabRef, styles, height, ...rest } = props;

  // 初始化 tab
  const t = useMemo(() => {
    const now = Date.now();
    const list = parserMdToSchema(initValue!)?.schema;
    list.push(EditorUtils.p);
    const data = {
      cid: nanoid(),
      filePath: 'new.md',
      folder: false,
      schema: initValue ? list : JSON.parse(JSON.stringify([EditorUtils.p])),
      sort: 0,
      lastOpenTime: now,
      spaceId: undefined,
      ext: 'md',
      filename: '腾讯报告',
    };
    return observable(
      {
        get current() {
          return this.history[this.index];
        },
        history: [data],
        index: 0,
        id: nanoid(),
        get hasPrev() {
          return false;
        },
        store: new EditorStore(),
        get hasNext() {
          return false;
        },
      } as Tab,
      { range: false, id: false },
    );
  }, []);

  // 初始化快捷键
  useSystemKeyboard(t.store);

  // 导入外部 hooks
  useImperativeHandle(tabRef, () => t, [t]);

  return (
    <div
      ref={(dom) => {
        t.store.setState((state) => (state.container = dom));
      }}
      className="markdown-editor"
      style={{
        width: width || '400px',
        minWidth: 300,
        height: height || '80vh',
        padding: '12px 24px',
        display: 'flex',
        maxHeight: '100%',
        overflow: 'auto',
        gap: 24,
        ...styles,
      }}
      key={t.id}
    >
      <EditorFrame tab={t} {...rest} />
    </div>
  );
};
