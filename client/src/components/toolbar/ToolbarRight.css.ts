import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';


export const toolbarRight = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});
