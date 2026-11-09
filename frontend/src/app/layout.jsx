import { Oswald, Karla } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-oswald', display: 'swap' });
const karla = Karla({ subsets: ['latin'], variable: '--font-karla', display: 'swap' });

export const metadata = {
  title: { default: 'Trekking with Rabin | Trekking & Tours', template: '%s | Trekking with Rabin' },
  description:
    'Personal trekking company in Nepal with Rabin — Everest Base Camp, Annapurna, Langtang and peak climbing. Book your Himalayan adventure today.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${oswald.variable} ${karla.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('twr-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}