import { jsxRenderer } from "hono/jsx-renderer";
import { ViteClient } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <title>canaan</title>
        <link rel="icon" href="https://fav.farm/%F0%9F%8C%BB" />
        <ViteClient />
        <style>{`
          h1 {
            font-family: Arial, Helvetica, sans-serif;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
              Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          }
          
          img {
            display: block;
            margin: auto;
          }
          
          a {
            text-decoration: underline;
          }
          
          footer {
            font-size: 0.75rem;
            position: fixed;
            left: 4px;
            bottom: 0px;
            height: 30px;
          }
          
          a::after {
            content: "";
            display: block;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
});
