import { Anchor } from 'antd';
import { observer } from 'mobx-react-lite';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef } from 'react';
import { useDebounce, useGetSetState } from 'react-use';
import { Node } from 'slate';
import { IFileItem } from '../../index';
import { useEditorStore } from '../store';
import { getOffsetTop, slugify } from '../utils/dom';
type Leading = {
  title: string;
  level: number;
  id: string;
  key: string;
  dom?: HTMLElement;
  schema: object;
};

const cache = new Map<object, Leading>();
const levelClass = new Map([
  [1, ''],
  [2, 'pl-3'],
  [3, 'pl-6'],
  [4, 'pl-9'],
]);
export const Heading = observer(({ note }: { note: IFileItem }) => {
  const store = useEditorStore();
  const [state, setState] = useGetSetState({
    headings: [] as Leading[],
    active: '',
  });
  const box = useRef<HTMLElement>();
  const getHeading = useCallback(() => {
    if (note) {
      const schema = note.schema;
      if (schema?.length) {
        const headings: Leading[] = [];
        for (let s of schema) {
          if (s.type === 'head' && s.level <= 4) {
            if (cache.get(s)) {
              headings.push(cache.get(s)!);
              continue;
            }
            const title = Node.string(s);
            const id = slugify(title);
            if (title) {
              cache.set(s, {
                title,
                level: s.level,
                id,
                key: nanoid(),
                schema: s,
              });
              headings.push(cache.get(s)!);
              setTimeout(() => {
                if (cache.get(s)) {
                  cache.get(s)!.dom = store.container?.querySelector(
                    `[data-head="${id}"]`,
                  ) as HTMLElement;
                }
              }, 200);
            }
          }
        }
        setState({ headings });
      } else {
        setState({ headings: [] });
      }
    } else {
      setState({ headings: [] });
    }
  }, [note]);

  useEffect(() => {
    cache.clear();
    getHeading();
    setState({ active: '' });
  }, [note]);

  useDebounce(getHeading, 100, [note, note?.refresh]);

  useEffect(() => {
    const div = box.current;
    if (div) {
      const scroll = (e: Event) => {
        const top = (e.target as HTMLElement).scrollTop;
        const container = store.container;
        if (!container) return;
        const heads = state().headings.slice().reverse();
        for (let h of heads) {
          if (h.dom && top > getOffsetTop(h.dom, container) - 20) {
            setState({ active: h.id });
            return;
          }
        }
        setState({ active: '' });
      };
      div.addEventListener('scroll', scroll, { passive: true });
      return () => div.removeEventListener('scroll', scroll);
    }
    return () => {};
  }, []);
  return (
    <>
      <Anchor
        items={state().headings.map((h) => ({
          id: h.id,
          key: h.key,
          href: `#${h.id}`,
          onclick: () => {
            if (h.dom && store.container) {
              store.container.scroll({
                top: getOffsetTop(h.dom, store.container) - 10,
                behavior: 'smooth',
              });
            }
          },
          title: h.title,
          level: h.level,
        }))}
      />
    </>
  );
});
