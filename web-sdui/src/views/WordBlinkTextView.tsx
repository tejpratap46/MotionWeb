import React from 'react';
import type { MotionViewProps, MotionConfig } from '../infra/types';
import { useApplyEffects } from '../effects/useApplyEffects';
import { interpolateForRange, Easing } from '../infra/interpolation';

export const WordBlinkTextView: React.FC<{ props: MotionViewProps; currentFrame: number; config: MotionConfig }> = ({ props, currentFrame, config }) => {
  const style = useApplyEffects(props, currentFrame, config);

  const text = props.text || "";
  const startFrame = props.startFrame;
  const endFrame = props.endFrame;
  const writingSpeed = props.writingSpeed || 1.0;

  const inferredEndFrame =
    endFrame !== -1 && writingSpeed > 0
      ? Math.floor(startFrame + (endFrame - startFrame) / writingSpeed)
      : endFrame;

  const words = text.split(" ");
  const wordCount = words.length;

  let currentText = text;

  if (inferredEndFrame < endFrame && currentFrame >= inferredEndFrame) {
    currentText = text;
  } else if (wordCount > 0) {
    const progress = interpolateForRange(
      Easing.LINEAR,
      currentFrame,
      startFrame,
      inferredEndFrame,
      0,
      wordCount
    );
    const visibleWordIndex = Math.min(Math.floor(progress), wordCount - 1);
    currentText = words[Math.max(0, visibleWordIndex)] || "";
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        ...style,
      }}
    >
      {currentText}
    </div>
  );
};
