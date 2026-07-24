'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Core & Public Plugins
import { ScrollTrigger } from './src/ScrollTrigger.js';
import { ScrollToPlugin } from './src/ScrollToPlugin.js';
import { Flip } from './src/Flip.js';
import { Observer } from './src/Observer.js';
import { TextPlugin } from './src/TextPlugin.js';
import { CustomEase } from './src/CustomEase.js';
import { SplitText } from './src/SplitText.js';
import { DrawSVGPlugin } from './src/DrawSVGPlugin.js';
import { MorphSVGPlugin } from './src/MorphSVGPlugin.js';
import { ScrollSmoother } from './src/ScrollSmoother.js';
import { Draggable } from './src/Draggable.js';
import { InertiaPlugin } from './src/InertiaPlugin.js';
import { MotionPathPlugin } from './src/MotionPathPlugin.js';
import { ScrambleTextPlugin } from './src/ScrambleTextPlugin.js';

// Register plugins on client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    Flip,
    Observer,
    TextPlugin,
    CustomEase,
    SplitText,
    DrawSVGPlugin,
    MorphSVGPlugin,
    ScrollSmoother,
    Draggable,
    InertiaPlugin,
    MotionPathPlugin,
    ScrambleTextPlugin,
    useGSAP
  );
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollToPlugin,
  Flip,
  Observer,
  TextPlugin,
  CustomEase,
  SplitText,
  DrawSVGPlugin,
  MorphSVGPlugin,
  ScrollSmoother,
  Draggable,
  InertiaPlugin,
  MotionPathPlugin,
  ScrambleTextPlugin,
};
