import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';

/** UI face. */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

/** Data and metrics. Tabular numerals are the point. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const fontVariables = `${spaceGrotesk.variable} ${jetbrainsMono.variable}`;
