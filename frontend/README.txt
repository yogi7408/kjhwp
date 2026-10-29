WINDWISE Tailwind CSS React refactor

This is a frontend source patch. It separates page-level state, reusable UI components, API calls and formatting utilities. Components use Tailwind CSS utility classes; the old custom dashboard CSS classes are not required.

Apply it:
1. Stop Docker with Ctrl+C.
2. Copy this package's src folder into frontend/src, replacing matching files. Keep your existing main.jsx.
3. Replace frontend/src/styles.css contents with: @tailwind base; @tailwind components; @tailwind utilities;
4. From the frontend folder run: npm install -D tailwindcss@3 postcss autoprefixer
5. Add tailwind.config.js and postcss.config.js from this package to the frontend folder.
6. Ensure tailwind.config.js content includes ./index.html and ./src/**/*.{js,ts,jsx,tsx}.
7. Run npm run dev, or from project root run docker compose up --build.

Dependencies expected: react, recharts, lucide-react. Existing backend/API contract is unchanged.
