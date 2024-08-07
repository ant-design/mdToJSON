import { Image } from 'antd';
import React, { useCallback, useLayoutEffect } from 'react';
import { useGetSetState } from 'react-use';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ElementProps, MediaNode } from '../../el';
import { useSelStatus } from '../../hooks/editor';
import { mediaType } from '../utils/dom';
import { EditorUtils } from '../utils/editorUtils';

export function Media({
  element,
  attributes,
  children,
}: ElementProps<MediaNode>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, path, store] = useSelStatus(element);
  const htmlRef = React.useRef<HTMLDivElement>(null);
  const [state, setState] = useGetSetState({
    height: element.height,
    dragging: false,
    loadSuccess: true,
    url: '',
    selected: false,
    type: mediaType(element.url),
  });

  const updateElement = useCallback(
    (attr: Record<string, any>) => {
      Transforms.setNodes(store.editor, attr, { at: path });
    },
    [path],
  );

  const initial = useCallback(async () => {
    let type = mediaType(element.url);
    type = !type ? 'image' : type;
    setState({
      type: ['image', 'video', 'autio'].includes(type!) ? type! : 'other',
    });
    let realUrl = element.url;
    setState({ url: realUrl });
    if (state().type === 'image' || state().type === 'other') {
      const img = document.createElement('img');
      img.referrerPolicy = 'no-referrer';
      img.crossOrigin = 'anonymous';
      img.src = realUrl!;
      img.onerror = () => {
        setState({ loadSuccess: false });
      };
      img.onload = () => setState({ loadSuccess: true });
    }
    if (!element.mediaType) {
      updateElement({
        mediaType: state().type,
      });
    }
  }, [element]);

  useLayoutEffect(() => {
    if (element.downloadUrl) {
      return;
    }
    initial();
  }, [element.url, element.downloadUrl]);

  return (
    <div {...attributes}>
      <div
        data-be={'media'}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
        draggable={true}
        onContextMenu={(e) => {
          e.stopPropagation();
        }}
        onDragStart={(e) => {
          try {
            store.dragStart(e);
            store.dragEl = ReactEditor.toDOMNode(store.editor, element);
          } catch (e) {}
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (!store.focus) {
            EditorUtils.focus(store.editor);
          }
          EditorUtils.selectMedia(store, path);
        }}
      >
        {state().type === 'image' && (
          <div
            style={{
              color: 'transparent',
              padding: 4,
            }}
            ref={htmlRef}
            contentEditable={false}
          >
            <Image
              src={state().url}
              alt={'image'}
              referrerPolicy={'no-referrer'}
              crossOrigin={'anonymous'}
              draggable={false}
              width={'100%'}
              style={{
                display: state().loadSuccess ? 'block' : 'none',
                width: '100%',
                height: 'auto',
                position: 'relative',
                zIndex: 99,
                minWidth: 200,
                minHeight: 20,
              }}
            />
          </div>
        )}
        <span
          style={{
            fontSize: (htmlRef.current?.clientHeight || 200) * 0.75,
            width: '2px',
            height: (htmlRef.current?.clientHeight || 200) * 0.75,
            lineHeight: 1,
          }}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
