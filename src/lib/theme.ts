import { useColorScheme } from 'react-native';

const light = {
  bg: '#F6F7F9',
  card: '#FFFFFF',
  text: '#16181D',
  muted: '#6B7280',
  border: '#E3E6EB',
  primary: '#0F766E',
  primaryText: '#FFFFFF',
  income: '#15803D',
  expense: '#B91C1C',
  transfer: '#4F46E5',
  track: '#E9EDF1',
  warn: '#B45309',
};

const dark: typeof light = {
  bg: '#0F1115',
  card: '#181B21',
  text: '#ECEEF2',
  muted: '#9AA1AD',
  border: '#2A2E36',
  primary: '#2DD4BF',
  primaryText: '#04201D',
  income: '#4ADE80',
  expense: '#F87171',
  transfer: '#A5B4FC',
  track: '#262A31',
  warn: '#FBBF24',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
