import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'DiveGlobe',
  description: 'Interactive globe of dive sites around the world',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="dg-body">
        <header><Header /></header>
        <div className="dg-content">{children}</div>
        <footer><Footer /></footer>
      </body>
    </html>
  );
}
