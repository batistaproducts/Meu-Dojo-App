
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

export const DIPLOMA_STYLES: DiplomaStyle[] = [
    {
        id: 'minimalist',
        name: 'Minimalista',
        thumbnail: 'https://picsum.photos/seed/minimalist/200/140',
    },
    {
        id: 'standard',
        name: 'Padrão',
        thumbnail: 'https://picsum.photos/seed/standard/200/140',
    },
    {
        id: 'custom',
        name: 'Meu Diploma',
        thumbnail: 'https://picsum.photos/seed/custom/200/140',
    }
];

export const DIPLOMA_FONTS: DiplomaFont[] = [
  { id: 'cinzel', name: 'Cinzel', className: 'font-cinzel' },
  { id: 'merriweather', name: 'Merriweather', className: 'font-merriweather' },
  { id: 'roboto-slab', name: 'Roboto Slab', className: 'font-roboto-slab' },
  { id: 'montserrat', name: 'Montserrat', className: 'font-montserrat' },
];

export const DIPLOMA_COLOR_SCHEMES: ColorScheme[] = [
    { id: 'gold', name: 'Dourado Clássico', primary: '#a78a4a', secondary: '#4a412b', bg: '#fdfbf5', text: '#3d341d' },
    { id: 'silver', name: 'Prata Elegante', primary: '#8a8a8a', secondary: '#3e3e3e', bg: '#f7f7f7', text: '#2e2e2e' },
    { id: 'bronze', name: 'Bronze Honra', primary: '#b08d57', secondary: '#5c4323', bg: '#f9f6f2', text: '#4a361c' },
    { id: 'modern-blue', name: 'Azul Moderno', primary: '#2563eb', secondary: '#1e3a8a', bg: '#f5f9ff', text: '#1e293b' },
];