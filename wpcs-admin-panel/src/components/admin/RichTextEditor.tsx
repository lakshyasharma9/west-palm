import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { uploadToS3 } from '@/lib/api';
import { useRef, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered,
  Heading1, Heading2, Heading3,
  Quote, Undo, Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Code, Loader2, Images,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ─── Image group CSS injected into the editor ────────────────────────────────
const EDITOR_IMAGE_STYLES = `
  /* Single image */
  .ProseMirror img {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 12px 0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.10);
    cursor: default;
  }

  /* Image group wrappers */
  .img-group {
    display: grid;
    gap: 10px;
    margin: 16px 0;
  }
  .img-group-1  { grid-template-columns: 1fr; }
  .img-group-2  { grid-template-columns: 1fr 1fr; }
  .img-group-3  { grid-template-columns: 1fr 1fr 1fr; }
  .img-group-4  { grid-template-columns: 1fr 1fr 1fr; }
  .img-group-5  { grid-template-columns: 1fr 1fr 1fr; }
  .img-group-6  { grid-template-columns: 1fr 1fr 1fr; }

  /* 4-image: 4th spans full width */
  .img-group-4 img:nth-child(4) { grid-column: 1 / -1; }

  /* 5-image: 4th and 5th in second row of 2 */
  .img-group-5 img:nth-child(4),
  .img-group-5 img:nth-child(5) { grid-column: span 1; }
  .img-group-5 { grid-template-columns: 1fr 1fr 1fr; }
  .img-group-5 img:nth-child(4) { grid-column: 1 / 2; }
  .img-group-5 img:nth-child(5) { grid-column: 2 / 3; }

  .img-group img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    margin: 0 !important;
    display: block;
  }

  /* Prose styles */
  .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin: 1.5rem 0 0.75rem; line-height: 1.2; }
  .ProseMirror h2 { font-size: 1.5rem;   font-weight: 700; margin: 1.5rem 0 0.75rem; line-height: 1.2; }
  .ProseMirror h3 { font-size: 1.25rem;  font-weight: 700; margin: 1.25rem 0 0.5rem; line-height: 1.2; color: #146321; }
  .ProseMirror p  { margin: 0.75rem 0; line-height: 1.75; }
  .ProseMirror ul { padding-left: 1.5rem; margin: 0.75rem 0; list-style-type: disc; }
  .ProseMirror ol { padding-left: 1.5rem; margin: 0.75rem 0; list-style-type: decimal; }
  .ProseMirror li { margin: 0.25rem 0; line-height: 1.7; }
  .ProseMirror blockquote {
    border-left: 3px solid #146321;
    padding-left: 1rem;
    margin: 1.25rem 0;
    color: #374151;
    font-style: italic;
  }
  .ProseMirror strong { font-weight: 700; }
  .ProseMirror em     { font-style: italic; }
  .ProseMirror u      { text-decoration: underline; }
  .ProseMirror code   {
    background: #f3f4f6;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.875em;
    font-family: monospace;
  }
  .ProseMirror a { color: #146321; text-decoration: underline; }
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #9ca3af;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
`;

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef      = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'editor-img' },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your newsletter content...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] max-w-none p-4',
      },
    },
  });

  if (!editor) return null;

  // ── Upload a single image ─────────────────────────────────────────────
  const uploadOne = async (file: File): Promise<string | null> => {
    const result = await uploadToS3(file);
    if (result.success) {
      if ('fileUrl' in result && result.fileUrl) return result.fileUrl;
      if ('fileKey' in result && result.fileKey) {
        const key = result.fileKey as string;
        return key.startsWith('http')
          ? key
          : `https://west-palm-files.s3.eu-north-1.amazonaws.com/${key}`;
      }
    }
    return null;
  };

  // ── Single image upload ───────────────────────────────────────────────
  const handleSingleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    e.target.value = '';
    setUploadingImage(true);
    setUploadProgress('Uploading image...');
    try {
      const url = await uploadOne(file);
      if (url) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } else {
        alert('Image upload failed. Please try again.');
      }
    } catch {
      alert('Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
      setUploadProgress('');
    }
  };

  // ── Multi-image upload — inserts as a group ───────────────────────────
  const handleMultiImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !editor) return;
    e.target.value = '';

    setUploadingImage(true);
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);
      const url = await uploadOne(files[i]);
      if (url) urls.push(url);
    }

    setUploadingImage(false);
    setUploadProgress('');

    if (!urls.length) { alert('All uploads failed.'); return; }

    const count = urls.length;
    const cls   = `img-group img-group-${Math.min(count, 6)}`;

    // Build the HTML group and insert it as raw HTML
    const imgTags = urls.map((u, i) =>
      `<img src="${u}" alt="image-${i + 1}" class="editor-img" />`
    ).join('');

    const groupHtml = `<div class="${cls}">${imgTags}</div>`;

    // Insert at cursor using insertContent
    editor.chain().focus().insertContent(groupHtml).run();
  };

  // ── Link ──────────────────────────────────────────────────────────────
  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">

      {/* Inject editor styles */}
      <style>{EDITOR_IMAGE_STYLES}</style>

      {/* Hidden file inputs */}
      <input ref={fileInputRef}      type="file" accept="image/*"   className="hidden" onChange={handleSingleImage} />
      <input ref={multiFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMultiImage} />

      {/* ── Toolbar ── */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1 items-center">

        {/* Formatting */}
        <Button type="button" variant={editor.isActive('bold')      ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBold().run()}      title="Bold">      <Bold          className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('italic')    ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}    title="Italic">    <Italic        className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('underline') ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"> <UnderlineIcon className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('code')      ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleCode().run()}      title="Code">      <Code          className="h-4 w-4" /></Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <Button type="button" variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3"><Heading3 className="h-4 w-4" /></Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists + Quote */}
        <Button type="button" variant={editor.isActive('bulletList')  ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullet List">   <List        className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('orderedList') ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List"> <ListOrdered className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('blockquote')  ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()}  title="Quote">         <Quote       className="h-4 w-4" /></Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link */}
        <Button type="button" variant="ghost" size="sm" onClick={setLink} title="Add Link"><LinkIcon className="h-4 w-4" /></Button>

        {/* Single image */}
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          title="Upload single image"
        >
          {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </Button>

        {/* Multi-image group */}
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => multiFileInputRef.current?.click()}
          disabled={uploadingImage}
          title="Upload multiple images as a group"
        >
          <Images className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo / Redo */}
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo className="h-4 w-4" /></Button>
      </div>

      {/* Upload progress */}
      {uploadingImage && (
        <div className="border-b bg-amber-50 px-4 py-2 flex items-center gap-2 text-sm text-amber-700">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {uploadProgress || 'Uploading...'}
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Hint */}
      <div className="border-t bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground flex gap-4">
        <span><ImageIcon className="h-3 w-3 inline mr-1" />Single image</span>
        <span><Images className="h-3 w-3 inline mr-1" />Multiple images as group (auto-layout)</span>
      </div>
    </div>
  );
}
