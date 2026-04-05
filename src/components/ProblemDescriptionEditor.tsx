import { ImageModal } from '@components';
import Image from '@tiptap/extension-image';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import { type Editor, EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Logger } from '@utils';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import 'katex/dist/katex.min.css';

interface MenuBarProps {
  editor: Editor;
  onInsertMath: (type: 'inline' | 'block') => void;
  onInsertImage: () => void;
}

interface ProblemDescriptionEditorProps {
  content: string;
  onChange?: (content: string) => void;
  className: string;
  rows: number;
  readonly?: boolean;
}

interface MenuButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  children: ReactNode;
}

const MenuButton = ({ onClick, disabled, isActive, children }: MenuButtonProps) => {
  const baseClasses = 'px-2 py-1 rounded-md transition bg-[#2A2A2A] text-white text-sm hover:text-[#CAFE33]';
  const activeClasses = 'bg-[#CAFE33] !text-black';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${isActive ? activeClasses : ''}`}
    >
      {children}
    </button>
  );
};

const MenuBar = ({ editor, onInsertMath, onInsertImage }: MenuBarProps) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive('bold'),
      canBold: ctx.editor.can().chain().toggleBold().run(),
      isBulletList: ctx.editor.isActive('bulletList'),
      canBulletList: ctx.editor.can().chain().toggleBulletList().run(),
      isOrderedList: ctx.editor.isActive('orderedList'),
      canOrderedList: ctx.editor.can().chain().toggleOrderedList().run(),
      canSetHardBreak: ctx.editor.can().chain().setHardBreak().run(),
      isCode: ctx.editor.isActive('code'),
      canCode: ctx.editor.can().chain().toggleCode().run(),
      isCodeBlock: ctx.editor.isActive('codeBlock'),
      canCodeBlock: ctx.editor.can().chain().toggleCodeBlock().run(),
    }),
  });

  if (!editor || !editorState) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        isActive={editorState.isBold}
      >
        Bold
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editorState.canBulletList}
        isActive={editorState.isBulletList}
      >
        Bullet List
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editorState.canOrderedList}
        isActive={editorState.isOrderedList}
      >
        Ordered List
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setHardBreak().run()} disabled={!editorState.canSetHardBreak}>
        Hard Break
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
        isActive={editorState.isCode}
      >
        Code
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={!editorState.canCodeBlock}
        isActive={editorState.isCodeBlock}
      >
        Code Block
      </MenuButton>
      <MenuButton onClick={() => onInsertMath('inline')}>Inline Math</MenuButton>
      <MenuButton onClick={() => onInsertMath('block')}>Block Math</MenuButton>
      <MenuButton onClick={onInsertImage}>Image</MenuButton>
    </div>
  );
};

const ProblemDescriptionEditor = ({ content, onChange, className, rows, readonly }: ProblemDescriptionEditorProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const createMathClickHandler = (type: 'inline' | 'block') => (node: any, pos: number) => {
    if (!editor) return;

    const latex = prompt(`Enter ${type} math expression:`, node.attrs.latex);
    if (!latex) return;

    const command = type === 'inline' ? 'updateInlineMath' : 'updateBlockMath';
    return editor.chain().focus().setNodeSelection(pos)[command]({ latex }).run();
  };

  const editor = useEditor({
    editable: !readonly,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        dropcursor: false,
        gapcursor: false,
        heading: false,
        horizontalRule: false,
        italic: false,
        strike: false,
      }),
      Mathematics.configure({
        inlineOptions: {
          onClick: createMathClickHandler('inline'),
        },
        blockOptions: {
          onClick: createMathClickHandler('block'),
        },
      }),
      Image,
    ],
    editorProps: {
      handleKeyDown(view, event) {
        // Block Underline
        if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
          event.preventDefault();
          return true;
        }
        // Let other keys pass through
        return false;
      },
    },
    content: content,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      Logger.print(content);
      if (onChange) {
        onChange(content);
      }
    },
    onCreate: ({ editor: currentEditor }) => {
      migrateMathStrings(currentEditor);
    },
  });

  const onInsertMath = useCallback(
    (type: 'inline' | 'block') => {
      if (!editor) return;

      const command = type === 'inline' ? 'insertInlineMath' : 'insertBlockMath';

      const { selection } = editor.state;
      if (!selection.empty) {
        const { from, to } = selection;
        const latex = editor.state.doc.textBetween(from, to, ' ');
        if (!latex) return;
        return editor.chain().focus().deleteSelection()[command]({ latex }).run();
      }

      const latex = prompt(`Enter ${type} math expression:`);
      if (!latex) return;
      return editor.chain().focus()[command]({ latex }).run();
    },
    [editor]
  );

  const onInsertImage = useCallback(() => {
    setIsImageModalOpen(true);
  }, []);

  const handleInsertImage = useCallback(
    (url: string) => {
      if (!url || !editor) return;

      editor.chain().focus().setImage({ src: url }).run();
      setIsImageModalOpen(false);
    },
    [editor]
  );

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!readonly);
  }, [readonly, editor]);

  useEffect(() => {
    if (!editor || editor.getHTML() === content) return;

    editor.commands.setContent(content || '');
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={`${className} tiptap-editor prose prose-invert`} onClick={() => editor.chain().focus().run()}>
      {!readonly && <MenuBar editor={editor} onInsertMath={onInsertMath} onInsertImage={onInsertImage} />}
      <ImageModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onInsert={handleInsertImage} />
      <div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default ProblemDescriptionEditor;
