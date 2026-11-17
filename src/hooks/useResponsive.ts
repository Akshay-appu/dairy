import { DimensionValue, useWindowDimensions } from 'react-native';
import { CARD_GAP, CARD_GAP_LG, CONTENT_MAX_WIDTH, CONTENT_MAX_WIDTH_WIDE } from '../theme';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function useResponsive() {
  const { width } = useWindowDimensions();
  const breakpoint: Breakpoint =
    width >= 1440 ? 'wide' : width >= 1024 ? 'desktop' : width >= 768 ? 'tablet' : 'mobile';
  const isMobile = breakpoint === 'mobile';
  const isWide = breakpoint === 'wide';
  const lg = !isMobile;
  const horizontalPadding = isMobile ? 18 : breakpoint === 'tablet' ? 28 : isWide ? 56 : 40;
  const gridColumns = isWide ? 4 : breakpoint === 'desktop' ? 3 : breakpoint === 'tablet' ? 2 : 1;
  const contentMaxWidth = isWide ? CONTENT_MAX_WIDTH_WIDE : CONTENT_MAX_WIDTH;
  const cardGap = isMobile ? CARD_GAP : CARD_GAP_LG;
  const innerWidth = Math.min(width, contentMaxWidth) - horizontalPadding * 2;
  const cardWidth: DimensionValue =
    gridColumns === 1 ? '100%' : (innerWidth - cardGap * (gridColumns - 1)) / gridColumns;

  return {
    width, breakpoint, isMobile, isWide, lg, horizontalPadding, gridColumns, cardWidth,
    contentMaxWidth, cardGap,
  };
}
