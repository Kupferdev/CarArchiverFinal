import {useEffect,useState} from 'react';
export type ClockStyle = 'classic'|'digital'|'compact'|'elegant'|'clock';
export function useClockStyle(): ClockStyle {
 const [style,setStyle] = useState<ClockStyle>(() => (localStorage.getItem('cararchiver-clock-style') || 'classic') as ClockStyle);
 useEffect(()=>{const listener=()=>setStyle((localStorage.getItem('cararchiver-clock-style') || 'classic') as ClockStyle);window.addEventListener('cararchiver-clock-change',listener);return()=>window.removeEventListener('cararchiver-clock-change',listener);},[]);
 return style;
}
export function setClockStyle(style:ClockStyle){localStorage.setItem('cararchiver-clock-style',style);window.dispatchEvent(new Event('cararchiver-clock-change'));}
