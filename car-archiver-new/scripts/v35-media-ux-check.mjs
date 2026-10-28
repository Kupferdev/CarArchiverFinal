import fs from 'node:fs';
function read(path){return fs.readFileSync(path,'utf8');}
const form=read('src/components/dashboard/ServiceForm.tsx');
const profile=read('src/components/dashboard/ServiceProfile.tsx');
const gallery=read('src/components/dashboard/ServicePhotoGallery.tsx');
const media=read('src/main/data/serviceMedia.ts');
const dates=read('src/components/common/LocalizedDateTimeField.tsx');
const css=read('src/components/dashboard/ServicePhotoGallery.module.css');
const checks=[
 ['readonly gallery on profile', profile.includes('<ServicePhotoGallery serviceId={serviceId} />')],
 ['editing gallery with selection',form.includes('<ServicePhotoGallery serviceId={serviceId} editable />')],
 ['print action only printer icon', /className=\{styles\.printButton\}[^>]*><PrinterGlyph\/><\/button>/.test(profile)],
 ['gallery custom delete dialog',gallery.includes('role="alertdialog"') && !gallery.includes('window.confirm')],
 ['gallery select all and bulk delete', gallery.includes('photos.map(p=>p.mediaId)') && gallery.includes('removeSelected')],
 ['viewer arrow navigation and zoom',gallery.includes('ArrowLeft') && gallery.includes('ArrowRight') && gallery.includes('setZoom')],
 ['viewer close safe top inset',css.includes('top:42px') && css.includes('z-index:9500')],
 ['no arbitrary image BLOBs',!media.includes(' BLOB') && media.includes("path.join(mediaRoot()")],
 ['photo limits expanded',media.includes('MAX_IMAGES_PER_SERVICE = 500') && media.includes('filePaths.length > 100')],
 ['localized media errors',gallery.includes('normalizeError') && Object.keys({tr:1,en:1,es:1,fr:1,de:1,pt:1,zh:1,ja:1,ko:1,ru:1,nl:1,az:1,it:1,pl:1}).every(lang=>gallery.includes(` ${lang}:[`))],
 ['locale-controlled date fields',dates.includes('fromLocalized') && dates.includes('formatToParts') && form.includes('LocalizedDateTimeField')],
 ['reversible auto delivery date only',form.includes('automaticallySetDeliveryDate') && form.includes('deliveryDate: null')],
 ['service dates formatted with active locale',profile.includes('dateTime(service.deliveryDate, locale)')],
];
let failed=0;for(const [name,okay] of checks){console.log(`${okay?'PASS':'FAIL'} ${name}`);if(!okay)failed++;}if(failed)process.exit(1);
