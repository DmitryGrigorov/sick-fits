import type { ThemeConfig } from 'antd';

// Keeps the original Sick Fits brand colours (red/black) while using Ant Design's
// design tokens instead of a bespoke styled-components theme.
const theme: ThemeConfig = {
  token: {
    colorPrimary: '#FF0000',
    colorLink: '#FF0000',
    colorText: '#393939',
    borderRadius: 2,
    fontFamily: "'radnika-next', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

export default theme;
