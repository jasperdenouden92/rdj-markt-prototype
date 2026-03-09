/**
 * Generic CRUD routes for all entities in the Rederij de Jong market module.
 * 
 * Routes per entity:
 *   GET    /make-server-53a0cbca/:entity          → list all
 *   GET    /make-server-53a0cbca/:entity/:id       → get one
 *   POST   /make-server-53a0cbca/:entity           → create (generates ID)
 *   PUT    /make-server-53a0cbca/:entity/:id       → update (full replace)
 *   PATCH  /make-server-53a0cbca/:entity/:id       → partial update (merge)
 *   DELETE /make-server-53a0cbca/:entity/:id       → delete one
 *   POST   /make-server-53a0cbca/:entity/batch     → get multiple by IDs
 *   POST   /make-server-53a0cbca/:entity/batch-create → create multiple at once
 * 
 * Special routes:
 *   POST   /make-server-53a0cbca/seed              → seed database with demo data
 *   GET    /make-server-53a0cbca/stats              → entity counts
 */

import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { ENTITY_PREFIXES, VALID_ENTITIES, generateId } from "./entities.tsx";
import { seedDatabase } from "./seed.tsx";

const routes = new Hono();

// ── Seed endpoint ──
routes.post("/make-server-53a0cbca/seed", async (c) => {
  try {
    const result = await seedDatabase();
    return c.json({ success: true, message: `Seeded ${result.count} records` });
  } catch (error) {
    console.log("Seed error:", error);
    return c.json({ success: false, error: `Seed failed: ${error}` }, 500);
  }
});

// ── Stats endpoint ──
routes.get("/make-server-53a0cbca/stats", async (c) => {
  try {
    const stats: Record<string, number> = {};
    for (const [entity, prefix] of Object.entries(ENTITY_PREFIXES)) {
      const items = await kv.getByPrefix(prefix);
      stats[entity] = items.length;
    }
    return c.json({ success: true, data: stats });
  } catch (error) {
    console.log("Stats error:", error);
    return c.json({ success: false, error: `Stats failed: ${error}` }, 500);
  }
});

// ── Validate entity middleware ──
function validateEntity(entity: string): string | null {
  if (!VALID_ENTITIES.includes(entity)) {
    return `Invalid entity "${entity}". Valid entities: ${VALID_ENTITIES.join(", ")}`;
  }
  return null;
}

// ── List all items of an entity ──
routes.get("/make-server-53a0cbca/:entity", async (c) => {
  const entity = c.req.param("entity");
  const err = validateEntity(entity);
  if (err) return c.json({ success: false, error: err }, 400);

  try {
    const prefix = ENTITY_PREFIXES[entity];
    const items = await kv.getByPrefix(prefix);
    return c.json({ success: true, data: items });
  } catch (error) {
    console.log(`List ${entity} error:`, error);
    return c.json({ success: false, error: `Failed to list ${entity}: ${error}` }, 500);
  }
});

// ── Batch get (POST with { ids: [...] }) ──
routes.post("/make-server-53a0cbca/:entity/batch", async (c) => {
  const entity = c.req.param("entity");
  const err = validateEntity(entity);
  if (err) return c.json({ success: false, error: err }, 400);

  try {
    const { ids } = await c.req.json<{ ids: string[] }>();
    if (!ids || !Array.isArray(ids)) {
      return c.json({ success: false, error: "Request body must contain 'ids' array" }, 400);
    }
    const prefix = ENTITY_PREFIXES[entity];
    const keys = ids.map((id) => `${prefix}${id}`);
    const items = await kv.mget(keys);
    return c.json({ success: true, data: items.filter(Boolean) });
  } catch (error) {
    console.log(`Batch get ${entity} error:`, error);
    return c.json({ success: false, error: `Failed to batch get ${entity}: ${error}` }, 500);
  }
});

// ── Batch create (POST with { items: [...] }) ──
routes.post("/make-server-53a0cbca/:entity/batch-create", async (c) => {
  const entity = c.req.param("entity");
  const err = validateEntity(entity);
  if (err) return c.json({ success: false, error: err }, 400);

  try {
    const { items } = await c.req.json<{ items: any[] }>();
    if (!items || !Array.isArray(items)) {
      return c.json({ success: false, error: "Request body must contain 'items' array" }, 400);
    }

    const prefix = ENTITY_PREFIXES[entity];
    const created: any[] = [];
    const keys: string[] = [];
    const values: any[] = [];

    for (const item of items) {
      const id = item.id || generateId();
      const record = { id, ...item, id_override: undefined };
      delete record.id_override;
      keys.push(`${prefix}${id}`);
      values.push(record);
      created.push(record);
    }

    await kv.mset(keys, values);
    return c.json({ success: true, data: created }, 201);
  } catch (error) {
    console.log(`Batch create ${entity} error:`, error);
    return c.json({ success: false, error: `Failed to batch create ${entity}: ${error}` }, 500);
  }
});

// ── Get one item ──
routes.get("/make-server-53a0cbca/:entity/:id", async (c) => {
  const entity = c.req.param("entity");
  const id = c.req.param("id");
  const err = validateEntity(entity);
  if (err) return c.json({ success: false, error: err }, 400);

  try {
    const prefix = ENTITY_PREFIXES[entity];
    const item = await kv.get(`${prefix}${id}`);
    if (!item) {
      return c.json({ success: false, error: `${entity} with id "${id}" not found` }, 404);
    }
    return c.json({ success: true, data: item });
  } catch (error) {
    console.log(`Get ${entity}/${id} error:`, error);
    return c.json({ success: false, error: `Failed to get ${entity}/${id}: ${error}` }, 500);
  }
});

// ── Create item ──
routes.post("/make-server-53a0cbca/:entity", async (c) => {
  const entity = c.req.param("entity");
  const err = validateEntity(entity);
  if (err) return c.json({ success: false, error: err }, 400);

  try {
    const body = await c.req.json();
    const id = body.id || generateId();
    const record = { id, ...body };
    const prefix = ENTITY_PREFIXES[entity];
    await kv.set(`${prefix}${id}`, record);
    return c.json({ success: true, data: record }, 201);
  } catch (error) {
    console.log(`Create ${entity} error:`, error);
    return c.json({ success: false, error: `Failed to create ${entity}: ${error}` }, 500);
  }
});

// ── Update item (full replace) ──
routes.put("/make-server-53a0cbca/:entity/:id", async (c) => {
  const entity = c.req.param("entity");
  const id = c.req.param("id");
  const err = validateEntity(entity);
  if (err) return c.json({ success: false, error: err }, 400);

  try {
    const body = await c.req.json();
    const record = { id, ...body };
    const prefix = ENTITY_PREFIXES[entity];
    await kv.set(`${prefix}${id}`, record);
    return c.json({ success: true, data: record });
  } catch (error) {
    console.log(`Update ${entity}/${id} error:`, error);
    return c.json({ success: false, error: `Failed to update ${entity}/${id}: ${error}` }, 500);
  }
});

// ── Partial update (merge) ──
routes.patch("/make-server-53a0cbca/:entity/:id", async (c) => {
  const entity = c.req.param("entity");
  const id = c.req.param("id");
  const err = validateEntity(entity);
  if (err) return c.json({ success: false, error: err }, 400);

  try {
    const prefix = ENTITY_PREFIXES[entity];
    const existing = await kv.get(`${prefix}${id}`);
    if (!existing) {
      return c.json({ success: false, error: `${entity} with id "${id}" not found` }, 404);
    }
    const body = await c.req.json();
    const record = { ...existing, ...body, id };
    await kv.set(`${prefix}${id}`, record);
    return c.json({ success: true, data: record });
  } catch (error) {
    console.log(`Patch ${entity}/${id} error:`, error);
    return c.json({ success: false, error: `Failed to patch ${entity}/${id}: ${error}` }, 500);
  }
});

// ── Delete item ──
routes.delete("/make-server-53a0cbca/:entity/:id", async (c) => {
  const entity = c.req.param("entity");
  const id = c.req.param("id");
  const err = validateEntity(entity);
  if (err) return c.json({ success: false, error: err }, 400);

  try {
    const prefix = ENTITY_PREFIXES[entity];
    await kv.del(`${prefix}${id}`);
    return c.json({ success: true, message: `Deleted ${entity}/${id}` });
  } catch (error) {
    console.log(`Delete ${entity}/${id} error:`, error);
    return c.json({ success: false, error: `Failed to delete ${entity}/${id}: ${error}` }, 500);
  }
});

export default routes;
