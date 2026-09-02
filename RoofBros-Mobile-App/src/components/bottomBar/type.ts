import React from 'react';

export interface props {
  item: BottomBarItem;
  index: number;
  selectedIndex: number;
}

export interface BottomBarItem {
  id: number;
  name?: React.ReactNode;
  default?: number;
  darkMode?: number;
  selected?: number;
  route: string;
  action?: boolean;
}
