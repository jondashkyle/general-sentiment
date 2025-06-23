import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "general sentiment",
  description: "generally, sentimentally.",
  openGraph: {
    title: "general sentiment",
    description: "generally, sentimentally.",
    images: [
      {
        url: "https://generalsentiment.co/social.png",
        width: 1200,
        height: 630,
        alt: "General Sentiment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "general sentiment",
    description: "generally, sentimentally.",
    images: ["https://generalsentiment.co/social.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
