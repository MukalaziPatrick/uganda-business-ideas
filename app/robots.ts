export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://uganda-business-ideas.vercel.app/sitemap.xml",
  };
}