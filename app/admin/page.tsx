import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Database, Eye, Wrench } from "lucide-react";
import { demoArticles, demoTools } from "@/lib/content/demo";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverview() {
  const databaseReady = Boolean(process.env.DATABASE_URL);
  const counts = databaseReady
    ? await Promise.all([
        getDb().tool.count(),
        getDb().article.count(),
        getDb().article.count({ where: { status: "PUBLISHED" } }),
      ])
    : [demoTools.length, demoArticles.length, demoArticles.length];
  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Content at a glance</h1>
          <p>
            Manage the routes visitors use most and keep localized content ready
            to publish.
          </p>
        </div>
        <a className="admin-button" href="/en" target="_blank">
          <Eye size={17} />
          View site
        </a>
      </header>
      {!databaseReady && (
        <div className="admin-notice">
          <Database size={20} />
          <div>
            <strong>Preview mode</strong>
            <p>
              Connect PostgreSQL with <code>DATABASE_URL</code> to create and
              edit content. The public site currently uses the curated demo
              dataset.
            </p>
          </div>
        </div>
      )}
      <div className="admin-metrics">
        <article>
          <Wrench size={21} />
          <span>{counts[0]}</span>
          <p>Tools</p>
        </article>
        <article>
          <BookOpen size={21} />
          <span>{counts[1]}</span>
          <p>Articles</p>
        </article>
        <article>
          <Eye size={21} />
          <span>{counts[2]}</span>
          <p>Published</p>
        </article>
      </div>
      <div className="admin-route-grid">
        <Link href="/admin/tools">
          <span>T-001</span>
          <h2>Tool directory</h2>
          <p>
            Names, localized descriptions, status, featured placement, and usage
            ranking.
          </p>
          <ArrowRight />
        </Link>
        <Link href="/admin/articles">
          <span>W-001</span>
          <h2>Editorial field notes</h2>
          <p>
            Draft, schedule, translate, and publish Markdown articles with SEO
            metadata.
          </p>
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
}
