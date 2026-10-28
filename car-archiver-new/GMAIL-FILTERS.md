# Car Service Archiver — Gmail support filters

Inbox: `carservicearchiver.support@gmail.com`

The app keeps the form UI localized across all 14 languages, but **does not translate** these three stable email subject categories:

| Gmail subject contains | Gmail label |
| --- | --- |
| `Bug Report` | `Bug Reports` |
| `Feature Request` | `Feature Requests` |
| `Support` | `Help & Support` |

Suggested subjects:
- `[Car Service Archiver] Bug Report: ...`
- `[Car Service Archiver] Feature Request: ...`
- `[Car Service Archiver] Support: ...`

In Gmail, use the advanced search **Subject** field, create a filter, and choose **Apply the label**. Existing labels without filters do not automatically apply to new messages. `In Progress` and `Resolved` remain manual workflow labels.

Sending uses the user's external email client (`mailto:`), so the application does not send email automatically or store Gmail credentials. No support email is sent until the user confirms sending in their email client.

Test: `node scripts/feedback-subject-check.mjs`.
