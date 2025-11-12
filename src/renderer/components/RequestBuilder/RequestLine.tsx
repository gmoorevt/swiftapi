/**
 * Request Line Component
 *
 * Combines method selector, URL input, and send button in one clean row
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { requestLineStyles } from '../../styles/layouts';
import { MethodSelector } from './MethodSelector';
import { UrlInput } from './UrlInput';
import { SendButton } from './SendButton';

export function RequestLine(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <div style={requestLineStyles.container(theme)}>
      <div style={requestLineStyles.methodSelector()}>
        <MethodSelector />
      </div>
      <div style={requestLineStyles.urlInput()}>
        <UrlInput />
      </div>
      <div style={requestLineStyles.sendButton()}>
        <SendButton />
      </div>
    </div>
  );
}
