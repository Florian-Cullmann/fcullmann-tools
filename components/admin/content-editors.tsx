import {
  deleteArticle,
  deleteTool,
  saveArticle,
  saveTool,
} from "@/app/admin/actions";

type ToolEditorValue = {
  id?: string;
  slug?: string;
  nameEn?: string;
  nameDe?: string;
  summaryEn?: string;
  summaryDe?: string;
  descriptionEn?: string;
  descriptionDe?: string;
  category?: string;
  icon?: string;
  status?: string;
  featured?: boolean;
  sortOrder?: number;
};

export function ToolEditor({ tool }: { tool?: ToolEditorValue }) {
  const editing = Boolean(tool?.id);
  return (
    <details className="admin-editor" open={!editing}>
      <summary>
        <span>{editing ? tool?.nameEn : "Add tool"}</span>
        <small>
          {editing
            ? `${tool?.slug} · ${tool?.status}`
            : "Create a localized tool record"}
        </small>
      </summary>
      <form action={saveTool}>
        {tool?.id && <input type="hidden" name="id" value={tool.id} />}
        <div className="admin-form-grid">
          <label>
            Slug
            <input
              name="slug"
              defaultValue={tool?.slug}
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
          </label>
          <label>
            Category
            <input
              name="category"
              defaultValue={tool?.category ?? "formatters"}
              required
            />
          </label>
          <label>
            English name
            <input name="nameEn" defaultValue={tool?.nameEn} required />
          </label>
          <label>
            German name
            <input name="nameDe" defaultValue={tool?.nameDe} required />
          </label>
          <label className="admin-field-wide">
            English summary
            <textarea
              name="summaryEn"
              defaultValue={tool?.summaryEn}
              required
              rows={2}
            />
          </label>
          <label className="admin-field-wide">
            German summary
            <textarea
              name="summaryDe"
              defaultValue={tool?.summaryDe}
              required
              rows={2}
            />
          </label>
          <label className="admin-field-wide">
            English description
            <textarea
              name="descriptionEn"
              defaultValue={tool?.descriptionEn}
              required
              rows={4}
            />
          </label>
          <label className="admin-field-wide">
            German description
            <textarea
              name="descriptionDe"
              defaultValue={tool?.descriptionDe}
              required
              rows={4}
            />
          </label>
          <label>
            Icon key
            <select name="icon" defaultValue={tool?.icon ?? "braces"}>
              <option value="braces">Braces</option>
              <option value="binary">Binary</option>
              <option value="fingerprint">Fingerprint</option>
              <option value="link">Link</option>
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue={tool?.status ?? "DRAFT"}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <label>
            Sort order
            <input
              name="sortOrder"
              type="number"
              min="0"
              max="999"
              defaultValue={tool?.sortOrder ?? 0}
            />
          </label>
          <label className="admin-checkbox">
            <input
              name="featured"
              type="checkbox"
              defaultChecked={tool?.featured}
            />
            Featured on home
          </label>
        </div>
        <div className="admin-form-actions">
          <button className="admin-button admin-button--primary" type="submit">
            {editing ? "Save changes" : "Create tool"}
          </button>
        </div>
      </form>
      {editing && (
        <form className="admin-delete-form" action={deleteTool}>
          <input type="hidden" name="id" value={tool?.id} />
          <button className="admin-button admin-button--danger" type="submit">
            Delete tool
          </button>
        </form>
      )}
    </details>
  );
}

type ArticleEditorValue = {
  id?: string;
  slug?: string;
  titleEn?: string;
  titleDe?: string;
  excerptEn?: string;
  excerptDe?: string;
  contentEn?: string;
  contentDe?: string;
  seoTitleEn?: string | null;
  seoTitleDe?: string | null;
  seoDescriptionEn?: string | null;
  seoDescriptionDe?: string | null;
  status?: string;
  publishedAt?: Date | null;
};

export function ArticleEditor({ article }: { article?: ArticleEditorValue }) {
  const editing = Boolean(article?.id);
  const publishedAt = article?.publishedAt
    ? article.publishedAt.toISOString().slice(0, 16)
    : "";
  return (
    <details className="admin-editor" open={!editing}>
      <summary>
        <span>{editing ? article?.titleEn : "Add article"}</span>
        <small>
          {editing
            ? `${article?.slug} · ${article?.status}`
            : "Write in English and German"}
        </small>
      </summary>
      <form action={saveArticle}>
        {article?.id && <input type="hidden" name="id" value={article.id} />}
        <div className="admin-form-grid">
          <label>
            Slug
            <input
              name="slug"
              defaultValue={article?.slug}
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={article?.status ?? "DRAFT"}>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <label>
            English title
            <input name="titleEn" defaultValue={article?.titleEn} required />
          </label>
          <label>
            German title
            <input name="titleDe" defaultValue={article?.titleDe} required />
          </label>
          <label className="admin-field-wide">
            English excerpt
            <textarea
              name="excerptEn"
              defaultValue={article?.excerptEn}
              required
              rows={3}
            />
          </label>
          <label className="admin-field-wide">
            German excerpt
            <textarea
              name="excerptDe"
              defaultValue={article?.excerptDe}
              required
              rows={3}
            />
          </label>
          <label className="admin-field-wide">
            English Markdown
            <textarea
              className="admin-markdown"
              name="contentEn"
              defaultValue={article?.contentEn}
              required
              rows={14}
            />
          </label>
          <label className="admin-field-wide">
            German Markdown
            <textarea
              className="admin-markdown"
              name="contentDe"
              defaultValue={article?.contentDe}
              required
              rows={14}
            />
          </label>
          <label>
            Publish at
            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={publishedAt}
            />
          </label>
          <span />
          <label>
            English SEO title
            <input
              name="seoTitleEn"
              defaultValue={article?.seoTitleEn ?? ""}
              maxLength={70}
            />
          </label>
          <label>
            German SEO title
            <input
              name="seoTitleDe"
              defaultValue={article?.seoTitleDe ?? ""}
              maxLength={70}
            />
          </label>
          <label>
            English SEO description
            <textarea
              name="seoDescriptionEn"
              defaultValue={article?.seoDescriptionEn ?? ""}
              maxLength={170}
              rows={3}
            />
          </label>
          <label>
            German SEO description
            <textarea
              name="seoDescriptionDe"
              defaultValue={article?.seoDescriptionDe ?? ""}
              maxLength={170}
              rows={3}
            />
          </label>
        </div>
        <div className="admin-form-actions">
          <button className="admin-button admin-button--primary" type="submit">
            {editing ? "Save changes" : "Create article"}
          </button>
        </div>
      </form>
      {editing && (
        <form className="admin-delete-form" action={deleteArticle}>
          <input type="hidden" name="id" value={article?.id} />
          <button className="admin-button admin-button--danger" type="submit">
            Delete article
          </button>
        </form>
      )}
    </details>
  );
}
