import Phaser from 'phaser';
import '@fontsource/vt323/latin.css';
import '@fontsource/vt323/latin-ext.css';
import '@fontsource/pirata-one/latin.css';
import '@fontsource/pirata-one/latin-ext.css';
import './style.css';
import { W, H } from './config';
import { BootScene } from './scenes/Boot';
import { LoginScene } from './scenes/Login';
import { AvatarScene } from './scenes/Avatar';
import { MenuScene } from './scenes/Menu';
import { MapScene } from './scenes/MapScene';
import { CombatScene } from './scenes/Combat';
import { RewardScene } from './scenes/Reward';
import { RuneScene } from './scenes/Rune';
import { CampfireScene } from './scenes/Campfire';
import { EndScene } from './scenes/End';
import { HelpScene } from './scenes/Help';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#0d0b10',
  pixelArt: true,
  roundPixels: true,
  dom: { createContainer: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, LoginScene, AvatarScene, MenuScene, MapScene, CombatScene, RewardScene, RuneScene, CampfireScene, EndScene, HelpScene],
});

// acceso de depuración sólo en modo desarrollo (npm run dev)
import { Game } from './state';
if (import.meta.env.DEV) (window as any).__criptas = { game, Game };
