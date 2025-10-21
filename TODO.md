# Fix Create Account Page

## Information Gathered
- Current signup modal in Login.tsx has basic fields: name, username, email, password.
- User wants the create account page to be similar to Twitter/X's signup page.
- Twitter/X signup includes: name, email/phone, date of birth (month, day, year).
- Need to update the signup form to match this layout and add date of birth fields.
- Remove username field as it's not in Twitter/X signup.
- Keep the modal structure but improve the form layout.

## Plan
- Update the signup modal in Login.tsx:
  - Remove username field.
  - Add date of birth fields: month (dropdown), day (dropdown), year (dropdown).
  - Keep name, email, password fields.
  - Update form layout for better UX similar to Twitter/X.
  - Ensure form validation for new fields.
- Update handleSignup to include date of birth in the API call (may need to update apiService.signup if necessary).

## Dependent Files to be edited
- twiller/src/components/Login.tsx
- Possibly twiller/src/lib/apiService.ts if DOB needs to be added to signup API.

## Followup steps
- Test the updated signup form UI and functionality.
- Verify form validation works for date of birth.
- Ensure API integration works with new fields.
- Check responsiveness on different screen sizes.
