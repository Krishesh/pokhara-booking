import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pokhara Booking",
    short_name: "Pokhara Booking",
    description: "Compare and request adventure activities in Pokhara, Nepal.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7f5",
    theme_color: "#0a5640",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
