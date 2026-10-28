# Car Service Archiver – Privacy Policy DRAFT

**Status:** Technical and legal review required. **Not an approved or published privacy policy.**
**Version:** Draft 0.1 · **Prepared:** 21 October 2026
**Developer/Controller:** [Legal name, address and other required contact details to be supplied]
**Support:** carservicearchiver.support@gmail.com
**Public URL:** [HTTPS URL to be published before Store submission]

## 1. Scope
Car Service Archiver is a Windows desktop application designed to manage vehicle, customer, parts and service records.

## 2. Local data
Customer contact details, vehicles, service records, part information and photographs entered by the user are designed to remain in a SQLite database and media files at the user's selected storage location. Application settings may be stored in the Windows per-user data area. A business that enters its customers' personal information has independent responsibilities for collecting, securing and lawfully processing those records.

## 3. Exports and backups
The reviewed application source does not contain a feature that automatically uploads workshop records to the developer. The packaged renderer includes an outbound HTTP/WebSocket restriction. This statement is not a claim that all runtime/network behavior of every dependency and packaged build has been independently verified. User-initiated backup, restore and CSV export can write data to destinations chosen by the user, including locations whose security the user must evaluate.

## 4. Support email
The feedback feature opens a draft addressed to `carservicearchiver.support@gmail.com` in the user's mail application; the user decides whether to send it. The application is not designed to automatically attach the database or service photographs. Information the user sends by email may be processed by the email providers involved. Support message retention period, access policies and erasure procedures remain to be specified: **[REVIEW REQUIRED]**.

## 5. Security and deletion
The user operating the device is responsible for access controls and backups for locally stored records. Behavior of installers, updates and uninstallers toward customer-selected storage locations must be validated in a real Windows package test.

## 6. Rights and contact
Access, rectification, deletion and other rights depend on applicable law and the roles of the parties processing the information. The developer support address is shown above for communications with the developer; a workshop's obligations to its own customers must be assessed separately.

## Outstanding publication tasks
- Identify the legal publishing entity and establish support email retention/deletion policies.
- Verify outgoing traffic, third-party components, production packaging and legal disclosures.
- Arrange legal review (including applicable Turkish KVKK rules).
- Publish a final version at a stable public HTTPS URL and submit that same URL in Partner Center.
- Align the final legal text with all 14 in-app locales.
