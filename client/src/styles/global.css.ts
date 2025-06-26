import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';


globalStyle('*', {
  boxSizing: 'border-box',
});

globalStyle('body', {
  margin: 0,
  padding: 0,
  fontFamily: vars.fonts.body,
  backgroundColor: vars.colors.background,
  color: vars.colors.foreground,
  overscrollBehaviorX: 'none',
  overscrollBehaviorY: 'none',
});

globalStyle('html, body', {
  height: '100%',
  width: '100%',
});

globalStyle('button', {
  fontFamily: 'inherit',
  cursor: 'pointer',
});

globalStyle('input, textarea, select', {
  fontFamily: 'inherit',
});

globalStyle('h1, h2, h3, h4, h5, h6', {
  fontFamily: vars.fonts.heading,
});

globalStyle('.fade-in', {
  animation: 'fadeIn 250ms ease-in',
});