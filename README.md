# main-website

Main website for [bryce.me](https://bryce.me) - a personal portfolio website featuring an interactive WebGL portal cube and information about my work in computer vision, photography, and graphics.

## Features

- **Interactive 3D Portal Cube**: Built with Three.js and the custom [webgl-portals](https://github.com/bryce-evans/webgl-portals) framework
- **Hover Interactions**: Objects inside portals highlight and "jiggle" when hovered over
- **Responsive Design**: Works on desktop and mobile devices
- **Static Site**: No build step required, can be deployed to any static hosting

## Tech Stack

- **Three.js** (r181) - 3D graphics and rendering
- **WebGL Portals** - Custom portal rendering framework (git submodule)
- **Vanilla JavaScript** (ES6 modules) - No framework dependencies
- **CSS3** - Responsive styling with watercolor texture backgrounds

## Project Structure

```
main-website/
├── index.html              # Main landing page
├── css/                    # Stylesheets
│   ├── main.css           # Main styles
│   ├── fadein.css         # Fade-in animations
│   └── skew.css           # Skew effects
├── images/                 # Images and icons
│   ├── favicon.ico
│   └── *.jpg, *.png, *.svg
├── js/                     # JavaScript modules
│   ├── MainPortalCube.js  # Main portal cube setup
│   ├── PortalHoverManager.js # Hover interaction system
│   └── scenes/            # Portal scene definitions
├── fonts/                  # Custom fonts
├── icons/                  # Social media icons
├── webgl-portals/         # Git submodule (portal framework)
├── why-zh.html
├── eulogy-for-a-cat.html
├── mycolor.html
└── .do/                    # DigitalOcean deployment config
```

## Getting Started

### Prerequisites

- A web server (any static file server will work)
- Git (for cloning submodules)

### Installation

Initialize and checkout submodules:
```bash
git submodule update --init --recursive
git submodule foreach --recursive git checkout master
```

### Running Locally

You need to serve the site through a web server (not just opening `index.html` directly) because ES6 modules require proper MIME types and CORS headers.


# Create server to serve to http://localhost:8000
```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node
npx http-server
```

### Debug Mode

Press `D` to toggle debug mode, which allows you to view individual portal scenes:
- Press `1-6` to view individual scenes
- Press `0` to view all scenes (normal mode)

## Deployment

Push to `prod` branch for deployment.
See `.do/app.yaml` for the configuration.


### Clean URLs

The `404.html` handler provides clean URL support, automatically redirecting:
- `/why-zh` → `/why-zh.html`
- `/path/` → `/path/index.html`

---

## Future Work / Planning Notes

### Things to Include
- bryce.me
- bryce.photo
- GitHub profile
- Resume
- Companies?
- Projects?
- Other interests?

### Professional Focus Areas
- Vision?
- ML?
- Graphics?
- Education

**Question**: Where to put resume?

### Section Layout Ideas

**Option 1:**
1. Splash
2. (color) Professional
3. More background and projects
4. (color) Personal
5. More background and specific projects
6. (footer) Links

**Option 2:**
1. Splash
2. (color) Professional
3. Photography
4. (color) Background and history (education, projects)
5. TBD
6. (footer) Links

### Links to Include
- bryce.me
- bryce.photo
- GitHub: bryce-evans

### Resources & References

**Fonts:**
- [Geometos Neue](https://www.fontspring.com/fonts/graphite/geometos-neue)

**Inspiration:**
- [CodePen Reference](https://codepen.io/enbee81/full/yLyrmyg)

**Background Texture:**
- [Unsplash Image](https://images.unsplash.com/photo-1601662528567-526cd06f6582?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3716&q=80)