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

// FIX: Add missing constants for Diploma Generator feature
export const DIPLOMA_STYLES: DiplomaStyle[] = [
  { id: 'standard', name: 'Padrão', thumbnail: 'https://picsum.photos/seed/standard/200/283' },
  { id: 'minimalist', name: 'Minimalista', thumbnail: 'https://picsum.photos/seed/minimalist/200/283' },
  { id: 'custom', name: 'Meu Diploma', thumbnail: 'https://picsum.photos/seed/custom/200/283' },
];

export const DIPLOMA_FONTS: DiplomaFont[] = [
  { id: 'serif', name: 'Clássica (Serif)', className: 'font-serif' },
  { id: 'sans', name: 'Moderna (Sans-Serif)', className: 'font-sans' },
  { id: 'mono', name: 'Máquina de Escrever (Mono)', className: 'font-mono' },
];

export const DIPLOMA_COLOR_SCHEMES: ColorScheme[] = [
  { id: 'classic', name: 'Clássico', primary: '#A52A2A', secondary: '#C0C0C0', text: '#333333', bg: '#F5F5DC' },
  { id: 'modern', name: 'Moderno', primary: '#000080', secondary: '#E0E0E0', text: '#212121', bg: '#FFFFFF' },
  { id: 'dark', name: 'Escuro', primary: '#FFD700', secondary: '#4A4A4A', text: '#F5F5F5', bg: '#1E1E1E' },
  { id: 'elegant', name: 'Elegante', primary: '#4B0082', secondary: '#D8BFD8', text: '#303030', bg: '#FAF7FA' },
];
