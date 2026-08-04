import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    category: 'Notebooks',
    icon: 'BookOpen',
    name: 'Classic Ruled Notebook — 200 Pages',
    urduName: 'کلاسک نوٹ بک — 200 صفحات',
    stockStatus: 'in',
    stockNote: '142 in stock',
    description: 'Soft-cover ruled notebook, 200 pages, standard A5 size. Widely used for school and office note-taking.',
    units: [
      { label: 'Piece', retailPrice: 145, wholesalePrice: 118, conversionFactor: 1 },
      { label: 'Dozen', retailPrice: 1650, wholesalePrice: 1350, conversionFactor: 12 },
      { label: 'Carton (20 dozen)', retailPrice: 31500, wholesalePrice: 26000, conversionFactor: 240 }
    ]
  },
  {
    id: 'p2',
    category: 'Notebooks',
    icon: 'BookOpen',
    name: 'Spiral Notebook — Single Line 120 Pages',
    urduName: 'سپائرل نوٹ بک — 120 صفحات',
    stockStatus: 'low',
    stockNote: '6 left in stock',
    description: 'Wire-bound single-line notebook, 120 pages with durable tear-resistant spiral binding.',
    units: [
      { label: 'Piece', retailPrice: 95, wholesalePrice: 78, conversionFactor: 1 },
      { label: 'Dozen', retailPrice: 1080, wholesalePrice: 900, conversionFactor: 12 }
    ]
  },
  {
    id: 'p3',
    category: 'Pens & Markers',
    icon: 'PenTool',
    name: 'Gel Pen — Blue (Pack of 10)',
    urduName: 'جیل پین — نیلا (10 کا پیک)',
    stockStatus: 'in',
    stockNote: '88 in stock',
    description: 'Smooth-writing 0.5mm blue gel pens, quick-drying smudge-free ink, pack of 10.',
    units: [
      { label: 'Pack of 10', retailPrice: 320, wholesalePrice: 265, conversionFactor: 1 },
      { label: 'Dozen Packs', retailPrice: 3600, wholesalePrice: 3000, conversionFactor: 12 }
    ]
  },
  {
    id: 'p4',
    category: 'Pens & Markers',
    icon: 'PenTool',
    name: 'Ball Point Pen — Black',
    urduName: 'بال پوائنٹ پین — سیاہ',
    stockStatus: 'in',
    stockNote: '340 in stock',
    description: 'Standard black ballpoint pen, medium tip, comfortable long-lasting write.',
    units: [
      { label: 'Piece', retailPrice: 20, wholesalePrice: 15, conversionFactor: 1 },
      { label: 'Dozen', retailPrice: 220, wholesalePrice: 170, conversionFactor: 12 },
      { label: 'Carton (20 dozen)', retailPrice: 4200, wholesalePrice: 3300, conversionFactor: 240 }
    ]
  },
  {
    id: 'p5',
    category: 'Pens & Markers',
    icon: 'PenTool',
    name: 'Permanent Marker — Black',
    urduName: 'پرمننٹ مارکر — سیاہ',
    stockStatus: 'out',
    stockNote: 'Out of stock',
    description: 'Quick-dry water-resistant permanent marker, bullet tip, bold black ink.',
    units: [
      { label: 'Piece', retailPrice: 85, wholesalePrice: 68, conversionFactor: 1 }
    ]
  },
  {
    id: 'p6',
    category: 'Paper',
    icon: 'FileText',
    name: 'A4 Copier Paper Ream (80gsm)',
    urduName: 'اے4 کاپی پیپر رم',
    stockStatus: 'in',
    stockNote: '64 in stock',
    description: 'High brightness 80gsm A4 copier paper, 500 sheets per ream. Ideal for laser & inkjet printing.',
    units: [
      { label: 'Ream', retailPrice: 980, wholesalePrice: 840, conversionFactor: 1 },
      { label: 'Carton (5 reams)', retailPrice: 4750, wholesalePrice: 4100, conversionFactor: 5 }
    ]
  },
  {
    id: 'p7',
    category: 'Paper',
    icon: 'FileText',
    name: 'A3 Drawing Sheets (Pack of 50)',
    urduName: 'اے3 ڈرائنگ شیٹس (50 کا پیک)',
    stockStatus: 'low',
    stockNote: '4 left in stock',
    description: 'Heavyweight smooth A3 drawing sheets for art, drafting, and design projects.',
    units: [
      { label: 'Pack of 50', retailPrice: 650, wholesalePrice: 540, conversionFactor: 1 }
    ]
  },
  {
    id: 'p8',
    category: 'Paper',
    icon: 'FileText',
    name: 'Chart Paper — Assorted Colours',
    urduName: 'چارٹ پیپر — مختلف رنگ',
    stockStatus: 'in',
    stockNote: '210 in stock',
    description: 'Vibrant assorted color chart paper for school projects, presentations, and poster displays.',
    units: [
      { label: 'Sheet', retailPrice: 40, wholesalePrice: 32, conversionFactor: 1 },
      { label: 'Pack of 25', retailPrice: 900, wholesalePrice: 740, conversionFactor: 25 }
    ]
  },
  {
    id: 'p9',
    category: 'Office Supplies',
    icon: 'Paperclip',
    name: 'Heavy Duty Metal Stapler',
    urduName: 'ہیوی ڈیوٹی اسٹیپلر',
    stockStatus: 'in',
    stockNote: '27 in stock',
    description: 'All-metal heavy duty stapler, staples up to 40 sheets with ergonomic press action.',
    units: [
      { label: 'Piece', retailPrice: 610, wholesalePrice: 520, conversionFactor: 1 }
    ]
  },
  {
    id: 'p10',
    category: 'Office Supplies',
    icon: 'Paperclip',
    name: 'Stapler Pins No.10 (Box of 20)',
    urduName: 'اسٹیپلر پن نمبر 10',
    stockStatus: 'in',
    stockNote: '96 in stock',
    description: 'Standard No.10 staple pins, box of 20 strips. Corrosion resistant galvanized steel.',
    units: [
      { label: 'Box', retailPrice: 35, wholesalePrice: 28, conversionFactor: 1 },
      { label: 'Dozen Boxes', retailPrice: 390, wholesalePrice: 310, conversionFactor: 12 }
    ]
  },
  {
    id: 'p11',
    category: 'Office Supplies',
    icon: 'Paperclip',
    name: 'Correction Tape (8 meters)',
    urduName: 'کریکشن ٹیپ (8 میٹر)',
    stockStatus: 'out',
    stockNote: 'Out of stock',
    description: '8-meter high precision correction tape, dry application for immediate rewriting.',
    units: [
      { label: 'Piece', retailPrice: 110, wholesalePrice: 90, conversionFactor: 1 }
    ]
  },
  {
    id: 'p12',
    category: 'Office Supplies',
    icon: 'Paperclip',
    name: 'Transparent Tape Roll — 1 Inch',
    urduName: 'شفاف ٹیپ رول — 1 انچ',
    stockStatus: 'in',
    stockNote: '150 in stock',
    description: '1 inch clear strong adhesive tape, 40 yard roll for office and packaging.',
    units: [
      { label: 'Roll', retailPrice: 55, wholesalePrice: 42, conversionFactor: 1 },
      { label: 'Dozen Rolls', retailPrice: 600, wholesalePrice: 480, conversionFactor: 12 }
    ]
  }
];

export const CATEGORIES = [
  'All Categories',
  'Notebooks',
  'Pens & Markers',
  'Paper',
  'Office Supplies'
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'Notebooks': 'BookOpen',
  'Pens & Markers': 'PenTool',
  'Paper': 'FileText',
  'Office Supplies': 'Paperclip'
};
