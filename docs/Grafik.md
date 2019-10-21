# Grafik Setup

Viz templates can be added in the blueprint settings of the Showstyle by adding the `GFX Templates` setting. Note: If a grafik is entered in to an iNews script (e.g. `kg bund ...`) but is not in the `GFX Templates` table, Sofie will attempt to play the `bund` template on server 1 with the default duration.

## Table Columns

- iNews Command: e.g. `kg`, the cue command type from iNews
- iNews Name: The name of the template as represented in iNews, e.g. `bund`
- Viz Tempalate Name: The template name in Viz, e.g. `bund`
- Viz Destination: The destination server for the template, e.g. `server 1`
- Out Type: When the template should be taken out. If nothing is set, it will be taken out after the default duration (set by the `Default Template Duration` blueprint setting).
- Variable 1: The name of the first variable needed to be passed to the template, e.g. `triopage=`
- Variable 2: The name of the second variable needed to be passed to the template.
