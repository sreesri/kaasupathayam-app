import { useColorScheme } from 'react-native';

// Palette from the logo: peacock (#0F4C5C), gold (#E2B33C), ivory and sand (the pathayam chest).
const light = {
  bg: '#FAF5EC', // ivory
  card: '#FFFDF9',
  text: '#1E1A17',
  muted: '#6B6358',
  border: '#E8DCC6', // sand
  primary: '#0F4C5C', // peacock: actions, selection
  primaryText: '#FFFFFF',
  accent: '#E2B33C', // gold: the add button, highlights
  accentText: '#0B3540',
  income: '#2E7D4F',
  expense: '#B4232F',
  transfer: '#3A6EA5',
  track: '#F0E7D6', // progress tracks and the segmented-control groove
  activePill: '#DCEAEC', // behind the active tab's icon
  scrim: 'rgba(11, 23, 27, 0.5)', // behind bottom sheets
  // Categorical chart colours in slot order. Validated (dataviz validate_palette.js) for adjacent
  // and wrap-around pairs against `card`, so assign them by position, never shuffled.
  chart: ['#00849E', '#C98A0E', '#C2508A', '#5C9A2E', '#4B57C2', '#C23B2B'],
  chartOther: '#A39E93',
};

const dark: typeof light = {
  bg: '#0B171B', // deep peacock
  card: '#12242A',
  text: '#F4ECDD', // ivory
  muted: '#A7B0AC',
  border: '#22393F',
  primary: '#E2B33C', // gold reads better than peacock on a dark background
  primaryText: '#1F1600',
  accent: '#E2B33C',
  accentText: '#0B3540',
  income: '#6CCB8E',
  expense: '#F28B8B',
  transfer: '#8FB4E0',
  track: '#1C3238',
  activePill: '#3A3420',
  scrim: 'rgba(0, 0, 0, 0.6)',
  chart: ['#1F9FB8', '#B98822', '#D86A9F', '#5A9832', '#7380DE', '#E0604C'],
  chartOther: '#6E7C79',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Loaded in app/_layout.tsx. Bricolage Grotesque is the wordmark face; Catamaran covers Tamil. */
export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  semibold: 'BricolageGrotesque_600SemiBold',
  medium: 'BricolageGrotesque_500Medium',
  tamil: 'Catamaran_700Bold',
};
