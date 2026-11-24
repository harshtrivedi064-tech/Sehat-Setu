# SehatSetu

## CARTO map configuration

Copy `map-config.example.js` to `map-config.js` and set your CARTO basemaps API key in the copy. The local `map-config.js` is ignored by Git and should not be committed. Restrict browser keys to your site's allowed referrers.

Run the static site from this folder with:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.
