import { VercelRequest, VercelResponse } from "@vercel/node";

const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const NOTION_PROJECT_ID = process.env.NOTION_PROJECT_ID!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return res.status(200).setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type")
      .end();
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    if (req.method === "GET") {
      return await handleGet(req, res);
    } else if (req.method === "POST") {
      return await handlePost(req, res);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Comments API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { annotationId } = req.query;

  const filter: any = {
    and: [
      {
        property: "Project",
        relation: {
          contains: NOTION_PROJECT_ID,
        },
      },
    ],
  };

  if (annotationId && typeof annotationId === "string") {
    filter.and.push({
      property: "Annotatie ID",
      rich_text: {
        equals: annotationId,
      },
    });
  }

  const response = await fetch(
    `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter,
        sorts: [{ timestamp: "created_time", direction: "ascending" }],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Notion query error:", error);
    return res.status(response.status).json({ error: "Notion API error" });
  }

  const data = await response.json();

  const comments = data.results.map((page: any) => ({
    id: page.id,
    annotationId: getPlainText(page.properties["Annotatie ID"]),
    auteur: getPlainText(page.properties["Auteur"]),
    comment: getPlainText(page.properties["Comment"]),
    label: getPlainText(page.properties["Label"]),
    status: page.properties["Status"]?.select?.name ?? null,
    aangemaakt: page.properties["Aangemaakt"]?.created_time ?? page.created_time,
    antwoord: getPlainText(page.properties["Antwoord"]),
    pagina: getPlainText(page.properties["Pagina"]),
  }));

  return res.status(200).json(comments);
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { annotationId, auteur, comment, pagina, label } = req.body;

  if (!annotationId || !comment) {
    return res.status(400).json({ error: "annotationId and comment are required" });
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        Naam: {
          title: [{ text: { content: comment } }],
        },
        Auteur: {
          rich_text: [{ text: { content: auteur || "Anoniem" } }],
        },
        Comment: {
          rich_text: [{ text: { content: comment } }],
        },
        Status: {
          select: { name: "Open" },
        },
        Project: {
          relation: [{ id: NOTION_PROJECT_ID }],
        },
        "Annotatie ID": {
          rich_text: [{ text: { content: annotationId } }],
        },
        Label: {
          rich_text: [{ text: { content: label || "" } }],
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Notion create error:", error);
    return res.status(response.status).json({ error: "Notion API error" });
  }

  const page = await response.json();

  return res.status(201).json({
    id: page.id,
    annotationId,
    auteur: auteur || "Anoniem",
    comment,
    label: label || "",
    status: "Open",
    aangemaakt: page.created_time,
    antwoord: "",
    pagina: pagina || "",
  });
}

function getPlainText(property: any): string {
  if (!property) return "";
  if (property.rich_text) {
    return property.rich_text.map((t: any) => t.plain_text).join("");
  }
  if (property.title) {
    return property.title.map((t: any) => t.plain_text).join("");
  }
  return "";
}
