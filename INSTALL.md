# Install Wobulenzi Financial Partners

## Transfer and install with a USB flash drive

1. Run `Build-Setup.ps1` on the computer that has the project files. It creates `WFP-Setup.exe` in this folder.
2. Copy `WFP-Setup.exe` to the flash drive.
3. On the destination Windows computer, copy the installer from the flash drive and run it. Windows may ask you to confirm that you trust the file.
4. Setup copies the site to the current user's Local AppData folder, creates a desktop shortcut, and opens the site.

The installer does not need administrator privileges. The destination computer needs a modern browser to open the local site. The site files are installed on that computer; browser records remain in that computer's browser storage and are not transferred or synchronized by the installer. Export or back up records separately before changing computers.

## Hosted app installation

To install WFP as a browser app with service-worker offline caching, publish the complete site folder to a web host that serves files over HTTPS. Keep the HTML pages, CSS and JavaScript files, `manifest.webmanifest`, `service-worker.js`, and the `images` folder together. Then open the hosted site in Chrome or Microsoft Edge and choose **Install app** from the browser menu. This browser-app installation needs an internet connection for the first visit. After it caches the app, pages can open offline; records remain in that computer's browser storage.
