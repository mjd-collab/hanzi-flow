export interface HanziChar {
  id: string;
  char: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  PLAYING = 'PLAYING',
}

export type QuizMode = 'none' | 'hint';

export interface HanziWriterOptions {
  width?: number;
  height?: number;
  padding?: number;
  strokeColor?: string;
  radicalColor?: string;
  showOutline?: boolean;
  strokeAnimationSpeed?: number;
  delayBetweenStrokes?: number;
  delayBetweenLoops?: number;
  showCharacter?: boolean;
  showHintAfterMisses?: number;
  highlightColor?: string; 
  drawingWidth?: number;
  // Callback for stroke audio
  onStrokeStart?: (data: { strokeNum: number }) => void;
  onCorrectStroke?: (data: { strokeNum: number }) => void;
}

export interface HanziWriterInstance {
  animateCharacter(options?: { onComplete?: () => void, onStrokeStart?: (data: { strokeNum: number }) => void }): void;
  loopCharacterAnimation(): void;
  showCharacter(): void;
  hideCharacter(): void;
  quiz(options?: any): void;
  cancelQuiz(): void;
  setCharacter(char: string): void;
}
