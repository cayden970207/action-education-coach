# Immersive Chat UI + Knowledge Integration Design

## Summary

Redesign the 行动教育·杨静 chatbot from Gemini-style to Apple/Notion minimalist with auto light/dark theme. Integrate PDF knowledge into system prompt.

## UI Design

- **No sidebar** — full-screen immersive layout
- **Welcome screen**: centered brand + greeting + 4 pill suggestion tags + bottom input
- **Chat screen**: centered message stream (720px max), markdown-rendered AI replies, fixed bottom input
- **Theme**: CSS `prefers-color-scheme` auto switch, brand accent `#2563eb`
- **Typography**: `system-ui`, title 48px, body 16px
- **Markdown**: `marked.js` CDN for AI response rendering

## Knowledge Integration

- Extract PDF core content (frameworks, methodology, interview SOP, key quotes) into structured system prompt (~3000-5000 chars)
- No File API — pure system prompt approach for speed

## Files Changed

- `index.html` — remove sidebar, minimalist layout, add marked.js
- `index.css` — new CSS variable system, light/dark themes, minimal typography
- `script.js` — marked.js rendering, remove sidebar logic
- `api/chat.js` — expanded system prompt with PDF knowledge
