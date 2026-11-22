export function getSpeechLocale(languageCode?: string): string {
  if (!languageCode) return 'en-IN';
  const code = languageCode.toLowerCase().trim();
  switch (code) {
    case 'hi':
      return 'hi-IN';
    case 'kn':
      return 'kn-IN';
    case 'te':
      return 'te-IN';
    case 'ta':
      return 'ta-IN';
    case 'mr':
      return 'mr-IN';
    case 'bn':
      return 'bn-IN';
    case 'gu':
      return 'gu-IN';
    case 'pa':
      return 'pa-IN';
    case 'ml':
      return 'ml-IN';
    case 'en':
      return 'en-IN';
    default:
      if (code.includes('-')) return code;
      return `${code}-IN`;
  }
}
