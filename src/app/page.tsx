import LandingPage from "@/components/LandingPage";

export const metadata = {
  title: "Quillaborn – Creative Hub for Artists & Writers",
  description:
    "Quillaborn helps creators collaborate on original and fan projects. Join a vibrant community today.",
  openGraph: {
    title: "Quillaborn",
    description: "Collaborate. Create. Connect.",
    url: "https://quillaborn.com",
    images: [
      {
        url: "https://quillaborn.com/og-image.jpg",
        alt: "Quillaborn Cover",
      },
    ],
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
