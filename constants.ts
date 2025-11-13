// FIX: Import types needed for the new constants.
import { MartialArt, DiplomaStyle, DiplomaFont, ColorScheme } from './types';

export const MARTIAL_ARTS: MartialArt[] = [
  {
    name: "Jiu-Jitsu Brasileiro",
    image: "https://picsum.photos/seed/bjj/600/400",
    belts: [
      { name: "Branca", color: "#FFFFFF" },
      { name: "Azul", color: "#0000FF" },
      { name: "Roxa", color: "#800080" },
      { name: "Marrom", color: "#A52A2A" },
      { name: "Preta", color: "#000000" },
      { name: "Coral", color: "#FF0000" },
      { name: "Vermelha", color: "#FF0000" },
    ],
  },
  {
    name: "Karatê",
    image: "https://picsum.photos/seed/karate/600/400",
    belts: [
      { name: "Branca", color: "#FFFFFF" },
      { name: "Amarela", color: "#FFFF00" },
      { name: "Laranja", color: "#FFA500" },
      { name: "Verde", color: "#008000" },
      { name: "Roxa", color: "#800080" },
      { name: "Marrom", color: "#A52A2A" },
      { name: "Preta", color: "#000000" },
    ],
  },
  {
    name: "Judô",
    image: "https://picsum.photos/seed/judo/600/400",
    belts: [
      { name: "Branca", color: "#FFFFFF" },
      { name: "Cinza", color: "#808080" },
      { name: "Azul", color: "#0000FF" },
      { name: "Amarela", color: "#FFFF00" },
      { name: "Laranja", color: "#FFA500" },
      { name: "Verde", color: "#008000" },
      { name: "Roxa", color: "#800080" },
      { name: "Marrom", color: "#A52A2A" },
      { name: "Preta", color: "#000000" },
    ],
  },
   {
    name: "Taekwondo",
    image: "https://picsum.photos/seed/taekwondo/600/400",
    belts: [
      { name: "Branca", color: "#FFFFFF" },
      { name: "Amarela", color: "#FFFF00" },
      { name: "Laranja", color: "#FFA500" },
      { name: "Verde", color: "#008000" },
      { name: "Azul", color: "#0000FF" },
      { name: "Vermelha", color: "#FF0000" },
      { name: "Preta", color: "#000000" },
    ],
  },
];

// FIX: Add missing constants to resolve import errors in DiplomaForm component.
export const DIPLOMA_STYLES: DiplomaStyle[] = [
    { id: 'standard', name: 'Padrão', thumbnail: 'https://picsum.photos/seed/standard/200/282' },
    { id: 'minimalist', name: 'Minimalista', thumbnail: 'https://picsum.photos/seed/minimalist/200/282' },
    { id: 'custom', name: 'Meu Diploma', thumbnail: 'https://picsum.photos/seed/custom/200/282' },
];

export const DIPLOMA_FONTS: DiplomaFont[] = [
    { id: 'cinzel', name: 'Cinzel', className: 'font-cinzel' },
    { id: 'serif', name: 'Serif Genérico', className: 'font-serif' },
    { id: 'sans', name: 'Sans-Serif', className: 'font-sans' },
];

export const DIPLOMA_COLOR_SCHEMES: ColorScheme[] = [
    { id: 'classic', name: 'Clássico', primary: '#B8860B', secondary: '#D2B48C', text: '#3A3A3A', bg: '#F5F5DC' },
    { id: 'modern', name: 'Moderno', primary: '#DC143C', secondary: '#696969', text: '#2F4F4F', bg: '#FFFFFF' },
    { id: 'dark', name: 'Escuro', primary: '#FFD700', secondary: '#808080', text: '#F5F5F5', bg: '#2C2C2C' },
];
