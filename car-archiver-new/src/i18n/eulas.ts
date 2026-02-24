export interface Eula {
    id: number,
    languageCode: string,
    title: string, 
    acceptText: string,
    declineText: string,
    eula: string;
}

/* css

.eula-container {
    line-height: 1.6;
    color: #333;
    font-size: 14px;
    max-width: 800px;   
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.eula-container p {
    margin-bottom: 10px;
}

.eula-container h1 {
    font-size: 18px;
    margin-bottom: 12px;
}

.eula-container h3 {
    font-size: 16px;
    margin-top: 18px;
    margin-bottom: 6px;
}

.eula-container ul {
    padding-left: 20px;
    margin-top: 6px;
}

.eula-container {
    margin: 0 auto;
}

.eula-container ul li {
    margin-bottom: 4px; 
}

*/

export const eulas: Array<Eula> = [
    {
        id: 1,
        languageCode: "tr",
        title: "Lisans Sözleşmesi",
        acceptText: "Kabul Ediyorum",
        declineText: "Kabul Etmiyorum",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Son Kullanıcı Lisans Sözleşmesi (EULA)</h1>
    <p>Bu sözleşme, <strong>CarServiceArchiver</strong> (bundan sonra "Uygulama" olarak anılacaktır) ile bu Uygulamayı satın alan/kullanan kişi (bundan sonra "Kullanıcı" olarak anılacaktır) arasında akdedilmiştir. Uygulamayı yükleyerek veya kullanarak bu şartları kabul etmiş sayılırsınız.</p>

    <h3>1. Lisans Hakkı</h3>
    <p>Geliştirici, Kullanıcıya Uygulamayı kişisel veya ticari amaçlarla (servis kayıtlarını tutmak üzere) kullanması için sınırlı, devredilemez ve münhasır olmayan bir kullanım lisansı verir. Bu lisans, Uygulamanın mülkiyetini değil, sadece kullanım hakkını kapsar.</p>

    <h3>2. Kullanım Kısıtlamaları</h3>
    <p>Kullanıcı aşağıdaki eylemleri gerçekleştirmeyeceğini kabul eder:</p>
    <ul>
        <li>Uygulamayı kopyalamak, çoğaltmak veya yeniden dağıtmak.</li>
        <li>Uygulama üzerinde tersine mühendislik (reverse engineering) yapmak, kaynak koduna erişmeye çalışmak veya üzerinde değişiklik yapmak.</li>
        <li>Uygulamayı üçüncü şahıslara kiralamak veya satmak.</li>
    </ul>

    <h3>3. Veri Depolama ve Gizlilik</h3>
    <p><strong>Yerel Depolama:</strong> Uygulama, girilen tüm verileri (müşteri bilgileri, servis detayları, fotoğraflar vb.) yalnızca Kullanıcının cihazında yerel (local) olarak saklar.</p>
    <p><strong>Sunucu Erişimi:</strong> Geliştiricinin Uygulama üzerinde herhangi bir sunucu bağlantısı bulunmamaktadır. Bu nedenle Geliştirici, Kullanıcı tarafından girilen hiçbir veriye erişemez, bunları göremez veya yedekleyemez.</p>
    <p><strong>Veri Güvenliği:</strong> Verilerin güvenliği, yedeklenmesi ve korunması tamamen Kullanıcının sorumluluğundadır.</p>

    <h3>4. Sorumluluk Reddi (Sorumluluğun Sınırlandırılması)</h3>
    <p><strong>Veri Kaybı:</strong> Cihaz arızası, işletim sistemi hataları, uygulamanın silinmesi veya donanım hasarı gibi durumlarda meydana gelebilecek veri kayıplarından Geliştirici sorumlu tutulamaz. Kullanıcının düzenli olarak kendi yedekleme önlemlerini alması önerilir.</p>
    <p><strong>Hatalar:</strong> Uygulama "olduğu gibi" sunulmaktadır. Geliştirici, uygulamanın her zaman hatasız çalışacağını veya kesintisiz hizmet vereceğini garanti etmez.</p>

    <h3>5. Ödeme ve İade Politikası</h3>
    <p>Kullanıcı, Uygulamayı dijital market üzerinden tek seferlik satın alma ile edinir. Uygulama içi satın alma veya abonelik bulunmamaktadır. Dijital içeriklerin doğası gereği ve yerel mevzuatlar çerçevesinde, aksi uygulama marketi tarafından belirtilmedikçe iade yapılmamaktadır.</p>

    <h3>6. Fesih</h3>
    <p>Kullanıcının bu sözleşme maddelerini ihlal etmesi durumunda, Geliştirici lisans hakkını tek taraflı olarak feshedebilir.</p>

    <h3>7. Hukuki Yetki ve Uyuşmazlıklar</h3>
    <p>Bu sözleşmeden doğabilecek uyuşmazlıklarda, yürürlükteki yerel kanunlar geçerlidir.</p>
</div>`
    },
    {
        id: 2,
        languageCode: "en",
        title: "License Agreement",
        acceptText: "I Accept",
        declineText: "I Decline",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – End User License Agreement (EULA)</h1>
    <p>This agreement is entered into between <strong>CarServiceArchiver</strong> (hereinafter referred to as "Application") and the person purchasing/using this Application (hereinafter referred to as "User"). By installing or using the Application, you are deemed to have accepted these terms.</p>

    <h3>1. License Grant</h3>
    <p>The Developer grants the User a limited, non-transferable, and non-exclusive license to use the Application for personal or commercial purposes (to keep service records). This license covers the right to use only, not the ownership of the Application.</p>

    <h3>2. Usage Restrictions</h3>
    <p>The User agrees not to perform the following actions:</p>
    <ul>
        <li>Copying, reproducing, or redistributing the Application.</li>
        <li>Performing reverse engineering on the Application, attempting to access the source code, or modifying it.</li>
        <li>Renting or selling the Application to third parties.</li>
    </ul>

    <h3>3. Data Storage and Privacy</h3>
    <p><strong>Local Storage:</strong> The Application stores all entered data (customer information, service details, photos, etc.) locally only on the User's device.</p>
    <p><strong>Server Access:</strong> The Application does not connect to any server operated by the Developer. Therefore, the Developer cannot access, view, or back up any data entered by the User.</p>
    <p><strong>Data Security:</strong> The security, backup, and protection of data are entirely the responsibility of the User.</p>

    <h3>4. Disclaimer (Limitation of Liability)</h3>
    <p><strong>Data Loss:</strong> The Developer cannot be held responsible for data losses that may occur in situations such as device failure, operating system errors, deletion of the application, or hardware damage. It is recommended that the User takes their own backup measures regularly.</p>
    <p><strong>Errors:</strong> The Application is provided "as is". The Developer does not guarantee that the application will always work without errors or provide uninterrupted service.</p>

    <h3>5. Payment and Refund Policy</h3>
    <p>The User acquires the Application through a one-time purchase via the digital market. There are no in-app purchases or subscriptions. Due to the nature of digital content and within the framework of local regulations, refunds are not made unless stated otherwise by the application market.</p>

    <h3>6. Termination</h3>
    <p>In case the User violates the terms of this agreement, the Developer may unilaterally terminate the license right.</p>

    <h3>7. Legal Jurisdiction and Disputes</h3>
    <p>In disputes arising from this agreement, applicable local laws shall apply.</p>
</div>`
    },
    {
        id: 3,
        languageCode: "es",
        title: "Acuerdo de Licencia",
        acceptText: "Acepto",
        declineText: "No Acepto",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Acuerdo de Licencia de Usuario Final (EULA)</h1>
    <p>Este acuerdo se celebra entre <strong>CarServiceArchiver</strong> (en adelante "La Aplicación") y la persona que compra/usa esta Aplicación (en adelante "El Usuario"). Al instalar o usar la Aplicación, se considera que ha aceptado estos términos.</p>

    <h3>1. Concesión de Licencia</h3>
    <p>El Desarrollador otorga al Usuario una licencia limitada, intransferible y no exclusiva para usar la Aplicación con fines personales o comerciales (para mantener registros de servicio). Esta licencia cubre solo el derecho de uso, no la propiedad de la Aplicación.</p>

    <h3>2. Restricciones de Uso</h3>
    <p>El Usuario acepta no realizar las siguientes acciones:</p>
    <ul>
        <li>Copiar, reproducir o redistribuir la Aplicación.</li>
        <li>Realizar ingeniería inversa (reverse engineering) en la Aplicación, intentar acceder al código fuente o modificarlo.</li>
        <li>Alquilar o vender la Aplicación a terceros.</li>
    </ul>

    <h3>3. Almacenamiento de Datos y Privacidad</h3>
    <p><strong>Almacenamiento Local:</strong> La Aplicación almacena todos los datos introducidos (información del cliente, detalles del servicio, fotos, etc.) únicamente de forma local en el dispositivo del Usuario.</p>
    <p><strong>Acceso al Servidor:</strong> El Desarrollador no tiene conexión con ningún servidor en la Aplicación. Por lo tanto, el Desarrollador no puede acceder, ver ni hacer copias de seguridad de ningún dato introducido por el Usuario.</p>
    <p><strong>Seguridad de Datos:</strong> La seguridad, copia de seguridad y protección de los datos son totalmente responsabilidad del Usuario.</p>

    <h3>4. Descargo de Responsabilidad (Limitación de Responsabilidad)</h3>
    <p><strong>Pérdida de Datos:</strong> El Desarrollador no se hace responsable de las pérdidas de datos que puedan ocurrir en situaciones como fallos del dispositivo, errores del sistema operativo, eliminación de la aplicación o daños en el hardware. Se recomienda que el Usuario realice sus propias copias de seguridad regularmente.</p>
    <p><strong>Errores:</strong> La Aplicación se proporciona "tal cual". El Desarrollador no garantiza que la aplicación funcione siempre sin errores o proporcione un servicio ininterrumpido.</p>

    <h3>5. Política de Pago y Reembolso</h3>
    <p>El Usuario adquiere la Aplicación mediante una compra única a través del mercado digital. No hay compras dentro de la aplicación ni suscripciones. Debido a la naturaleza del contenido digital y dentro del marco de las regulaciones locales, no se realizan reembolsos a menos que el mercado de aplicaciones indique lo contrario.</p>

    <h3>6. Terminación</h3>
    <p>En caso de que el Usuario viole los términos de este acuerdo, el Desarrollador puede rescindir unilateralmente el derecho de licencia.</p>

    <h3>7. Jurisdicción Legal y Disputas</h3>
    <p>En las disputas que surjan de este acuerdo, se aplicarán las leyes locales vigentes.</p>
</div>`
    },
    {
        id: 4,
        languageCode: "fr",
        title: "Contrat de Licence",
        acceptText: "J'accepte",
        declineText: "Je refuse",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Contrat de Licence Utilisateur Final (EULA)</h1>
    <p>Ce contrat est conclu entre <strong>CarServiceArchiver</strong> (ci-après dénommé "l'Application") et la personne achetant/utilisant cette Application (ci-après dénommée "l'Utilisateur"). En installant ou en utilisant l'Application, vous êtes réputé avoir accepté ces conditions.</p>

    <h3>1. Octroi de Licence</h3>
    <p>Le Développeur accorde à l'Utilisateur une licence limitée, non transférable et non exclusive pour utiliser l'Application à des fins personnelles ou commerciales (pour conserver les registres de service). Cette licence couvre uniquement le droit d'utilisation, et non la propriété de l'Application.</p>

    <h3>2. Restrictions d'Utilisation</h3>
    <p>L'Utilisateur accepte de ne pas effectuer les actions suivantes :</p>
    <ul>
        <li>Copier, reproduire ou redistribuer l'Application.</li>
        <li>Effectuer de l'ingénierie inverse sur l'Application, tenter d'accéder au code source ou le modifier.</li>
        <li>Louer ou vendre l'Application à des tiers.</li>
    </ul>

    <h3>3. Stockage des Données et Confidentialité</h3>
    <p><strong>Stockage Local :</strong> L'Application stocke toutes les données saisies (informations client, détails du service, photos, etc.) uniquement localement sur l'appareil de l'Utilisateur.</p>
    <p><strong>Accès Serveur :</strong> Le Développeur n'a aucune connexion serveur sur l'Application. Par conséquent, le Développeur ne peut pas accéder, voir ou sauvegarder les données saisies par l'Utilisateur.</p>
    <p><strong>Sécurité des Données :</strong> La sécurité, la sauvegarde et la protection des données sont entièrement de la responsabilité de l'Utilisateur.</p>

    <h3>4. Avis de Non-Responsabilité (Limitation de Responsabilité)</h3>
    <p><strong>Perte de Données :</strong> Le Développeur ne peut être tenu responsable des pertes de données pouvant survenir dans des situations telles qu'une panne de l'appareil, des erreurs du système d'exploitation, la suppression de l'application ou des dommages matériels. Il est recommandé à l'Utilisateur de prendre régulièrement ses propres mesures de sauvegarde.</p>
    <p><strong>Erreurs :</strong> L'Application est fournie "telle quelle". Le Développeur ne garantit pas que l'application fonctionnera toujours sans erreur ou fournira un service ininterrompu.</p>

    <h3>5. Politique de Paiement et de Remboursement</h3>
    <p>L'Utilisateur acquiert l'Application par un achat unique via le marché numérique. Il n'y a pas d'achats in-app ou d'abonnements. En raison de la nature du contenu numérique et dans le cadre des réglementations locales, aucun remboursement n'est effectué sauf indication contraire du marché d'applications.</p>

    <h3>6. Résiliation</h3>
    <p>En cas de violation par l'Utilisateur des termes de ce contrat, le Développeur peut résilier unilatéralement le droit de licence.</p>

    <h3>7. Juridiction Légale et Litiges</h3>
    <p>Pour tout litige découlant de ce contrat, les lois locales en vigueur s'appliquent.</p>
</div>`
    },
    {
        id: 5,
        languageCode: "de",
        title: "Lizenzvereinbarung",
        acceptText: "Ich akzeptiere",
        declineText: "Ich lehne ab",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Endbenutzer-Lizenzvereinbarung (EULA)</h1>
    <p>Diese Vereinbarung wird zwischen <strong>CarServiceArchiver</strong> (nachfolgend "Anwendung" genannt) und der Person, die diese Anwendung kauft/nutzt (nachfolgend "Benutzer" genannt), geschlossen. Durch die Installation oder Nutzung der Anwendung gelten diese Bedingungen als akzeptiert.</p>

    <h3>1. Lizenzerteilung</h3>
    <p>Der Entwickler gewährt dem Benutzer eine beschränkte, nicht übertragbare und nicht exklusive Lizenz zur Nutzung der Anwendung für persönliche oder kommerzielle Zwecke (zur Führung von Serviceaufzeichnungen). Diese Lizenz umfasst nur das Nutzungsrecht, nicht das Eigentum an der Anwendung.</p>

    <h3>2. Nutzungsbeschränkungen</h3>
    <p>Der Benutzer verpflichtet sich, folgende Handlungen zu unterlassen:</p>
    <ul>
        <li>Kopieren, Vervielfältigen oder Weiterverteilen der Anwendung.</li>
        <li>Reverse Engineering (Rückentwicklung) an der Anwendung durchführen, versuchen auf den Quellcode zuzugreifen oder diesen zu ändern.</li>
        <li>Vermieten oder Verkaufen der Anwendung an Dritte.</li>
    </ul>

    <h3>3. Datenspeicherung und Datenschutz</h3>
    <p><strong>Lokale Speicherung:</strong> Die Anwendung speichert alle eingegebenen Daten (Kundeninformationen, Servicedetails, Fotos usw.) ausschließlich lokal auf dem Gerät des Benutzers.</p>
    <p><strong>Serverzugriff:</strong> Der Entwickler hat keine Serververbindung zur Anwendung. Daher kann der Entwickler nicht auf vom Benutzer eingegebene Daten zugreifen, diese einsehen oder sichern.</p>
    <p><strong>Datensicherheit:</strong> Die Sicherheit, Sicherung und der Schutz der Daten liegen vollständig in der Verantwortung des Benutzers.</p>

    <h3>4. Haftungsausschluss (Haftungsbeschränkung)</h3>
    <p><strong>Datenverlust:</strong> Der Entwickler kann nicht für Datenverluste haftbar gemacht werden, die durch Geräteausfälle, Betriebssystemfehler, Löschung der Anwendung oder Hardwareschäden entstehen können. Es wird empfohlen, dass der Benutzer regelmäßig eigene Sicherungsmaßnahmen ergreift.</p>
    <p><strong>Fehler:</strong> Die Anwendung wird "wie besehen" bereitgestellt. Der Entwickler garantiert nicht, dass die Anwendung immer fehlerfrei funktioniert oder einen unterbrechungsfreien Dienst bietet.</p>

    <h3>5. Zahlungs- und Rückerstattungsrichtlinie</h3>
    <p>Der Benutzer erwirbt die Anwendung durch einen einmaligen Kauf über den digitalen Markt. Es gibt keine In-App-Käufe oder Abonnements. Aufgrund der Natur digitaler Inhalte und im Rahmen lokaler Vorschriften werden keine Rückerstattungen gewährt, es sei denn, der Anwendungsmarkt gibt etwas anderes an.</p>

    <h3>6. Kündigung</h3>
    <p>Falls der Benutzer gegen die Bedingungen dieser Vereinbarung verstößt, kann der Entwickler das Lizenzrecht einseitig kündigen.</p>

    <h3>7. Gerichtsstand und Streitigkeiten</h3>
    <p>Bei Streitigkeiten aus dieser Vereinbarung gelten die geltenden lokalen Gesetze.</p>
</div>`
    },
    {
        id: 6,
        languageCode: "pt",
        title: "Contrato de Licença",
        acceptText: "Aceito",
        declineText: "Não Aceito",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Contrato de Licença de Usuário Final (EULA)</h1>
    <p>Este contrato é celebrado entre <strong>CarServiceArchiver</strong> (doravante denominado "Aplicativo") e a pessoa que compra/usa este Aplicativo (doravante denominado "Usuário"). Ao instalar ou usar o Aplicativo, considera-se que você aceitou estes termos.</p>

    <h3>1. Concessão de Licença</h3>
    <p>O Desenvolvedor concede ao Usuário uma licença limitada, intransferível e não exclusiva para usar o Aplicativo para fins pessoais ou comerciais (para manter registros de serviço). Esta licença cobre apenas o direito de uso, não a propriedade do Aplicativo.</p>

    <h3>2. Restrições de Uso</h3>
    <p>O Usuário concorda em não realizar as seguintes ações:</p>
    <ul>
        <li>Copiar, reproduzir ou redistribuir o Aplicativo.</li>
        <li>Realizar engenharia reversa no Aplicativo, tentar acessar o código-fonte ou modificá-lo.</li>
        <li>Alugar ou vender o Aplicativo a terceiros.</li>
    </ul>

    <h3>3. Armazenamento de Dados e Privacidade</h3>
    <p><strong>Armazenamento Local:</strong> O Aplicativo armazena todos os dados inseridos (informações do cliente, detalhes do serviço, fotos, etc.) apenas localmente no dispositivo do Usuário.</p>
    <p><strong>Acesso ao Servidor:</strong> O Desenvolvedor não possui conexão com servidor no Aplicativo. Portanto, o Desenvolvedor não pode acessar, visualizar ou fazer backup de quaisquer dados inseridos pelo Usuário.</p>
    <p><strong>Segurança de Dados:</strong> A segurança, o backup e a proteção dos dados são de inteira responsabilidade do Usuário.</p>

    <h3>4. Isenção de Responsabilidade (Limitação de Responsabilidade)</h3>
    <p><strong>Perda de Dados:</strong> O Desenvolvedor não pode ser responsabilizado por perdas de dados que possam ocorrer em situações como falha do dispositivo, erros do sistema operacional, exclusão do aplicativo ou danos ao hardware. Recomenda-se que o Usuário tome suas próprias medidas de backup regularmente.</p>
    <p><strong>Erros:</strong> O Aplicativo é fornecido "como está". O Desenvolvedor não garante que o aplicativo funcionará sempre sem erros ou fornecerá serviço ininterrupto.</p>

    <h3>5. Política de Pagamento e Reembolso</h3>
    <p>O Usuário adquire o Aplicativo através de uma compra única via mercado digital. Não há compras no aplicativo ou assinaturas. Devido à natureza do conteúdo digital e dentro da estrutura das regulamentações locais, não são feitos reembolsos, a menos que declarado de outra forma pelo mercado de aplicativos.</p>

    <h3>6. Rescisão</h3>
    <p>Caso o Usuário viole os termos deste contrato, o Desenvolvedor pode rescindir unilateralmente o direito de licença.</p>

    <h3>7. Jurisdição Legal e Disputas</h3>
    <p>Em disputas decorrentes deste contrato, aplicam-se as leis locais vigentes.</p>
</div>`
    },
    {
        id: 7,
        languageCode: "zh",
        title: "许可协议",
        acceptText: "我接受",
        declineText: "我拒绝",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – 最终用户许可协议 (EULA)</h1>
    <p>本协议由 <strong>CarServiceArchiver</strong>（以下简称“应用程序”）与购买/使用本应用程序的人员（以下简称“用户”）之间签订。安装或使用本应用程序即视为您已接受这些条款。</p>

    <h3>1. 许可授予</h3>
    <p>开发者授予用户有限的、不可转让的、非独占的许可，以便将其用于个人或商业目的（用于保存服务记录）。本许可仅涵盖使用权，不包括应用程序的所有权。</p>

    <h3>2. 使用限制</h3>
    <p>用户同意不执行以下操作：</p>
    <ul>
        <li>复制、再版或分发应用程序。</li>
        <li>对应用程序进行逆向工程、尝试访问源代码或对其进行修改。</li>
        <li>向第三方出租或出售应用程序。</li>
    </ul>

    <h3>3. 数据存储与隐私</h3>
    <p><strong>本地存储：</strong> 应用程序仅在用户的设备上本地存储所有输入的数据（客户信息、服务详情、照片等）。</p>
    <p><strong>服务器访问：</strong> 开发者在应用程序上没有服务器连接。因此，开发者无法访问、查看或备份用户输入的任何数据。</p>
    <p><strong>数据安全：</strong> 数据的安全性、备份和保护完全由用户负责。</p>

    <h3>4. 免责声明（责任限制）</h3>
    <p><strong>数据丢失：</strong> 对于因设备故障、操作系统错误、应用程序删除或硬件损坏等情况可能导致的数据丢失，开发者不承担责任。建议用户定期采取自己的备份措施。</p>
    <p><strong>错误：</strong> 应用程序按“原样”提供。开发者不保证应用程序始终无错误运行或提供不间断的服务。</p>

    <h3>5. 支付与退款政策</h3>
    <p>用户通过数字市场一次性购买获得应用程序。没有应用内购买或订阅。由于数字内容的性质，并在当地法规框架内，除非应用市场另有说明，否则不予退款。</p>

    <h3>6. 终止</h3>
    <p>如果用户违反本协议条款，开发者可以单方面终止许可权。</p>

    <h3>7. 法律管辖与争议</h3>
    <p>对于因本协议引起的争议，适用现行的当地法律。</p>
</div>`
    },
    {
        id: 8,
        languageCode: "ja",
        title: "ライセンス契約",
        acceptText: "同意する",
        declineText: "同意しない",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – エンドユーザー使用許諾契約 (EULA)</h1>
    <p>本契約は、<strong>CarServiceArchiver</strong>（以下「アプリケーション」）と、本アプリケーションを購入/使用する個人（以下「ユーザー」）との間で締結されます。アプリケーションをインストールまたは使用することにより、これらの条件に同意したものとみなされます。</p>

    <h3>1. ライセンスの付与</h3>
    <p>開発者はユーザーに対し、個人的または商業的な目的（サービス記録の保持）でアプリケーションを使用するための、限定的、譲渡不能、非独占的な使用ライセンスを付与します。このライセンスは使用権のみを対象とし、アプリケーションの所有権は対象としません。</p>

    <h3>2. 使用制限</h3>
    <p>ユーザーは以下の行為を行わないことに同意します：</p>
    <ul>
        <li>アプリケーションの複製、複製、または再配布。</li>
        <li>アプリケーションの逆コンパイル（リバースエンジニアリング）、ソースコードへのアクセス試行、または改変。</li>
        <li>第三者へのアプリケーションの賃貸または販売。</li>
    </ul>

    <h3>3. データ保存とプライバシー</h3>
    <p><strong>ローカル保存：</strong> アプリケーションは、入力されたすべてのデータ（顧客情報、サービスの詳細、写真など）をユーザーのデバイスにローカルにのみ保存します。</p>
    <p><strong>サーバーアクセス：</strong> 開発者はアプリケーション上にサーバー接続を持っていません。したがって、開発者はユーザーが入力したデータにアクセス、閲覧、またはバックアップすることはできません。</p>
    <p><strong>データセキュリティ：</strong> データのセキュリティ、バックアップ、および保護は、完全にユーザーの責任です。</p>

    <h3>4. 免責事項（責任の制限）</h3>
    <p><strong>データ損失：</strong> デバイスの故障、オペレーティングシステムのエラー、アプリケーションの削除、またはハードウェアの損傷などの状況で発生する可能性のあるデータ損失について、開発者は責任を負いません。ユーザーは定期的に独自のバックアップ対策を講じることが推奨されます。</p>
    <p><strong>エラー：</strong> アプリケーションは「現状のまま」提供されます。開発者は、アプリケーションが常にエラーなしで動作すること、または中断のないサービスを提供することを保証しません。</p>

    <h3>5. 支払いと返金ポリシー</h3>
    <p>ユーザーはデジタルマーケットを通じて一度限りの購入でアプリケーションを取得します。アプリ内課金やサブスクリプションはありません。デジタルコンテンツの性質上、および地域の規制の枠組み内で、アプリマーケットによって別段の定めがない限り、返金は行われません。</p>

    <h3>6. 解除</h3>
    <p>ユーザーが本契約の条項に違反した場合、開発者は一方的にライセンス権を解除することができます。</p>

    <h3>7. 法的管轄と紛争</h3>
    <p>本契約から生じる紛争については、適用される現地の法律が適用されます。</p>
</div>`
    },
    {
        id: 9,
        languageCode: "ko",
        title: "라이선스 계약",
        acceptText: "동의함",
        declineText: "동의하지 않음",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – 최종 사용자 라이선스 계약 (EULA)</h1>
    <p>본 계약은 <strong>CarServiceArchiver</strong>(이하 "애플리케이션")와 본 애플리케이션을 구매/사용하는 개인(이하 "사용자") 간에 체결됩니다. 애플리케이션을 설치하거나 사용함으로써 귀하는 이 약관에 동의한 것으로 간주됩니다.</p>

    <h3>1. 라이선스 부여</h3>
    <p>개발자는 사용자에게 개인적 또는 상업적 목적(서비스 기록 유지)으로 애플리케이션을 사용할 수 있는 제한적이고 양도 불가능하며 비독점적인 라이선스를 부여합니다. 이 라이선스는 사용 권한만을 포함하며 애플리케이션의 소유권은 포함하지 않습니다.</p>

    <h3>2. 사용 제한</h3>
    <p>사용자는 다음 행위를 하지 않을 것에 동의합니다:</p>
    <ul>
        <li>애플리케이션의 복사, 복제 또는 재배포.</li>
        <li>애플리케이션에 대한 역공학(리버스 엔지니어링), 소스 코드 접근 시도 또는 변경.</li>
        <li>제3자에게 애플리케이션 대여 또는 판매.</li>
    </ul>

    <h3>3. 데이터 저장 및 개인정보 보호</h3>
    <p><strong>로컬 저장:</strong> 애플리케이션은 입력된 모든 데이터(고객 정보, 서비스 세부 정보, 사진 등)를 사용자의 기기에 로컬로만 저장합니다.</p>
    <p><strong>서버 접근:</strong> 개발자는 애플리케이션에 대한 서버 연결이 없습니다. 따라서 개발자는 사용자가 입력한 데이터에 접근하거나, 보거나, 백업할 수 없습니다.</p>
    <p><strong>데이터 보안:</strong> 데이터의 보안, 백업 및 보호는 전적으로 사용자의 책임입니다.</p>

    <h3>4. 면책 조항 (책임의 제한)</h3>
    <p><strong>데이터 손실:</strong> 기기 고장, 운영 체제 오류, 애플리케이션 삭제 또는 하드웨어 손상과 같은 상황에서 발생할 수 있는 데이터 손실에 대해 개발자는 책임을 지지 않습니다. 사용자는 정기적으로 자체 백업 조치를 취하는 것이 좋습니다.</p>
    <p><strong>오류:</strong> 애플리케이션은 "있는 그대로" 제공됩니다. 개발자는 애플리케이션이 항상 오류 없이 작동하거나 중단 없는 서비스를 제공한다고 보증하지 않습니다.</p>

    <h3>5. 결제 및 환불 정책</h3>
    <p>사용자는 디지털 마켓을 통해 일회성 구매로 애플리케이션을 획득합니다. 인앱 구매나 구독은 없습니다. 디지털 콘텐츠의 특성상 및 현지 규정의 틀 내에서, 앱 마켓에서 별도로 명시하지 않는 한 환불은 이루어지지 않습니다.</p>

    <h3>6. 해지</h3>
    <p>사용자가 본 계약의 조항을 위반할 경우, 개발자는 일방적으로 라이선스 권한을 해지할 수 있습니다.</p>

    <h3>7. 법적 관할 및 분쟁</h3>
    <p>본 계약에서 발생하는 분쟁에 대해서는 적용되는 현지 법률이 적용됩니다.</p>
</div>`
    },
    {
        id: 10,
        languageCode: "ru",
        title: "Лицензионное соглашение",
        acceptText: "Я принимаю",
        declineText: "Я не принимаю",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Лицензионное соглашение с конечным пользователем (EULA)</h1>
    <p>Настоящее соглашение заключено между <strong>CarServiceArchiver</strong> (далее "Приложение") и лицом, покупающим/использующим это Приложение (далее "Пользователь"). Устанавливая или используя Приложение, вы считаетесь принявшим эти условия.</p>

    <h3>1. Предоставление лицензии</h3>
    <p>Разработчик предоставляет Пользователю ограниченную, непередаваемую и неисключительную лицензию на использование Приложения в личных или коммерческих целях (для ведения записей об обслуживании). Эта лицензия распространяется только на право использования, а не на право собственности на Приложение.</p>

    <h3>2. Ограничения использования</h3>
    <p>Пользователь соглашается не совершать следующие действия:</p>
    <ul>
        <li>Копирование, воспроизведение или перераспределение Приложения.</li>
        <li>Выполнение обратного проектирования (реверс-инжиниринга) Приложения, попытка доступа к исходному коду или его изменение.</li>
        <li>Сдача в аренду или продажа Приложения третьим лицам.</li>
    </ul>

    <h3>3. Хранение данных и конфиденциальность</h3>
    <p><strong>Локальное хранение:</strong> Приложение хранит все введенные данные (информация о клиенте, детали обслуживания, фото и т. д.) только локально на устройстве Пользователя.</p>
    <p><strong>Доступ к серверу:</strong> У Разработчика нет подключения к серверу в Приложении. Следовательно, Разработчик не может получать доступ, просматривать или создавать резервные копии любых данных, введенных Пользователем.</p>
    <p><strong>Безопасность данных:</strong> Безопасность, резервное копирование и защита данных полностью лежат на ответственности Пользователя.</p>

    <h3>4. Отказ от ответственности (Ограничение ответственности)</h3>
    <p><strong>Потеря данных:</strong> Разработчик не несет ответственности за потерю данных, которая может возникнуть в таких ситуациях, как сбой устройства, ошибки операционной системы, удаление приложения или повреждение оборудования. Рекомендуется, чтобы Пользователь регулярно принимал собственные меры по резервному копированию.</p>
    <p><strong>Ошибки:</strong> Приложение предоставляется "как есть". Разработчик не гарантирует, что приложение всегда будет работать без ошибок или предоставлять бесперебойный сервис.</p>

    <h3>5. Политика оплаты и возврата</h3>
    <p>Пользователь приобретает Приложение путем единовременной покупки через цифровой магазин. В приложении нет встроенных покупок или подписок. В силу природы цифрового контента и в рамках местных правил возврат средств не производится, если иное не указано магазином приложений.</p>

    <h3>6. Расторжение</h3>
    <p>В случае нарушения Пользователем условий настоящего соглашения, Разработчик может в одностороннем порядке расторгнуть право лицензии.</p>

    <h3>7. Юрисдикция и споры</h3>
    <p>В спорах, возникающих из настоящего соглашения, применяются действующие местные законы.</p>
</div>`
    },
    {
        id: 11,
        languageCode: "nl",
        title: "Licentieovereenkomst",
        acceptText: "Ik accepteer",
        declineText: "Ik weiger",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Eindgebruikerslicentieovereenkomst (EULA)</h1>
    <p>Deze overeenkomst is gesloten tussen <strong>CarServiceArchiver</strong> (hierna "Applicatie" genoemd) en de persoon die deze Applicatie koopt/gebruikt (hierna "Gebruiker" genoemd). Door de Applicatie te installeren of te gebruiken, wordt u geacht deze voorwaarden te hebben geaccepteerd.</p>

    <h3>1. Licentieverlening</h3>
    <p>De Ontwikkelaar verleent de Gebruiker een beperkte, niet-overdraagbare en niet-exclusieve licentie om de Applicatie te gebruiken voor persoonlijke of commerciële doeleinden (om onderhoudsgegevens bij te houden). Deze licentie dekt alleen het gebruiksrecht, niet het eigendom van de Applicatie.</p>

    <h3>2. Gebruiksbeperkingen</h3>
    <p>De Gebruiker stemt ermee in de volgende acties niet uit te voeren:</p>
    <ul>
        <li>Kopiëren, reproduceren of herdistribueren van de Applicatie.</li>
        <li>Reverse engineering toepassen op de Applicatie, proberen toegang te krijgen tot de broncode of deze wijzigen.</li>
        <li>Verhuren of verkopen van de Applicatie aan derden.</li>
    </ul>

    <h3>3. Gegevensopslag en Privacy</h3>
    <p><strong>Lokale Opslag:</strong> De Applicatie slaat alle ingevoerde gegevens (klantinformatie, onderhoudsdetails, foto's, enz.) alleen lokaal op het apparaat van de Gebruiker op.</p>
    <p><strong>Servertoegang:</strong> De Ontwikkelaar heeft geen serververbinding op de Applicatie. Daarom kan de Ontwikkelaar geen toegang krijgen tot, inzage hebben in of back-ups maken van gegevens die door de Gebruiker zijn ingevoerd.</p>
    <p><strong>Gegevensbeveiliging:</strong> De beveiliging, back-up en bescherming van gegevens vallen volledig onder de verantwoordelijkheid van de Gebruiker.</p>

    <h3>4. Disclaimer (Beperking van Aansprakelijkheid)</h3>
    <p><strong>Gegevensverlies:</strong> De Ontwikkelaar kan niet aansprakelijk worden gesteld voor gegevensverlies dat kan optreden in situaties zoals apparaatstoringen, besturingssysteemfouten, verwijdering van de applicatie of hardwarebeschadiging. Het wordt aanbevolen dat de Gebruiker regelmatig eigen back-upmaatregelen neemt.</p>
    <p><strong>Fouten:</strong> De Applicatie wordt geleverd "zoals deze is". De Ontwikkelaar garandeert niet dat de applicatie altijd foutloos zal werken of ononderbroken service zal bieden.</p>

    <h3>5. Betalings- en Restitutiebeleid</h3>
    <p>De Gebruiker verkrijgt de Applicatie via een eenmalige aankoop via de digitale markt. Er zijn geen in-app aankopen of abonnementen. Vanwege de aard van digitale inhoud en binnen het kader van lokale regelgeving, worden er geen restituties verleend tenzij anders vermeld door de applicatiemarkt.</p>

    <h3>6. Beëindiging</h3>
    <p>In geval de Gebruiker de voorwaarden van deze overeenkomst schendt, kan de Ontwikkelaar het licentierecht eenzijdig beëindigen.</p>

    <h3>7. Rechtsbevoegdheid en Geschillen</h3>
    <p>In geschillen die voortvloeien uit deze overeenkomst, zijn de toepasselijke lokale wetten van toepassing.</p>
</div>`
    },
    {
        id: 12,
        languageCode: "az",
        title: "Lisenziya Müqaviləsi",
        acceptText: "Qəbul Edirəm",
        declineText: "Qəbul Etmirəm",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Son İstifadəçi Lisenziya Müqaviləsi (EULA)</h1>
    <p>Bu müqavilə <strong>CarServiceArchiver</strong> (bundan sonra "Tətbiq" adlandırılacaq) ilə bu Tətbiqi alan/istifadə edən şəxs (bundan sonra "İstifadəçi" adlandırılacaq) arasında bağlanmışdır. Tətbiqi yükləyərək və ya istifadə edərək bu şərtləri qəbul etmiş sayılırsınız.</p>

    <h3>1. Lisenziya Hüququ</h3>
    <p>İnkişaf etdirici, İstifadəçiyə Tətbiqi şəxsi və ya kommersiya məqsədləri üçün (servis qeydlərini saxlamaq üzrə) istifadə etməsi üçün məhdud, ötürülə bilməyən və qeyri-müstəsna bir istifadə lisenziyası verir. Bu lisenziya Tətbiqin mülkiyyətini deyil, yalnız istifadə hüququnu əhatə edir.</p>

    <h3>2. İstifadə Məhdudiyyətləri</h3>
    <p>İstifadəçi aşağıdakı hərəkətləri həyata keçirməyəcəyini qəbul edir:</p>
    <ul>
        <li>Tətbiqi kopyalamaq, çoxaltmaq və ya yenidən yaymaq.</li>
        <li>Tətbiq üzərində tərsinə mühəndislik (reverse engineering) etmək, mənbə koduna daxil olmağa çalışmaq və ya üzərində dəyişiklik etmək.</li>
        <li>Tətbiqi üçüncü şəxslərə icarəyə vermək və ya satmaq.</li>
    </ul>

    <h3>3. Məlumatın Saxlanılması və Məxfilik</h3>
    <p><strong>Yerli Yaddaş:</strong> Tətbiq, daxil edilən bütün məlumatları (müştəri məlumatları, servis detalları, fotolar və s.) yalnız İstifadəçinin cihazında yerli (local) olaraq saxlayır.</p>
    <p><strong>Server Girişi:</strong> İnkişaf etdiricinin Tətbiq üzərində hər hansı bir server əlaqəsi yoxdur. Bu səbəbdən İnkişaf etdirici, İstifadəçi tərəfindən daxil edilən heç bir məlumata daxil ola bilməz, bunları görə bilməz və ya nüsxəsini çıxara bilməz.</p>
    <p><strong>Məlumat Təhlükəsizliyi:</strong> Məlumatların təhlükəsizliyi, nüsxələnməsi və qorunması tamamilə İstifadəçinin məsuliyyətindədir.</p>

    <h3>4. Məsuliyyətdən İmtina (Məsuliyyətin Məhdudlaşdırılması)</h3>
    <p><strong>Məlumat İtkisi:</strong> Cihaz nasazlığı, əməliyyat sistemi xətaları, tətbiqin silinməsi və ya aparat zədələnməsi kimi hallarda baş verə biləcək məlumat itkilərindən İnkişaf etdirici məsuliyyət daşımır. İstifadəçinin müntəzəm olaraq öz nüsxələmə tədbirlərini alması tövsiyə olunur.</p>
    <p><strong>Xətalar:</strong> Tətbiq "olduğu kimi" təqdim edilir. İnkişaf etdirici, tətbiqin hər zaman xətasız işləyəcəyini və ya kəsintisiz xidmət göstərəcəyini zəmanət etmir.</p>

    <h3>5. Ödəniş və Geri Qaytarma Siyasəti</h3>
    <p>İstifadəçi, Tətbiqi rəqəmsal market üzərindən birdəfəlik satınalma ilə əldə edir. Tətbiq daxili satınalma və ya abunəlik yoxdur. Rəqəmsal məzmunun təbiəti və yerli qanunvericilik çərçivəsində, tətbiq marketi tərəfindən başqa cür göstərilmədikcə ödəniş geri qaytarılmır.</p>

    <h3>6. Xitam</h3>
    <p>İstifadəçinin bu müqavilə maddələrini pozması halında, İnkişaf etdirici lisenziya hüququnu birtərəfli olaraq ləğv edə bilər.</p>

    <h3>7. Hüquqi Səlahiyyət və Mübahisələr</h3>
    <p>Bu müqavilədən yarana biləcək mübahisələrdə, qüvvədə olan yerli qanunlar tətbiq edilir.</p>
</div>`
    },
    {
        id: 13,
        languageCode: "it",
        title: "Contratto di Licenza",
        acceptText: "Accetto",
        declineText: "Non Accetto",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Contratto di Licenza con l'Utente Finale (EULA)</h1>
    <p>Questo contratto è stipulato tra <strong>CarServiceArchiver</strong> (di seguito "Applicazione") e la persona che acquista/utilizza questa Applicazione (di seguito "Utente"). Installando o utilizzando l'Applicazione, si ritiene che l'utente abbia accettato questi termini.</p>

    <h3>1. Concessione della Licenza</h3>
    <p>Lo Sviluppatore concede all'Utente una licenza limitata, non trasferibile e non esclusiva per utilizzare l'Applicazione per scopi personali o commerciali (per conservare i registri di servizio). Questa licenza copre solo il diritto d'uso, non la proprietà dell'Applicazione.</p>

    <h3>2. Restrizioni d'Uso</h3>
    <p>L'Utente accetta di non compiere le seguenti azioni:</p>
    <ul>
        <li>Copiare, riprodurre o ridistribuire l'Applicazione.</li>
        <li>Effettuare reverse engineering sull'Applicazione, tentare di accedere al codice sorgente o modificarlo.</li>
        <li>Affittare o vendere l'Applicazione a terzi.</li>
    </ul>

    <h3>3. Archiviazione dei Dati e Privacy</h3>
    <p><strong>Archiviazione Locale:</strong> L'Applicazione archivia tutti i dati inseriti (informazioni cliente, dettagli del servizio, foto, ecc.) solo localmente sul dispositivo dell'Utente.</p>
    <p><strong>Accesso al Server:</strong> Lo Sviluppatore non ha alcuna connessione server sull'Applicazione. Pertanto, lo Sviluppatore non può accedere, visualizzare o eseguire il backup di alcun dato inserito dall'Utente.</p>
    <p><strong>Sicurezza dei Dati:</strong> La sicurezza, il backup e la protezione dei dati sono interamente responsabilità dell'Utente.</p>

    <h3>4. Esclusione di Responsabilità (Limitazione di Responsabilità)</h3>
    <p><strong>Perdita di Dati:</strong> Lo Sviluppatore non può essere ritenuto responsabile per perdite di dati che possono verificarsi in situazioni come guasti del dispositivo, errori del sistema operativo, eliminazione dell'applicazione o danni hardware. Si consiglia all'Utente di adottare regolarmente le proprie misure di backup.</p>
    <p><strong>Errori:</strong> L'Applicazione è fornita "così com'è". Lo Sviluppatore non garantisce che l'applicazione funzionerà sempre senza errori o fornirà un servizio ininterrotto.</p>

    <h3>5. Politica di Pagamento e Rimborso</h3>
    <p>L'Utente acquisisce l'Applicazione tramite un acquisto una tantum via mercato digitale. Non ci sono acquisti in-app o abbonamenti. A causa della natura del contenuto digitale e nel quadro delle normative locali, non vengono effettuati rimborsi a meno che non sia indicato diversamente dal mercato delle applicazioni.</p>

    <h3>6. Risoluzione</h3>
    <p>Nel caso in cui l'Utente violi i termini di questo contratto, lo Sviluppatore può revocare unilateralmente il diritto di licenza.</p>

    <h3>7. Giurisdizione Legale e Controversie</h3>
    <p>Nelle controversie derivanti da questo contratto, si applicano le leggi locali vigenti.</p>
</div>`
    },
    {
        id: 14,
        languageCode: "pl",
        title: "Umowa Licencyjna",
        acceptText: "Akceptuję",
        declineText: "Nie Akceptuję",
        eula: `
<div class="eula-container">
    <h1>CarServiceArchiver – Umowa Licencyjna Użytkownika Końcowego (EULA)</h1>
    <p>Niniejsza umowa została zawarta pomiędzy <strong>CarServiceArchiver</strong> (zwaną dalej "Aplikacją") a osobą kupującą/używającą tej Aplikacji (zwaną dalej "Użytkownikiem"). Instalując lub używając Aplikacji, uznaje się, że zaakceptowałeś te warunki.</p>

    <h3>1. Udzielenie Licencji</h3>
    <p>Deweloper udziela Użytkownikowi ograniczonej, niezbywalnej i niewyłącznej licencji na korzystanie z Aplikacji do celów osobistych lub komercyjnych (w celu prowadzenia rejestrów usług). Licencja ta obejmuje jedynie prawo do użytkowania, a nie własność Aplikacji.</p>

    <h3>2. Ograniczenia Użytkowania</h3>
    <p>Użytkownik zgadza się nie wykonywać następujących czynności:</p>
    <ul>
        <li>Kopiowanie, powielanie lub redystrybucja Aplikacji.</li>
        <li>Dokonywanie inżynierii wstecznej (reverse engineering) Aplikacji, próba uzyskania dostępu do kodu źródłowego lub jego modyfikacja.</li>
        <li>Wynajmowanie lub sprzedawanie Aplikacji osobom trzecim.</li>
    </ul>

    <h3>3. Przechowywanie Danych i Prywatność</h3>
    <p><strong>Przechowywanie Lokalne:</strong> Aplikacja przechowuje wszystkie wprowadzone dane (informacje o kliencie, szczegóły usługi, zdjęcia itp.) wyłącznie lokalnie na urządzeniu Użytkownika.</p>
    <p><strong>Dostęp do Serwera:</strong> Deweloper nie posiada połączenia z serwerem w Aplikacji. W związku z tym Deweloper nie może uzyskiwać dostępu, przeglądać ani tworzyć kopii zapasowych żadnych danych wprowadzonych przez Użytkownika.</p>
    <p><strong>Bezpieczeństwo Danych:</strong> Bezpieczeństwo, tworzenie kopii zapasowych i ochrona danych są całkowicie odpowiedzialnością Użytkownika.</p>

    <h3>4. Zrzeczenie się Odpowiedzialności (Ograniczenie Odpowiedzialności)</h3>
    <p><strong>Utrata Danych:</strong> Deweloper nie ponosi odpowiedzialności za utratę danych, która może wystąpić w sytuacjach takich jak awaria urządzenia, błędy systemu operacyjnego, usunięcie aplikacji lub uszkodzenie sprzętu. Zaleca się, aby Użytkownik regularnie podejmował własne środki tworzenia kopii zapasowych.</p>
    <p><strong>Błędy:</strong> Aplikacja jest dostarczana "tak jak jest". Deweloper nie gwarantuje, że aplikacja będzie zawsze działać bezbłędnie lub zapewniać nieprzerwane usługi.</p>

    <h3>5. Polityka Płatności i Zwrotów</h3>
    <p>Użytkownik nabywa Aplikację poprzez jednorazowy zakup za pośrednictwem rynku cyfrowego. Nie ma zakupów w aplikacji ani subskrypcji. Ze względu na charakter treści cyfrowych i w ramach lokalnych przepisów, zwroty nie są dokonywane, chyba że rynek aplikacji stanowi inaczej.</p>

    <h3>6. Rozwiązanie Umowy</h3>
    <p>W przypadku naruszenia przez Użytkownika warunków niniejszej umowy, Deweloper może jednostronnie wypowiedzieć prawo licencyjne.</p>

    <h3>7. Jurysdykcja Prawna i Spory</h3>
    <p>W sporach wynikających z niniejszej umowy mają zastosowanie obowiązujące przepisy lokalne.</p>
</div>`
    }
];