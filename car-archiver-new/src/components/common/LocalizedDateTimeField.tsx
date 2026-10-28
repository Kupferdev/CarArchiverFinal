import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const localeFor = (language:string) => ({ en:'en-US',tr:'tr-TR',es:'es-ES',fr:'fr-FR',de:'de-DE',pt:'pt-PT',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR',ru:'ru-RU',nl:'nl-NL',az:'az-AZ',it:'it-IT',pl:'pl-PL'} as Record<string,string>)[language.split('-')[0]] ?? language;
const isoLocal = (value:string) => {
 if (!value) return '';
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return '';
 const p=(v:number)=>String(v).padStart(2,'0');
 return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
};
function formatted(value:string,locale:string):string {
 if(!value)return '';
 const date=new Date(value);
 return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat(locale,{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,hourCycle:'h23'}).format(date).replace(/\u200e|\u200f/g,'');
}
function fromLocalized(value:string,locale:string):string|null {
 const values=value.match(/\d+/g);
 if(!values || values.length<5)return null;
 const order=new Intl.DateTimeFormat(locale,{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(2026,9,20)).filter(p=>['day','month','year'].includes(p.type)).map(p=>p.type);
 const dateParts:Record<string,number>={};order.forEach((type,i)=>{dateParts[type]=Number(values[i]);});
 const year=dateParts.year, month=dateParts.month, day=dateParts.day,hour=Number(values[3]),minute=Number(values[4]);
 const result=new Date(year,month-1,day,hour,minute);
 if(result.getFullYear()!==year||result.getMonth()!==month-1||result.getDate()!==day||result.getHours()!==hour||result.getMinutes()!==minute)return null;
 return isoLocal(result.toISOString()) === '' ? null : `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
}
/** A locale-formatted field independent of Windows' native input placeholder language.
 * The native datetime picker remains available for mouse/keyboard selection. */
export function LocalizedDateTimeField({label,value,onChange,fieldClassName,inputClassName}:{label:string;value:string;onChange:(value:string)=>void;fieldClassName?:string;inputClassName?:string}){
 const {i18n}=useTranslation();const id=useId();const locale=localeFor(i18n.language);const pickerRef=useRef<HTMLInputElement>(null);
 const shown=useMemo(()=>formatted(value,locale),[value,locale]);const [draft,setDraft]=useState(shown);const [invalid,setInvalid]=useState(false);
 useEffect(()=>{setDraft(shown);setInvalid(false);},[shown]);
 const sample=useMemo(()=>formatted('2026-10-20T16:30',locale),[locale]);
 const commit=()=>{if(!draft.trim()){onChange('');setInvalid(false);return;}const parsed=fromLocalized(draft,locale);if(parsed){setInvalid(false);onChange(parsed);}else{setDraft(shown);setInvalid(true);}};
 return <div className={fieldClassName}>
  <label htmlFor={id}>{label}</label>
  <div style={{position:'relative',display:'flex',alignItems:'center'}}>
   <input id={id} className={inputClassName} style={{width:'100%',paddingRight:40}} type="text" value={draft} placeholder="" title={sample} aria-invalid={invalid} onChange={e=>{setDraft(e.target.value);setInvalid(false);}} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.currentTarget.blur();}}}/>
   <button type="button" aria-label={label} title={label} onClick={()=>{const picker=pickerRef.current;if(!picker)return;try{picker.showPicker();}catch{picker.focus();}}} style={{position:'absolute',right:3,border:0,background:'transparent',color:'var(--text-main)',padding:'6px 8px',cursor:'pointer',zIndex:1}}>▦</button>
   <input ref={pickerRef} type="datetime-local" lang={locale} tabIndex={-1} aria-label={label} value={value} onChange={e=>{onChange(e.target.value);setInvalid(false);}} style={{position:'absolute',right:3,top:'50%',width:1,height:1,opacity:0,pointerEvents:'none'}}/>
  </div>
 </div>;
}
