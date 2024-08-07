import { observer } from 'mobx-react-lite';
import React from 'react';
import { Node } from 'slate';
import { ElementProps, ParagraphNode } from '../../el';
import { useSelStatus } from '../../hooks/editor';
import { useEditorStore } from '../store';
import { DragHandle } from '../tools/DragHandle';

export const Paragraph = observer((props: ElementProps<ParagraphNode>) => {
  const store = useEditorStore();
  const [selected] = useSelStatus(props.element);
  return React.useMemo(() => {
    const str = Node.string(props.element);
    return (
      <p
        {...props.attributes}
        data-be={'paragraph'}
        className={'drag-el'}
        onDragStart={store.dragStart}
        data-empty={!str && selected ? 'true' : undefined}
      >
        <DragHandle />
        {props.children}
      </p>
    );
  }, [props.element.children, store.refreshHighlight, selected]);
});
