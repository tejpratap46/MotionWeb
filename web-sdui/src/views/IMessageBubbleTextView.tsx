import React from 'react';
import type { MotionViewProps, MotionConfig } from '../infra/types';
import { useApplyEffects } from '../effects/useApplyEffects';
import { getAssetUri } from '../infra/assetUtils';

export const IMessageBubbleTextView: React.FC<{
  props: MotionViewProps;
  currentFrame: number;
  config: MotionConfig;
}> = ({ props, currentFrame, config }) => {
  const style = useApplyEffects(props, currentFrame, config);

  const text = props.text || "";
  const startFrame = props.startFrame;
  const endFrame = props.endFrame;
  const writingSpeed = props.writingSpeed || 1;
  const words = text ? text.split(" ") : [];
  const wordCount = words.length;

  const duration =
    endFrame > startFrame && writingSpeed > 0
      ? (endFrame - startFrame) / writingSpeed
      : endFrame - startFrame;

  const progress =
    duration > 0
      ? Math.min(1, Math.max(0, (currentFrame - startFrame) / duration))
      : 1;

  const visibleWordCount = Math.floor(progress * wordCount);
  const visibleText = words.slice(0, visibleWordCount).join(" ");
  const hiddenText = words.slice(visibleWordCount).join(" ");

  const isOutgoing = props.isOutgoing !== false;
  const bubbleColor = props.bubbleColor || (isOutgoing ? '#007AFF' : '#26252A');
  const textColor = props.textColor || '#FFFFFF';

  const getFontSize = (variant?: string) => {
    switch (variant) {
      case 'H1': return '3.5rem';
      case 'H2': return '2.75rem';
      case 'H3': return '2rem';
      case 'H4': return '1.5rem';
      case 'H5': return '1.25rem';
      case 'H6': return '1rem';
      case 'P': return '1.1rem';
      default: return '1.8rem';
    }
  };

  const fontFamily = props.fontAsset ? getAssetUri(props.fontAsset) : undefined;

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
        justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
        paddingLeft: isOutgoing ? '120px' : '40px',
        paddingRight: isOutgoing ? '40px' : '120px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor: bubbleColor,
          color: textColor,
          padding: '16px 24px',
          borderRadius: isOutgoing ? '26px 26px 6px 26px' : '26px 26px 26px 6px',
          maxWidth: '75%',
          width: 'fit-content',
          fontSize: getFontSize(props.textSizeVariant),
          fontFamily: fontFamily,
          lineHeight: 1.25,
          wordBreak: 'break-word',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}
      >
        <span>
          {visibleText}
          {hiddenText && (
            <>
              {visibleText ? ' ' : ''}
              <span style={{ opacity: props.unwrittenTextAlpha ?? 0 }}>{hiddenText}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
};
