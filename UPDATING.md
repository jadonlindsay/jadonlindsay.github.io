# Updating your site

You never need to edit layout code. Everything you'd want to change is in a content file or a photo folder.

The easy way: put new files in `portfolio_photos/<project>/`, update the matching file in `_handoff/content/` if the story changed, and ask Claude Code to "sync the site from _handoff."

To do it yourself, here's where everything lives.

| What | Where |
|---|---|
| Project text and photo lists | `src/content/projects/` (one file per project) |
| Project photos | `src/assets/projects/<project>/` |
| Videos | `public/media/<project>/` |
| Chart numbers | `src/data/` |
| About section | `src/content/about.md` |
| Name, headline, GPA, email, LinkedIn, accent color | `site.config.json` |
| Resume | `public/resume.pdf` |

## 1. Add a new project

1. Copy `src/content/projects/_template.mdx` and rename it. The file name becomes the web address, so `thermal-rig.mdx` becomes `jadonlindsay.com/thermal-rig/`.
2. Make a folder with the same name in `src/assets/projects/` and put the photos in it.
3. Fill in the fields at the top of the file and write the story below them. Every field is explained in the template.

Avoid the characters `{` and `<` in your writing, because these files treat them as code.

## 2. Swap or add a photo

1. Drop the file in the project's folder in `src/assets/projects/`. Use lowercase names with dashes and no spaces, like `frame-revisions.jpg`. Images are resized automatically.
2. In the project's content file, add a line under `gallery:`:

   ```yaml
   - { src: frame-revisions.jpg, section: frame-revisions, alt: "Four printed frames side by side", caption: "Rev 1 to Rev 4" }
   ```

   `section` decides where it shows up on the page, and `alt` describes the photo for screen readers.

**Filling a "Coming soon" frame:** find the line with `placeholder: true`, remove that, and add `src:` and `alt:`.

These are waiting on the rover (`triphibian-rover.mdx`):

- **Four printed frame revisions:** the placeholder in `section: frame-revisions`.
- **Assembly progress photos:** the placeholder in `section: assembly`.

**Updating the rover's 3D model:** replace `public/media/triphibian-rover/triphibian-rover.glb`, keeping that exact name. On any project, setting `model3d:` adds the 3D viewer, and leaving it empty hides it.

## 3. Update a chart's numbers

Open the chart's file in `src/data/` and change the `y` value next to its `x` value. The chart redraws itself. For example, the draft angle reruns for 0° and 20° go in `rover-draft-angle.json`.

## 4. Replace the resume, headshot, or contact links

- **Resume:** replace `public/resume.pdf`, keeping that exact name.
- **Headshot:** replace `src/assets/projects/home/headshot.jpg`, keeping that exact name.
- **Email, LinkedIn, headline, GPA:** edit `site.config.json`.

## 5. Reorder, feature, or hide a project

In the project's content file:

- **Reorder:** change `order:`. Lower numbers come first, and the lowest in `group: work` gets the large card.
- **Hide from the home page:** set `featured: false`.

## 6. Preview and publish

**Preview on your computer.** In Terminal, from this folder:

```bash
npm.cmd run dev
```

Then open the address it prints, usually `http://localhost:4321`. Changes appear as you save. Press Ctrl+C to stop.

**Publish.** Send your changes to the `main` branch on GitHub, or ask Claude Code to publish. GitHub rebuilds the site by itself, and it's live a couple of minutes later. To watch it, or to see an error if a build fails, open the **Actions** tab of the repository. A failed build leaves your current site online.
