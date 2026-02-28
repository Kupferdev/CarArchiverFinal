export interface SetupInfo {

    id: number,
    languageCode: string,

    infoHeader: string,
    mainText: string,
    optionText: string,
    importButton: string,
    createNewButton: string,
    importText: string,
    createNewText: string,
    browseButton: string,
    youAreReady : string,
    lastInfoText : string,
    continueText : string,
    startButton: string
}

export const SetupInfoTexts: Array<SetupInfo> = [
  {
    id: 1,
    languageCode: "en",
    infoHeader: "About managing your data",
    mainText: `All records and photos you create in the app are stored in the folder you will select in the next step.

If you have previously created data, you can use your existing files with the “Import My Data” option.

Data is NOT backed up to the cloud.
Data loss may occur in case of computer failure or file deletion. For your security, we recommend backing up the folder regularly.`,
    optionText: `The "Create New" option allows you to choose where to save your data.

The "Import" option allows you to restore and continue with your old data.`,
    importButton: "Import",
    createNewButton: "Create New",
    importText: "Select the folder where your data is located: ",
    createNewText: "Select the location where you want to save your data: ",
    browseButton: "Browse",
    youAreReady: "You're ready🎉",
    lastInfoText: "Your data will be saved to this location.",
    continueText: "Continue",
    startButton: "Start"
  },
  {
    id: 2,
    languageCode: "es",
    infoHeader: "Sobre la gestión de sus datos",
    mainText: `Todos los registros y fotos que cree en la aplicación se guardarán en la carpeta que seleccione en el siguiente paso.

Si ya ha creado datos anteriormente, puede utilizar sus archivos existentes con la opción “Importar mis datos”.

Los datos NO se sincronizan con la nube.
Puede producirse una pérdida de datos en caso de fallo del ordenador o borrado de archivos. Por su seguridad, le recomendamos que haga copias de seguridad de la carpeta con regularidad.`,
    optionText: `Con la opción "Crear uno nuevo", puede elegir dónde guardar sus datos.

Con la opción "Importar", puede restaurar sus datos antiguos y continuar.`,
    importButton: "Importar",
    createNewButton: "Crear nuevo",
    importText: "Seleccione la carpeta donde se encuentran sus datos: ",
    createNewText: "Seleccione la ubicación donde desea guardar sus datos: ",
    browseButton: "Examinar",
    youAreReady: "¡Ya está listo!🎉",
    lastInfoText: "Tus datos se guardarán en esta ubicación.",
    continueText: "Continuar",
    startButton: "Comenzar"
  },
  {
    id: 3,
    languageCode: "fr",
    infoHeader: "À propos de la gestion de vos données",
    mainText: `Tous les enregistrements et photos que vous créez dans l'application sont stockés dans le dossier que vous choisirez à l'étape suivante.

Si vous avez déjà créé des données, vous pouvez utiliser vos fichiers existants avec l'option « Importer mes données ».

Les données ne sont PAS sauvegardées dans le cloud.
Une perte de données peut survenir en cas de panne de l'ordinateur ou de suppression de fichiers. Pour votre sécurité, nous vous recommandons de sauvegarder régulièrement le dossier.`,
    optionText: `L'option « Créer un nouveau » vous permet de choisir l'emplacement de sauvegarde de vos données.

L'option « Importer » vous permet de restaurer vos anciennes données et de continuer.`,
    importButton: "Importer",
    createNewButton: "Crear nuevo",
    importText: "Sélectionnez le dossier où se trouvent vos données : ",
    createNewText: "Sélectionnez l'emplacement où vous souhaitez enregistrer vos données : ",
    browseButton: "Parcourir",
    youAreReady: "Vous êtes prêt !🎉",
    lastInfoText: "Vos données seront enregistrées à cet emplacement.",
    continueText: "Continuer",
    startButton: "Démarrer"
  },
  {
    id: 4,
    languageCode: "de",
    infoHeader: "Über die Verwaltung Ihrer Daten",
    mainText: `Alle Aufzeichnungen und Fotos, die Sie in der App erstellen, werden in dem Ordner gespeichert, den Sie im nächsten Schritt auswählen.

Wenn Sie bereits Daten erstellt haben, können Sie Ihre vorhandenen Dateien mit der Option „Meine Daten importieren“ verwenden.

Die Daten werden NICHT in der Cloud gesichert.
Bei Computerfehlern oder dem Löschen von Dateien kann es zu Datenverlust kommen. Zu Ihrer Sicherheit empfehlen wir, den Ordner regelmäßig zu sichern.`,
    optionText: `Mit der Option „Neu erstellen“ können Sie wählen, wo Ihre Daten gespeichert werden sollen.

Mit der Option „Importieren“ können Sie Ihre alten Daten wiederherstellen und fortfahren.`,
    importButton: "Importieren",
    createNewButton: "Neu erstellen",
    importText: "Wählen Sie den Ordner aus, in dem sich Ihre Daten befinden: ",
    createNewText: "Wählen Sie den Ort aus, an dem Sie Ihre Daten speichern möchten: ",
    browseButton: "Durchsuchen",
    youAreReady: "Bereit!🎉",
    lastInfoText: "Ihre Daten werden an diesem Ort gespeichert.",
    continueText: "Weiter",
    startButton: "Starten"
  },
  {
    id: 5,
    languageCode: "pt",
    infoHeader: "Sobre o gerenciamento de seus dados",
    mainText: `Todos os registros e fotos que você criar no aplicativo são armazenados na pasta que você selecionará na próxima etapa.

Se você já criou dados anteriormente, pode usar seus arquivos existentes com a opção “Importar meus dados”.

Os dados NÃO são salvos na nuvem.
Pode ocorrer perda de dados em caso de falha no computador ou exclusão de arquivos. Para sua segurança, recomendamos fazer backup da pasta regularmente.`,
    optionText: `A opção "Criar novo" permite escolher onde salvar seus dados.

A opção "Importar" permite restaurar seus dados antigos e continuar.`,
    importButton: "Importar",
    createNewButton: "Criar novo",
    importText: "Selecione a pasta onde seus dados estão localizados: ",
    createNewText: "Selecione o local onde deseja salvar seus dados: ",
    browseButton: "Procurar",
    youAreReady: "Você está pronto!🎉",
    lastInfoText: "Seus datos serão salvos neste local.",
    continueText: "Continuar",
    startButton: "Iniciar"
  },
  {
    id: 6,
    languageCode: "zh",
    infoHeader: "关于您的数据管理",
    mainText: `您在应用中创建的所有记录和照片都将保存在您下一步选择的文件夹中。

如果您之前创建过数据，可以使用“导入我的数据”选项来使用现有文件。

数据不会备份到云端。
如果电脑发生故障或文件被删除，可能会导致数据丢失。为了您的数据安全，建议您定期备份该文件夹。`,
    optionText: `“新建”选项允许您选择数据的保存位置。

“导入”选项允许您恢复旧数据并继续使用。`,
    importButton: "导入",
    createNewButton: "新建",
    importText: "选择您的数据所在的文件夹：",
    createNewText: "选择您想要保存数据的路径：",
    browseButton: "浏览",
    youAreReady: "您已准备就绪🎉",
    lastInfoText: "您的数据将保存到此位置。",
    continueText: "继续",
    startButton: "开始"
  },
  {
    id: 7,
    languageCode: "tr",
    infoHeader: "Verilerinizin yönetilmesi hakkında",
    mainText: `Uygulamada oluşturduğunuz tüm kayıtlar ve fotoğraflar, sonraki adımda seçeceğiniz klasörde saklanır.

Eğer daha önce veri oluşturduysanız, “Verilerimi İçe Aktar” seçeneği ile mevcut dosyalarınızı kullanabilirsiniz.

Veriler buluta yedeklenmez.
Bilgisayar arızası veya dosya silinmesi durumunda veri kaybı yaşanabilir. Güvenliğiniz için klasörü düzenli olarak yedeklemenizi öneririz.`,
    optionText: `Yeni oluştur seçeneği ile verilerinizi nereye kaydedeceğinizi seçebilirsiniz.

İçe aktar seçeneği ile eski verilerinizi geri yükleyip devam edebilirsiniz.`,
    importButton: "İçe Aktar",
    createNewButton: "Yeni Oluştur",
    importText: "Verilerinizin bulunduğu klasörü seçin: ",
    createNewText: "Verilerinizi kaydetmek istediğiniz konumu seçin: ",
    browseButton: "Göz at",
    youAreReady : "Hazırsınız🎉",
    lastInfoText : "Verileriniz bu konuma kaydedilecek.",
    continueText : "Devam Et",
    startButton: "Başla"
  },
  {
    id: 8,
    languageCode: "ja",
    infoHeader: "データの管理について",
    mainText: `アプリで作成されたすべての記録と写真は、次のステップで選択するフォルダーに保存されます。

以前に作成したデータがある場合は、「データをインポート」オプションを使用して既存のファイルを使用できます。

データはクラウドにバックアップされません。
コンピュータの故障やファイルの削除により、データが消失する可能性があります。安全のため、定期的にフォルダーをバックアップすることをお勧めします。`,
    optionText: `「新規作成」オプションでは、データの保存先を選択できます。

「インポート」オプションでは、古いデータを復元して続行できます。`,
    importButton: "インポート",
    createNewButton: "新規作成",
    importText: "データがあるフォルダーを選択してください：",
    createNewText: "データを保存する場所を選択してください：",
    browseButton: "参照",
    youAreReady: "準備が整いました🎉",
    lastInfoText: "データはこの場所に保存されます。",
    continueText: "続行",
    startButton: "開始"
  },
  {
    id: 9,
    languageCode: "ko",
    infoHeader: "데이터 관리 안내",
    mainText: `앱에서 생성하는 모든 기록과 사진은 다음 단계에서 선택할 폴더에 저장됩니다.

이전에 생성한 데이터가 있는 경우, "데이터 가져오기" 옵션을 통해 기존 파일을 사용할 수 있습니다.

데이터는 클라우드에 백업되지 않습니다.
컴퓨터 고장이나 파일 삭제 시 데이터가 유실될 수 있습니다. 보안을 위해 폴더를 정기적으로 백업하는 것을 권장합니다.`,
    optionText: `“새로 만들기” 옵션을 통해 데이터를 저장할 위치를 선택할 수 있습니다.

“가져오기” 옵션을 통해 이전 데이터를 복원하여 계속할 수 있습니다.`,
    importButton: "가져오기",
    createNewButton: "새로 만들기",
    importText: "데이터가 위치한 폴더를 선택하세요: ",
    createNewText: "데이터를 저장할 위치를 선택하세요: ",
    browseButton: "찾아보기",
    youAreReady: "준비가 되었습니다🎉",
    lastInfoText: "데이터가 이 위치에 저장됩니다.",
    continueText: "계속",
    startButton: "시작"
  },
  {
    id: 10,
    languageCode: "ru",
    infoHeader: "Об управлении вашими данными",
    mainText: `Все записи и фотографии, созданные в приложении, сохраняются в папке, которую вы выберете на следующем шаге.

Если у вас уже есть созданные ранее данные, вы можете использовать их с помощью опции «Импорт данных».

Данные НЕ копируются в облако.
В случае сбоя компьютера или удаления файлов данные могут быть безвозвратно утеряны. Для вашей безопасности рекомендуем регулярно делать резервную копию папки.`,
    optionText: `Опция «Создать новое» позволяет выбрать место для сохранения данных.

Опция «Импорт» позволяет восстановить старые данные и продолжить работу.`,
    importButton: "Импорт",
    createNewButton: "Создать новое",
    importText: "Выберите папку, в которой находятся ваши данные: ",
    createNewText: "Выберите место для сохранения ваших данных: ",
    browseButton: "Обзор",
    youAreReady: "Все готово!🎉",
    lastInfoText: "Ваши данные будут сохранены в этом месте.",
    continueText: "Продолжить",
    startButton: "Начать"
  },
  {
    id: 11,
    languageCode: "nl",
    infoHeader: "Over het beheer van uw gegevens",
    mainText: `Alle records en foto's die u in de app maakt, worden opgeslagen in de map die u in de volgende stap selecteert.

Als u eerder gegevens hebt gemaakt, kunt u uw bestaande bestanden gebruiken met de optie "Mijn gegevens importeren".

Gegevens worden NIET opgeslagen in de cloud.
Gegevensverlies kan optreden bij computerstoringen of het verwijderen van bestanden. Voor uw veiligheid raden wij aan om regelmatig een reservekopie van de map te maken.`,
    optionText: `Met de optie "Nieuw maken" kunt u kiezen waar u uw gegevens wilt opslaan.

Met de optie "Importeren" kunt u uw oude gegevens herstellen en doorgaan.`,
    importButton: "Importeren",
    createNewButton: "Nieuw maken",
    importText: "Selecteer de map waarin uw gegevens zich bevinden: ",
    createNewText: "Selecteer de locatie waar u uw gegevens wilt opslaan: ",
    browseButton: "Bladeren",
    youAreReady: "Je bent klaar!🎉",
    lastInfoText: "Je gegevens worden op deze locatie opgeslagen.",
    continueText: "Doorgaan",
    startButton: "Starten"
  },
  {
    id: 12,
    languageCode: "az",
    infoHeader: "Məlumatlarınızın idarə edilməsi haqqında",
    mainText: `Tətbiqdə yaratdığınız bütün qeydlər və şəkillər növbəti addımda seçəcəyiniz qovluqda saxlanılır.

Əgər əvvəllər məlumat yaratmısınızsa, “Məlumatlarımı idxal et” seçimi ilə mövcud fayllarınızı istifadə edə bilərsiniz.

Məlumatlar buludda yedəklənmir.
Kompüter nasazlığı və ya faylların silinməsi halında məlumat itkisi baş verə bilər. Təhlükəsizliyiniz üçün qovluğu müntəzəm olaraq yedəkləməyinizi tövsiyə edirik.`,
    optionText: `“Yeni yarat” seçimi ilə məlumatlarınızı harada yadda saxlayacağınızı seçə bilərsiniz.

“İdxal et” seçimi ilə köhnə məlumatlarınızı bərpa edib davam edə bilərsiniz.`,
    importButton: "İdxal et",
    createNewButton: "Yeni yarat",
    importText: "Məlumatlarınızın olduğu qovluğu seçin: ",
    createNewText: "Məlumatlarınızı yadda saxlamaq istədiyiniz yeri seçin: ",
    browseButton: "Seç",
    youAreReady: "Hazırsınız🎉",
    lastInfoText: "Məlumatlarınız bu yerə yadda saxlanılacaq.",
    continueText: "Davam et",
    startButton: "Başla"
  },
  {
    id: 13,
    languageCode: "it",
    infoHeader: "Sulla gestione dei tuoi dati",
    mainText: `Tutti i record e le foto creati nell'app vengono archiviati nella cartella che selezionerai nel passaggio successivo.

Se hai già creato dei dati in precedenza, puoi utilizzare i file esistenti con l'opzione "Importa i miei dati".

I dati NON vengono salvati nel cloud.
In caso di guasto del computer o eliminazione dei file, potrebbe verificarsi una perdita di dati. Per la tua sicurezza, ti consigliamo di eseguire regolarmente il backup della cartella.`,
    optionText: `L'opzione "Crea uno nuovo" ti consente di scegliere dove salvare i tuoi dati.

L'opzione "Importa" ti consente di ripristinare i vecchi dati e continuare.`,
    importButton: "Importa",
    createNewButton: "Crear nuevo",
    importText: "Seleziona la cartella in cui si trovano i tuoi dati: ",
    createNewText: "Seleziona la posizione in cui desideri salvare i tuoi dati: ",
    browseButton: "Sfoglia",
    youAreReady: "Sei pronto!🎉",
    lastInfoText: "I tuoi dati verranno salvati in questa posizione.",
    continueText: "Continua",
    startButton: "Inizia"
  },
  {
    id: 14,
    languageCode: "pl",
    infoHeader: "O zarządzaniu Twoimi danymi",
    mainText: `Wszystkie rekordy i zdjęcia utworzone w aplikacji są przechowywane w folderze, który wybierzesz w następnym kroku.

Jeśli wcześniej utworzyłeś dane, możesz użyć istniejących plików, korzystając z opcji „Importuj moje dane”.

Dane NIE są kopiowane do chmury.
W przypadku awarii komputera lub usunięcia plików może dojść do utraty danych. Dla bezpieczeństwa zalecamy regularne tworzenie kopii zapasowej folderu.`,
    optionText: `Opcja „Utwórz nowe” pozwala wybrać miejsce zapisu danych.

Opcja „Importuj” pozwala przywrócić stare dane i kontynuować pracę.`,
    importButton: "Importuj",
    createNewButton: "Utwórz nowe",
    importText: "Wybierz folder, w którym znajdują się Twoje dane: ",
    createNewText: "Wybierz lokalizację, w której chcesz zapisać swoje dane: ",
    browseButton: "Przeglądaj",
    youAreReady: "Wszystko gotowe!🎉",
    lastInfoText: "Twoje dane zostaną zapisane w tej lokalizacji.",
    continueText: "Kontynuuj",
    startButton: "Uruchom"
  }
];