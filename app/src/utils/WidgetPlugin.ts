import { registerPlugin } from '@capacitor/core';

export interface WidgetPluginConfig {
  requestPinWidget(): Promise<{ supported: boolean }>;
  updateWidgetData(options: { streak: number; unreadNotifs: number }): Promise<void>;
}

export const WidgetPlugin = registerPlugin<WidgetPluginConfig>('WidgetPlugin');
