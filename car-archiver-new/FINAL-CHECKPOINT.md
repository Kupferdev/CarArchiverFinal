# Car UI checkpoint

This checkpoint contains the latest vehicle form changes requested on 2026-09-30.

- App terminology: Araç / Araçlar.
- Customer picker is opaque and readable.
- Custom year picker: 4-column rounded dropdown with scroll and hover state.
- Engine volume accepts keyboard digits only; native number spinners removed.
- Notes use a readable UI font and larger line height.
- Previous customers are displayed as cards on the vehicle edit screen.
- Previous customers can be added with a + search picker and removed with the standard trash button; trash turns red on hover.
- Changing an existing vehicle's current customer can prompt to add the previous customer to history. The previous customer is added atomically with the vehicle update when selected.
- Added IPC channels for adding/removing previous customers.
- Added repository support for removing previous customers and atomic vehicle update + previous customer history.

Typecheck was not run in this environment because node_modules/tsc is not installed in the working tree.
