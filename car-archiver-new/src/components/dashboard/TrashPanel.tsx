import './TrashPanel.css';
import {useCallback,useEffect,useState} from 'react';
import type {TrashItem} from '../../shared/ipcApi';

// Visible text translated at the component boundary; adding a locale does not
// require a database migration or storing translated strings in the Trash.
const words:Record<string,[string,string,string,string,string,string,string,string,string,string,string,string]>={
 tr:['Çöp Kutusu','Silinen kayıtlar, siz kalıcı olarak silene kadar burada saklanır.','Yenile','Geri Yükle','Kalıcı Sil','Kalıcı silme geri alınamaz. Devam edilsin mi?','Çöp kutusu boş.','Müşteri','Araç','Servis','Fotoğraf','Silinme tarihi'],
 en:['Trash','Deleted records are kept until you permanently remove them.','Refresh','Restore','Delete permanently','Permanently delete this record? This cannot be undone.','Trash is empty.','Customer','Vehicle','Service','Photo','Deleted at'],
 es:['Papelera','Los registros eliminados se conservan hasta que los borres definitivamente.','Actualizar','Restaurar','Eliminar definitivamente','¿Eliminar definitivamente? Esta acción no se puede deshacer.','La papelera está vacía.','Cliente','Vehículo','Servicio','Foto','Eliminado el'],
 fr:['Corbeille','Les éléments supprimés sont conservés jusqu’à leur suppression définitive.','Actualiser','Restaurer','Supprimer définitivement','Supprimer définitivement ? Cette action est irréversible.','La corbeille est vide.','Client','Véhicule','Service','Photo','Supprimé le'],
 de:['Papierkorb','Gelöschte Einträge bleiben bis zum endgültigen Löschen erhalten.','Aktualisieren','Wiederherstellen','Endgültig löschen','Endgültig löschen? Dies kann nicht rückgängig gemacht werden.','Der Papierkorb ist leer.','Kunde','Fahrzeug','Service','Foto','Gelöscht am'],
 pt:['Lixeira','Os registos eliminados são guardados até à eliminação definitiva.','Atualizar','Restaurar','Eliminar permanentemente','Eliminar permanentemente? Esta ação não pode ser anulada.','A lixeira está vazia.','Cliente','Veículo','Serviço','Foto','Eliminado em'],
 zh:['回收站','删除的记录会保留，直到您永久删除。','刷新','恢复','永久删除','确定永久删除？此操作无法撤销。','回收站为空。','客户','车辆','维修','照片','删除时间'],
 ja:['ゴミ箱','削除したデータは完全に削除するまで保存されます。','更新','復元','完全に削除','完全に削除しますか？元に戻せません。','ゴミ箱は空です。','顧客','車両','整備','写真','削除日時'],
 ko:['휴지통','삭제한 기록은 영구 삭제할 때까지 보관됩니다.','새로고침','복원','영구 삭제','영구 삭제하시겠습니까? 되돌릴 수 없습니다.','휴지통이 비어 있습니다.','고객','차량','서비스','사진','삭제일'],
 ru:['Корзина','Удалённые записи сохраняются до окончательного удаления.','Обновить','Восстановить','Удалить навсегда','Удалить без возможности восстановления?','Корзина пуста.','Клиент','Автомобиль','Сервис','Фото','Дата удаления'],
 nl:['Prullenbak','Verwijderde records blijven bewaard totdat u ze definitief verwijdert.','Vernieuwen','Herstellen','Definitief verwijderen','Definitief verwijderen? Dit kan niet ongedaan worden gemaakt.','De prullenbak is leeg.','Klant','Voertuig','Service','Foto','Verwijderd op'],
 az:['Zibil qutusu','Silinmiş qeydlər birdəfəlik silinənə qədər saxlanılır.','Yenilə','Bərpa et','Birdəfəlik sil','Birdəfəlik silinsin? Geri qaytarmaq mümkün deyil.','Zibil qutusu boşdur.','Müştəri','Avtomobil','Servis','Şəkil','Silinmə tarixi'],
 it:['Cestino','I record eliminati restano qui finché non vengono cancellati definitivamente.','Aggiorna','Ripristina','Elimina definitivamente','Eliminare definitivamente? Non è possibile annullare.','Il cestino è vuoto.','Cliente','Veicolo','Servizio','Foto','Eliminato il'],
 pl:['Kosz','Usunięte rekordy pozostają tutaj do trwałego usunięcia.','Odśwież','Przywróć','Usuń trwale','Usunąć trwale? Tej czynności nie można cofnąć.','Kosz jest pusty.','Klient','Pojazd','Serwis','Zdjęcie','Data usunięcia'],
};
const extras:Record<string,[string,string,string,string,string,string,string,string,string]>={
 tr:['Tümünü Seç','Seçimi Kaldır','Seçilenleri Geri Yükle','Seçilenleri Kalıcı Sil','Seçili kayıt','İşlemi Onayla','Vazgeç','Kalıcı olarak silinecek kayıt sayısı:','Geri yüklenecek kayıt sayısı:'],
 en:['Select All','Clear Selection','Restore Selected','Delete Selected Permanently','Selected','Confirm Action','Cancel','Records to permanently delete:','Records to restore:'],
 es:['Seleccionar todo','Limpiar selección','Restaurar seleccionados','Eliminar seleccionados','Seleccionados','Confirmar','Cancelar','Registros que se eliminarán:','Registros que se restaurarán:'],
 fr:['Tout sélectionner','Effacer la sélection','Restaurer la sélection','Supprimer définitivement','Sélectionnés','Confirmer','Annuler','Éléments à supprimer :','Éléments à restaurer :'],
 de:['Alle auswählen','Auswahl aufheben','Auswahl wiederherstellen','Auswahl endgültig löschen','Ausgewählt','Bestätigen','Abbrechen','Endgültig zu löschen:','Wiederherzustellen:'],
 pt:['Selecionar tudo','Limpar seleção','Restaurar seleção','Eliminar seleção','Selecionados','Confirmar','Cancelar','Registos a eliminar:','Registos a restaurar:'],
 zh:['全选','清除选择','恢复所选','永久删除所选','已选择','确认','取消','永久删除记录数：','恢复记录数：'],
 ja:['すべて選択','選択解除','選択した項目を復元','選択した項目を完全削除','選択済み','確認','キャンセル','完全削除する件数：','復元する件数：'],
 ko:['전체 선택','선택 해제','선택 복원','선택 영구 삭제','선택됨','확인','취소','영구 삭제할 기록:','복원할 기록:'],
 ru:['Выбрать все','Снять выделение','Восстановить выбранные','Удалить выбранные навсегда','Выбрано','Подтвердить','Отмена','Удалить навсегда:','Восстановить:'],
 nl:['Alles selecteren','Selectie wissen','Geselecteerde herstellen','Selectie definitief wissen','Geselecteerd','Bevestigen','Annuleren','Permanent verwijderen:','Herstellen:'],
 az:['Hamısını seç','Seçimi təmizlə','Seçilənləri bərpa et','Seçilənləri həmişəlik sil','Seçilib','Təsdiqlə','Ləğv et','Silinəcək qeyd:','Bərpa ediləcək qeyd:'],
 it:['Seleziona tutto','Deseleziona','Ripristina selezionati','Elimina selezionati definitivamente','Selezionati','Conferma','Annulla','Elementi da eliminare:','Elementi da ripristinare:'],
 pl:['Zaznacz wszystko','Wyczyść zaznaczenie','Przywróć zaznaczone','Usuń zaznaczone na stałe','Zaznaczone','Potwierdź','Anuluj','Rekordy do usunięcia:','Rekordy do przywrócenia:']
};
type Operation='restore-trash'|'purge-trash';
export default function TrashPanel({locale}:{locale:string}){
 const language=locale.split('-')[0];
 const text=words[language]||words.en;
 const more=extras[language]||extras.en;
 const [records,setRecords]=useState<TrashItem[]>([]);
 const [selected,setSelected]=useState<number[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [pending,setPending]=useState<{kind:Operation;ids:number[]}|null>(null);
 const refresh=useCallback(async()=>{
  try{
   const items=await window.electron.ipcRenderer.invoke('list-trash');
   setRecords(items);setSelected(current=>current.filter(id=>items.some(item=>item.trashId===id)));
   setError('');
  }catch(e){setError(e instanceof Error?e.message:String(e));}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function execute(){
  if(!pending||busy)return;
  const {ids,kind}=pending;
  setPending(null);setBusy(true);setNotice('');setError('');
  try{
   const channel=kind==='restore-trash'?'restore-trash-batch':'purge-trash-batch';
   const result=await window.electron.ipcRenderer.invoke(channel,ids);
   if(!result.success)throw new Error(result.message||'Operation failed');
   setNotice(`${ids.length} / ${ids.length} ✓`);
  }catch(e){setError(e instanceof Error?e.message:String(e));}
  finally{await refresh();setBusy(false);}
 }
 function toggle(id:number){setSelected(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);}
 const types:Record<TrashItem['entityType'],string>={customer:text[7],car:text[8],service:text[9],photo:text[10]};
 return <section className="trashPanel" aria-label={text[0]}>
  <header className="trashHeader"><div><h3>{text[0]}</h3><p>{text[1]}</p></div><button type="button" disabled={busy} onClick={()=>void refresh()}>{text[2]}</button></header>
  <div className="trashToolbar">
   <label><input type="checkbox" disabled={busy||!records.length} checked={records.length>0&&selected.length===records.length} onChange={e=>setSelected(e.target.checked?records.map(item=>item.trashId):[])}/>{more[0]}</label>
   <span>{more[4]}: {selected.length}</span>
   <button type="button" disabled={busy||!selected.length} onClick={()=>setSelected([])}>{more[1]}</button>
   <button type="button" disabled={busy||!selected.length} onClick={()=>setPending({kind:'restore-trash',ids:[...selected]})}>{more[2]}</button>
   <button type="button" className="trashDanger" disabled={busy||!selected.length} onClick={()=>setPending({kind:'purge-trash',ids:[...selected]})}>{more[3]}</button>
  </div>
  {error&&<p role="alert" className="trashError">{error}</p>}
  {notice&&<p role="status">{notice}</p>}
  {!records.length&&<p className="trashEmpty">{text[6]}</p>}
  <div className="trashRows">{records.map(item=><div className="trashRow" key={item.trashId}>
   <input aria-label={`${types[item.entityType]} ${item.label}`} type="checkbox" checked={selected.includes(item.trashId)} disabled={busy} onChange={()=>toggle(item.trashId)}/>
   <div className="trashIdentity"><strong>{types[item.entityType]} · {item.label}</strong><small>{text[11]}: {new Date(item.deletedAt+'Z').toLocaleString(locale)}</small></div>
   <button type="button" disabled={busy} onClick={()=>setPending({kind:'restore-trash',ids:[item.trashId]})}>{text[3]}</button>
   <button type="button" className="trashDanger" disabled={busy} onClick={()=>setPending({kind:'purge-trash',ids:[item.trashId]})}>{text[4]}</button>
  </div>)}</div>
  {pending&&<div className="trashModalShade" onMouseDown={e=>{if(e.target===e.currentTarget)setPending(null)}}>
   <div className="trashModal" role="dialog" aria-modal="true" aria-labelledby="trash-confirm-heading">
    <h3 id="trash-confirm-heading">{more[5]}</h3>
    <p>{pending.kind==='purge-trash'?text[5]:text[3]}</p>
    <p>{pending.kind==='purge-trash'?more[7]:more[8]} <strong>{pending.ids.length}</strong></p>
    <div className="trashModalActions"><button type="button" onClick={()=>setPending(null)}>{more[6]}</button><button type="button" className={pending.kind==='purge-trash'?'trashDanger':''} onClick={()=>void execute()}>{pending.kind==='purge-trash'?text[4]:text[3]}</button></div>
   </div>
  </div>}
 </section>;
}
