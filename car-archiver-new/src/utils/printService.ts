import i18n from '../i18n';
import type { Service } from '../shared/types/service';
import type { Part } from '../shared/types/part';
import type { Car } from '../shared/types/car';
import type { CustomerViewDto } from '../shared/dtos/customerDtos';

const esc = (v: unknown) => String(v ?? '—').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch] ?? ch));
const number = (v?: number | null) => v == null ? '—' : new Intl.NumberFormat(i18n.language,{minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
const date = (v?: Date | string | null) => v ? new Intl.DateTimeFormat(i18n.language,{dateStyle:'short',timeStyle:'short'}).format(new Date(v)) : '—';

export function buildServicePrintHtml(service: Service, car: Car | null, customer: CustomerViewDto | null, parts: Part[], brand: string, includeAdvisorNotes = false) {
  const t = (key: string) => i18n.t(key);
  const row = (label: string, value: unknown) => `<div class="field"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
  const section = (label: string, value?: string | null) => value?.trim() ? `<section><h2>${esc(label)}</h2><p>${esc(value)}</p></section>` : '';
  const html = `<!doctype html><html lang="${esc(i18n.language)}"><head><meta charset="utf-8"><title>${esc(t('printTitle'))}</title>
  <style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font:11px/1.5 Arial,Helvetica,sans-serif;color:#172033;background:white;margin:0}
  h1{font-size:22px;margin:0 0 4px}h2{font-size:12px;border-bottom:1px solid #cad2de;padding-bottom:5px;margin:14px 0 7px}.muted{color:#667085}header{border-bottom:2px solid #243b70;padding-bottom:14px;margin-bottom:15px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px}.field{display:flex;gap:10px;justify-content:space-between;border-bottom:1px solid #eef0f3;padding:4px 0}.field span{color:#667085}.field b{font-weight:600;overflow-wrap:anywhere;text-align:right}
  section{break-inside:avoid-page}p{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.55;margin:0 0 10px}
  table{width:100%;border-collapse:collapse;margin-top:9px}thead{display:table-header-group}th,td{border-bottom:1px solid #d5dbe6;padding:7px;text-align:left}th{background:#f0f3f8}td.num,th.num{text-align:right}.totals{max-width:50%;margin-left:auto;padding-top:12px}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:50px;page-break-inside:avoid}.signatures div{border-top:1px solid #bbc4d3;text-align:center;padding:6px}
  </style></head><body><header><h1>${esc(t('printTitle'))}</h1><div class="muted">Car Service Archiver · ${esc(date(service.applicationDate))}</div></header>
  <div class="grid"><div><h2>${esc(t('printVehicleInfo'))}</h2>${row(t('carPlate'),car?.plateNumber)}${row(t('printBrandModel'),`${brand} ${car?.model??''}`)}${row(t('carYear'),car?.year)}${row(t('printVin'),car?.vinNumber)}${row(t('carKm'),service.km ?? car?.km)}</div>
  <div><h2>${esc(t('printCustomerInfo'))}</h2>${row(t('customerFullName'),customer?.fullName)}${row(t('customerPhone'),customer?.phones?.map(p=>`${p.countryCode} ${p.number}`).join(', '))}${row(t('customerEmail'),customer?.emails?.map(e=>e.address).join(', '))}</div></div>
  <h2>${esc(t('serviceBasicSection'))}</h2><div class="grid">${row(t('serviceApplicationDate'),date(service.applicationDate))}${row(t('serviceAppointmentDate'),date(service.appointmentDate))}${row(t('serviceTargetDelivery'),date(service.targetDeliveryDate))}${row(t('serviceDeliveryDate'),date(service.deliveryDate))}${row(t('serviceJobDuration'), service.jobDuration == null ? '—':`${service.jobDuration} ${t('printMinutes')}`)}${row(t('printDeliveryStatus'), service.isDelivered ? t('printDelivered'):t('printUndelivered'))}</div>
  ${section(t('printComplaint'),service.complaints)}${section(t('serviceExtraRequests'),service.extraRequests)}${section(t('printFaults'),service.faults?.join('\n'))}${section(t('printReceiveDamage'),service.damageOnReceive?.join('\n'))}${section(t('printRepairDamage'),service.damageDuringRepair?.join('\n'))}${includeAdvisorNotes ? section(t('advisorNotes'),service.advisorNotes) : ''}
  <h2>${esc(t('servicePartsSection'))}</h2><table><thead><tr><th>${esc(t('servicePartName'))}</th><th class="num">${esc(t('servicePartQuantity'))}</th><th class="num">${esc(t('servicePartPrice'))}</th><th class="num">${esc(t('servicePartTotal'))}</th></tr></thead><tbody>
  ${parts.map(p=>`<tr><td>${esc(p.partName)}</td><td class="num">${p.quantity}</td><td class="num">${number(p.unitPriceKurus/100)}</td><td class="num">${number(p.unitPriceKurus*p.quantity/100)}</td></tr>`).join('')}
  </tbody></table><div class="totals">${row(t('servicePartsSum'),number(parts.reduce((sum,p)=>sum+p.unitPriceKurus*p.quantity,0)/100))}${row(t('serviceLaborCharge'),number(service.laborCharge))}${row(t('serviceTotalCharge'),number(service.totalCharge))}</div>
  <div class="signatures"><div>${esc(t('printServiceRep'))}</div><div>${esc(t('printCustomerSignature'))}</div></div></body></html>`;
  return html;
}
