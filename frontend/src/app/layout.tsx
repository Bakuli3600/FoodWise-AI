import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FOODWISE AI | Food Waste Detection & Sustainability Platform',
  description: 'AI-Based Food Waste Detection and Categorization System Using YOLOv11 Instance Segmentation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
