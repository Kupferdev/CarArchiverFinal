import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = file => fs.readFileSync(file,'utf8');
const files = {
  tabs:read('src/components/dashboard/Tabbar.tsx'),
  store:read('src/store/tabStore.ts'),
  titles:read('src/utils/tabTitle.ts'),
  carForm:read('src/components/dashboard/CarForm.tsx'),
  customerForm:read('src/components/dashboard/CustomerForm.tsx'),
  serviceList:read('src/components/dashboard/ServiceList.tsx'),
  printer:read('src/components/dashboard/ServiceProfile.tsx'),
  printHtml:read('src/utils/printService.ts'),
  ipc:read('electron/ipcHandlers.ts'),
  topbar:read('src/components/dashboard/Topbar.tsx'),
  fab:read('src/components/dashboard/FabMenu.module.css'),
};
const tests = [
  ['live tab titles', files.tabs.includes('localizedTabTitle(tab)') && files.titles.includes("t('settingsTitle')")],
  ['pin restore and close protection', files.store.includes('restorePinned()') && files.store.includes('|| t.pinned') && files.tabs.includes('togglePin(currentTab.id)')],
  ['fuel/body translation database',files.ipc.includes('FuelTypeTranslations') && files.ipc.includes('BodyTypeTranslations') && files.carForm.includes('i18n.language')],
  ['no model sample placeholder',files.carForm.includes('placeholder=""') && !files.carForm.includes('placeholder={t("carModelPlaceholder")}')],
  ['country dial code not preselected',files.customerForm.includes("countryCode: ''") && !files.customerForm.includes("countryCode: '+90'")],
  ['delivery label localized',files.serviceList.includes('{t("serviceDelivered")}')],
  ['print preview',files.printer.includes('srcDoc={printableHtml}') && files.printer.includes('includeAdvisorNotes')],
  ['native save PDF',files.ipc.includes('printToPDF') && files.ipc.includes('showSaveDialog')],
  ['clickable brand home',files.topbar.includes("setActiveTab('home')")],
  ['fixed quick action',files.fab.includes('position: fixed')],
];
for(const [name,ok] of tests){console.log(`${ok?'PASS':'FAIL'} ${name}`);assert.ok(ok,`Missing ${name}`)}
console.log(`v34 static regression checks: ${tests.length} passed`);
