# App icon + splash source images

Drop the following two images here. `npm run generate-assets` turns them into all the Android densities automatically.

| File         | Size        | Used as                                    |
|--------------|-------------|--------------------------------------------|
| `icon.png`   | 1024×1024   | Launcher icon (all densities)              |
| `splash.png` | 2732×2732   | Native splash screen (shown before WebView)|

Easiest setup: take the company logo (the red TIK circle), make sure it's on a solid background or transparent, and save two copies at the sizes above.

If you only have the 256×256 sidebar logo, upscale it first — generating assets from a small source yields blurry launcher icons.

After dropping both files:

```bash
npm run generate-assets
npm run sync
```

Then build the APK — the new icon + splash will be baked in.
