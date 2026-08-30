import type { Metadata } from "next";
import { Database } from "lucide-react";
import { ArticleEditor } from "@/components/admin/content-editors";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Articles" };

export default async function AdminArticlesPage() {
  const databaseReady = Boolean(process.env.DATABASE_URL);
  const articles = databaseReady
    ? await getDb().article.findMany({ orderBy: { updatedAt: "desc" } })
    : [];
  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Articles</h1>
          <p>
            Maintain both locales together so every published route has a
            complete translation.
          </p>
        </div>
      </header>
      {!databaseReady ? (
        <div className="admin-notice">
          <Database size={20} />
          <div>
            <strong>Database required</strong>
            <p>
              Connect PostgreSQL to create drafts, schedule publication, and
              maintain SEO fields.
            </p>
          </div>
        </div>
      ) : (
        <>
          <ArticleEditor />
          {articles.map((article) => (
            <ArticleEditor key={article.id} article={article} />
          ))}
        </>
      )}
    </div>
  );
}
