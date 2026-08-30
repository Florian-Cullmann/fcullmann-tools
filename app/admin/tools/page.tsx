import type { Metadata } from "next";
import { Database } from "lucide-react";
import { ToolEditor } from "@/components/admin/content-editors";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Tools" };

export default async function AdminToolsPage() {
  const databaseReady = Boolean(process.env.DATABASE_URL);
  const tools = databaseReady
    ? await getDb().tool.findMany({
        orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
      })
    : [];
  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Tools</h1>
          <p>
            Featured placement follows actual usage first, then the configured
            sort order.
          </p>
        </div>
      </header>
      {!databaseReady ? (
        <div className="admin-notice">
          <Database size={20} />
          <div>
            <strong>Database required</strong>
            <p>
              Copy <code>.env.example</code>, start PostgreSQL, and run the
              migration and seed commands to enable editing.
            </p>
          </div>
        </div>
      ) : (
        <>
          <ToolEditor />
          {tools.map((tool) => (
            <ToolEditor key={tool.id} tool={tool} />
          ))}
        </>
      )}
    </div>
  );
}
