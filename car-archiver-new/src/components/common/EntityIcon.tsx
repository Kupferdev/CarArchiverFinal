import React from 'react';
export type EntityKind = 'service' | 'car' | 'customer';
export const EntityIcon: React.FC<{ kind:EntityKind; size?:number; className?:string }> = ({kind,size=18,className}) => <svg width={size} height={size} style={{ width:`calc(${size}px * var(--user-icon-factor, 1))`, height:`calc(${size}px * var(--user-icon-factor, 1))` }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
  {kind==='service' ? <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3.5V2h6v1.5M9 10h6M9 14h6M9 18h3"/></> : kind==='car' ? <><path d="M4 16 5.5 9a3 3 0 0 1 2.9-2.3h7.2A3 3 0 0 1 18.5 9L20 16v3H4v-3Z"/><path d="M4.5 13h15M8 19v2M16 19v2"/><circle cx="7.4" cy="16" r=".7"/><circle cx="16.6" cy="16" r=".7"/></> : <><circle cx="12" cy="7.5" r="3.5"/><path d="M4 20v-2a8 8 0 0 1 16 0v2H4Z"/></>}
</svg>;
