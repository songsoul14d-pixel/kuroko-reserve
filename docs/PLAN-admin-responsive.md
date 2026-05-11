# PLAN: Admin Responsive Design

Optimize the admin panel for mobile and tablet devices, ensuring all features are accessible and visually appealing on all screen sizes.

## User Review Required

> [!IMPORTANT]
> The sidebar layout will be significantly changed for mobile. I recommend a Bottom Navigation or a floating menu to save horizontal space.

## Proposed Changes

### [Admin Layout]

#### [MODIFY] [AdminClient.tsx](file:///c:/Users/PC/Desktop/CODE/kuroko-reserve/app/admin/AdminClient.tsx)
- **Sidebar**: Change `fixed left-0` to be hidden on mobile (`hidden md:flex`) and add a mobile-friendly navigation (Bottom Nav or Hamburger).
- **Main Content**: Adjust padding (`pl-24` -> `pl-0 md:pl-24`) and margins to avoid overlapping with mobile navigation.
- **Stats**: Optimize the grid for smaller screens, potentially using a 2x2 grid on tablets.

### [Admin Components]

#### [MODIFY] [ReservationsTab.tsx](file:///c:/Users/PC/Desktop/CODE/kuroko-reserve/app/admin/components/ReservationsTab.tsx)
- Ensure all horizontal scrolls have proper padding.
- Optimize order card layout for narrow screens (adjust flex-wrap and spacing).

#### [MODIFY] [RoundsTab.tsx](file:///c:/Users/PC/Desktop/CODE/kuroko-reserve/app/admin/components/RoundsTab.tsx)
- Adjust the grid layout for rounds to handle narrow widths gracefully.

## Verification Plan

### Automated Tests
- None.

### Manual Verification
1. Use browser developer tools to test various device sizes (iPhone SE to iPad Pro).
2. Verify sidebar/navigation accessibility on mobile.
3. Ensure no horizontal scrolling on the main page.
4. Verify all modals (Product Edit, Character Picker) are centered and usable on mobile.
