import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isInternalChange = useRef(false);

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            const quill = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ],
                }
            });

            quill.on('text-change', () => {
                isInternalChange.current = true;
                const content = quill.root.innerHTML;
                onChange(content === '<p><br></p>' ? '' : content);
            });

            quillRef.current = quill;
        }
    }, [onChange]);

    useEffect(() => {
        if (quillRef.current) {
            const currentContent = quillRef.current.root.innerHTML;
            // Only update if the new value is different and we didn't just type it
            if (value !== currentContent && !isInternalChange.current) {
                // Determine if the difference is meaningful to allow external updates (like reset)
                quillRef.current.root.innerHTML = value || '';
            }
            // Reset internal change flag after render cycle check
            if (isInternalChange.current) {
                isInternalChange.current = false;
            }
        }
    }, [value]);

    return (
        <div className="bg-white rounded-lg overflow-hidden text-black">
            <div ref={editorRef} style={{ height: '300px' }} />
        </div>
    );
}
