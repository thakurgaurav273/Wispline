export interface CometChatOption {
    id: string;
    title: string;
    iconURL?: string;
    onClick?: () => void;
  }
  
  export enum Placement {
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right',
  }
  