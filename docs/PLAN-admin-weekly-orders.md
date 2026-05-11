# PLAN: Admin Weekly Order Grouping

Implement a week-based filtering and grouping system for the admin reservation dashboard to improve order management and clarity.

## User Review Required

> [!IMPORTANT]
> The default view will now show the **Current Week**. Orders from other weeks will be hidden unless selected via the new week picker.

## Proposed Changes

### [Admin Component]

#### [MODIFY] [AdminClient.tsx](file:///c:/Users/PC/Desktop/CODE/kuroko-reserve/app/admin/AdminClient.tsx)
- Add `weekFilter` state (defaulting to the current week's Monday).
- Update `filteredReservations` logic to include the `week_start` filter.
- Pass `weekFilter` and `setWeekFilter` to `ReservationsTab`.
- Extract all available weeks from the `reservations` data to populate the selector.

#### [MODIFY] [ReservationsTab.tsx](file:///c:/Users/PC/Desktop/CODE/kuroko-reserve/app/admin/components/ReservationsTab.tsx)
- Add a horizontal week selector (using `week_start` dates).
- Format week dates to be user-friendly (e.g., "Week of May 11" or "สัปดาห์ที่ 11 พ.ค.").
- Ensure the character card grouping still works within the selected week.

## Verification Plan

### Automated Tests
- None planned for this UI tweak.

### Manual Verification
1. Open Admin Panel.
2. Verify that orders are filtered by the current week by default.
3. Use the week selector to switch to "Next Week" and verify orders update.
4. Verify that "Total Stats" in the header still reflect global stats.
