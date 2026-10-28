# Release evidence format – instructions (do not copy to project root as an approval)

**Evidence files are statements supplied by the developer after external verification**, not automated certification. `release:gate` checks that required evidence has been recorded in a specific format; it does NOT itself verify Partner Center, legal correctness, HTTPS page contents, a digital signature or Windows install results.

## A. `PRIVACY-POLICY-PUBLIC.md` (project root, AFTER legal review and actual publication)

    Public URL: https://your-real-domain.tld/privacy
    Legal review: approved
    Reviewed version: 1.0
    Reviewed by: <name/date>

The URL must be reachable to end users and display the policy corresponding to the installed app. Never create this file merely to satisfy a test.

## B. `STORE-IDENTITY-APPROVED.md` (project root, AFTER reserving name in Partner Center and verifying values against Product identity)

    Identity name: <exact Partner Center Package Identity Name>
    Publisher: CN=<exact Partner Center Publisher>
    Publisher display name: <exact PublisherDisplayName>
    Partner Center review: verified
    Checked by: <name/date>

The exact values must also be present as `appx.identityName`, `appx.publisher` and `appx.publisherDisplayName` in `electron-builder.json5`. This file does not replace checking the built AppxManifest.xml.

## C. `WINDOWS-MSIX-SIGNOFF.md` (project root, AFTER Windows package acceptance tests)

    Package SHA256: <64 lowercase or uppercase hex characters>
    Package version: 1.0.0.0  (example only; verify actual built manifest)
    Install test: PASS
    Update test: PASS
    Uninstall external data: PASS
    Tested by: <name/date>
    Test package: <exact path/name; e.g. .appx>
    Test Windows version: <version>
    Test data directory: <disposable directory only>

Use two truly different increasing package versions for update testing; don't check “PASS” without exercising upgrade, data storage and the uninstall flow.
