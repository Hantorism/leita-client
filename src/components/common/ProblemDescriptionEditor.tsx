import React, { useEffect, useCallback } from "react";
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import 'katex/dist/katex.min.css';

const MenuBar = ({ editor, onInsertInlineMath, onInsertBlockMath }) => {
    const editorState = useEditorState({
        editor,
        selector: ctx => ({
            isBold: ctx.editor.isActive('bold'),
            canBold: ctx.editor.can().chain().toggleBold().run(),
            isBulletList: ctx.editor.isActive('bulletList'),
            canBulletList: ctx.editor.can().chain().toggleBulletList().run(),
            isOrderedList: ctx.editor.isActive('orderedList'),
            canOrderedList: ctx.editor.can().chain().toggleOrderedList().run(),
            canSetHardBreak: ctx.editor.can().chain().setHardBreak().run(),
            isCode: ctx.editor.isActive('code'),
            canCode: ctx.editor.can().chain().toggleCode().run(),
        }),
    });

    if (!editor || !editorState) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 mb-2">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editorState.canBold}
                className={`px-2 py-1 rounded-md transition bg-[#2A2A2A] text-white text-sm hover:text-[#CAFF33] ${editorState.isBold ? 'bg-[#CAFF33] text-black' : ''}`}
            >
                Bold
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={!editorState.canBulletList}
                className={`px-2 py-1 rounded-md transition bg-[#2A2A2A] text-white text-sm hover:text-[#CAFF33] ${editorState.isBulletList ? 'bg-[#CAFF33] text-black' : ''}`}
            >
                Bullet List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={!editorState.canOrderedList}
                className={`px-2 py-1 rounded-md transition bg-[#2A2A2A] text-white text-sm hover:text-[#CAFF33] ${editorState.isOrderedList ? 'bg-[#CAFF33] text-black' : ''}`}
            >
                Ordered List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setHardBreak().run()}
                disabled={!editorState.canSetHardBreak}
                className="px-2 py-1 rounded-md transition bg-[#2A2A2A] text-white text-sm hover:text-[#CAFF33]"
            >
                Hard Break
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editorState.canCode}
                className={`px-2 py-1 rounded-md transition bg-[#2A2A2A] text-white text-sm hover:text-[#CAFF33] ${editorState.isCode ? 'bg-[#CAFF33] text-black' : ''}`}
            >
                Code
            </button>
            <button
                type="button"
                onClick={onInsertInlineMath}
                className="px-2 py-1 rounded-md transition bg-[#2A2A2A] text-white text-sm hover:text-[#CAFF33]"
            >
                Inline Math
            </button>
            <button
                type="button"
                onClick={onInsertBlockMath}
                className="px-2 py-1 rounded-md transition bg-[#2A2A2A] text-white text-sm hover:text-[#CAFF33]"
            >
                Block Math
            </button>
        </div>
    );
};


const ProblemDescriptionEditor = ({ content, onChange, className, rows, readonly }) => {
    const editor = useEditor({
        editable: !readonly,
        extensions: [
            StarterKit.configure({
                blockquote: false,
                codeBlock: false,
                dropcursor: false,
                gapcursor: false,
                heading: false,
                horizontalRule: false,
                italic: false,
                strike: false,
            }),
            Mathematics.configure({
                inlineOptions: {
                    onClick: (node, pos) => {
                        const latex = prompt('Enter inline math expression:', node.attrs.latex);
                        if (latex) {
                            editor.chain().setNodeSelection(pos).updateInlineMath({ latex }).focus().run();
                        }
                    },
                },
                blockOptions: {
                    onClick: (node, pos) => {
                        const latex = prompt('Enter block math expression:', node.attrs.latex);
                        if (latex) {
                            editor.chain().setNodeSelection(pos).updateBlockMath({ latex }).focus().run();
                        }
                    },
                },
            }),
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
            console.log(content);
            onChange(content);
        },
        onCreate: ({ editor: currentEditor }) => {
            migrateMathStrings(currentEditor)
        },
    });

    const onInsertInlineMath = useCallback(() => {
        if (!editor) return;
        const hasSelection = !editor.state.selection.empty;

        if (hasSelection) {
            const { from, to } = editor.state.selection;
            const latex = editor.state.doc.textBetween(from, to, ' ');
            if (!latex) return;
            editor.chain().focus().deleteSelection().insertInlineMath({ latex }).run();
						return;
        }

        const latex = prompt('Enter inline math expression:', '');
        editor.chain().focus().insertInlineMath({ latex }).run();
    }, [editor]);

    const onInsertBlockMath = useCallback(() => {
        if (!editor) return;
        const hasSelection = !editor.state.selection.empty;

        if (hasSelection) {
            const { from, to } = editor.state.selection;
            const latex = editor.state.doc.textBetween(from, to, ' ');
            if (!latex) return;
            editor.chain().focus().deleteSelection().insertBlockMath({ latex }).run();
	          return;
        }

        const latex = prompt('Enter block math expression:', '');
        editor.chain().focus().insertBlockMath({ latex }).run();
    }, [editor]);

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(!readonly);
    }, [readonly, editor]);

    useEffect(() => {
        if (!editor || editor.getHTML() === content) return;
        editor.commands.setContent(content);
    }, [content, editor]);

    const minHeight = rows ? `${rows * 1.5}rem` : 'auto';

    if (!editor) {
        return null;
    }

    return (
        <div
            className={`${className} tiptap-editor prose prose-invert`}
            onClick={() => editor.chain().focus().run()}
        >
            {!readonly &&
                <MenuBar
                    editor={editor}
                    onInsertInlineMath={onInsertInlineMath}
                    onInsertBlockMath={onInsertBlockMath}
                />
            }
            <div style={{ minHeight }}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default ProblemDescriptionEditor;
