import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    background: {
      light4: 'rgba(255, 255, 255, 0.04)',
      light8: 'rgba(255, 255, 255, 0.08)',
      dark4: 'rgba(0, 0, 0, 0.04)',
      dark12: 'rgba(0, 0, 0, 0.12)',
      paper: '#131E2A',
      default: 'linear-gradient(179.77deg, #152333 0.2%, #17212C 99.8%);',
    },
    primary: {
      light: '#56CCF2',
      main: '#56CCF2',
      contrastText: '#fff',
    },
    secondary: {
      light: '#fff',
      main: '#6FCF97',
      contrastText: '#fff',
    },
    divider: '#2c3036',
    action: {
      selectedOpacity: 1,
    },
    common: {
      white: '#2c3036',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255,255,255, 0.54)',
    },
  },
  typography: {
    fontFamily: "'Open Sans', 'sans-serif'",
    fontWeightBold: 600,
  },
  components: {
    MuiListItem: {
      styleOverrides: {
        selected: {
          background: '#fff',
          backgroundColor: '#fff',
        },
        root: {
          height: 60,
          borderRadius: 1,
        },
      },
    },
  },
});

declare module '@mui/material/styles' {
  interface TypeBackground {
    light4: string;
    light8: string;
    dark4: string;
    dark12: string;
  }
}

export default theme;
