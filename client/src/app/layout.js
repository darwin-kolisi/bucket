import { Geist } from 'next/font/google';
import { Provider } from './providers/Provider';
import { ErrorToastProvider } from '@/components/ui/ErrorToastProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <Provider>
          <ErrorToastProvider>{children}</ErrorToastProvider>
        </Provider>
      </body>
    </html>
  );
}
