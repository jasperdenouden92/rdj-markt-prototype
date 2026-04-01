import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const PROJECT_ID = process.env.NOTION_PROJECT_ID!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { project, annotationId } = req.query;

      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
          and: [
            {
              property: "Project",
              relation: { contains: PROJECT_ID },
            },
            {
              property: "Annotatie ID",
              rich_text: { equals: annotationId as string },
            },
          ],
        },
        sorts: [{ property: "Aangemaakt", direction: "ascending" }],
      });

      const comments = response.results.map((page: any) => ({
        id: page.id,
        auteur: page.properties.Auteur?.rich_text?.[0]?.plain_text ?? "",
        comment: page.properties.Comment?.rich_text?.[0]?.plain_text ?? "",
        pagina: page.properties.Pagina?.rich_text?.[0]?.plain_text ?? "",
        label: page.properties.Label?.rich_text?.[0]?.plain_text ?? "",
        status: page.properties.Status?.select?.name ?? "Open",
        datum: page.created_time,
      }));

      return res.status(200).json(comments);
    }

    if (req.method === "POST") {
      const { project, annotationId, auteur, comment, pagina, label } = req.body;

      await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          Naam: {
            title: [{ text: { content: `${auteur}: ${comment.slice(0, 40)}` } }],
          },
          Comment: {
            rich_text: [{ text: { content: comment } }],
          },
          Auteur: {
            rich_text: [{ text: { content: auteur } }],
          },
          "Annotatie ID": {
            rich_text: [{ text: { content: annotationId } }],
          },
          Pagina: {
            rich_text: [{ text: { content: pagina || "" } }],
          },
          Label: {
            rich_text: [{ text: { content: label || "" } }],
          },
          Project: {
            relation: [{ id: PROJECT_ID }],
          },
          Status: {
            select: { name: "Open" },
          },
        },
      });

      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("Comments API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
