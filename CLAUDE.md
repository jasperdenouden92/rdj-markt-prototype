Use token based styling that has already been setup in the repo. Use components that have already been made in this repo and that seem to fit the bill — not external component libraries. If a component does not exist in the repo, say this and ask how to set it up before creating a new one. Always ask whether to use components from an external component library.

Use this Figma Library as a base to build new components when requested: https://www.figma.com/design/p2vDOIBDaBIegvyPHI4JUm/%E2%9D%96-RdJ-%E2%80%93-Library?node-id=43-0&t=equSf8oSv8dZLgmq-1

## Annotaties toevoegen

Het prototype heeft een annotation mode waarmee ontwerpbeslissingen vastgelegd worden. Om een annotatie toe te voegen:

**Wat je nodig hebt van de gebruiker:**
- De pagina of het component (bijv. "markt > eigen aanbod", "gespreksdialoog")
- De annotatie tekst (titel + body)
- Optioneel: een specifiek element waar een marker op moet (bijv. "het eerste lading kaartje")

**Stappen:**

1. Genereer een UUID: `node -e "console.log(crypto.randomUUID())"`
2. Voeg een entry toe aan `src/app/data/annotations.ts` in de `annotations` array:
   - `id`: de gegenereerde UUID
   - `target`: het route-pad (bijv. `"markt/bevrachting/ladingen"`, `"markt/inbox/ladingen"`) of een context-string (`"dialog:conversation"`, `"panel:onderhandeling"`, `"global"`)
   - `elementId`: alleen invullen als er een inline marker gewenst is (vrije string)
   - `title`: korte titel
   - `body`: de volledige annotatie tekst
   - `author`: naam van de auteur (Elwin of Jasper)
   - `date`: datum in ISO formaat (YYYY-MM-DD)
3. Als er een `elementId` is opgegeven, wrap het betreffende element in de juiste pagina/component met:
   ```tsx
   <AnnotationMarker annotationId="de-uuid">{het element}</AnnotationMarker>
   ```
   Import: `import AnnotationMarker from "../components/AnnotationMarker";`
   Als het element in een loop zit (bijv. kaartjes in een kolom), gebruik dan de `wrapCard` prop van `DroppableColumn` of een vergelijkbaar patroon om alleen het juiste element te wrappen.

**Target mapping (veelgebruikt):**
- Markt > Eigen aanbod (ladingen): `"markt/bevrachting/ladingen"`
- Markt > Eigen aanbod (vaartuigen): `"markt/bevrachting/vaartuigen"`
- Markt > Markt aanbod (ladingen): `"markt/inbox/ladingen"`
- Markt > Markt aanbod (vaartuigen): `"markt/inbox/vaartuigen"`
- Markt > Onderhandelingen: `"markt/onderhandelingen/ladingen"`
- Lading detail: `"markt/bevrachting/lading/:id"`
- Vaartuig detail: `"markt/bevrachting/vaartuig/:id"`
- Gespreksdialoog: `"dialog:conversation"`
- Onderhandeling sidepanel: `"panel:onderhandeling"`
- CRM > Relaties: `"crm/relaties"`
- Vloot: `"vloot"`
- Globaal (overal zichtbaar): `"global"`
