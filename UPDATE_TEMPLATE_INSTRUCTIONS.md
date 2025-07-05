# DOCX Template Update Instructions

## How to Update Your Template

The `docx-templates` library uses the default `{{variableName}}` syntax. You need to update your `Family Policy.docx` file placeholders:

### Current Placeholders → New Placeholders

- `[POLICY NUMBER]` → `{{policyNumber}}`
- `[FULL NAME]` → `{{fullName}}`
- `[VEHICLE REG NUMBER]` → `{{vehicleRegNumber}}`
- `[MAKE OF VEHICLE]` → `{{makeOfVehicle}}`
- `[START DATE]` → `{{startDate}}`
- `[END DATE]` → `{{endDate}}`

## Step-by-Step Instructions

1. **Open** `src/Family Policy.docx` in Microsoft Word
2. **Use Find & Replace** (Ctrl+H) to update each placeholder:

   **Replace 1:**

   - Find: `[POLICY NUMBER]`
   - Replace: `{{policyNumber}}`
   - Click "Replace All"

   **Replace 2:**

   - Find: `[FULL NAME]`
   - Replace: `{{fullName}}`
   - Click "Replace All"

   **Replace 3:**

   - Find: `[VEHICLE REG NUMBER]`
   - Replace: `{{vehicleRegNumber}}`
   - Click "Replace All"

   **Replace 4:**

   - Find: `[MAKE OF VEHICLE]`
   - Replace: `{{makeOfVehicle}}`
   - Click "Replace All"

   **Replace 5:**

   - Find: `[START DATE]`
   - Replace: `{{startDate}}`
   - Click "Replace All"

   **Replace 6:**

   - Find: `[END DATE]`
   - Replace: `{{endDate}}`
   - Click "Replace All"

3. **Save** the document (Ctrl+S)

## What the System Will Fill In

- `{{policyNumber}}` → Policy number (e.g., "MMV135918666/1")
- `{{fullName}}` → Customer's full name (e.g., "Mrs. Samina Ara")
- `{{vehicleRegNumber}}` → Vehicle registration (e.g., "AK62UKZ")
- `{{makeOfVehicle}}` → Year + Make + Model (e.g., "2012 Honda Jazz")
- `{{startDate}}` → Start time and date (e.g., "00:01 on 8 May 2023")
- `{{endDate}}` → End time and date (e.g., "23:59 on 7 May 2024")

## Test After Update

After updating the template, test the email functionality from the admin/sub-admin policy detail pages. The system should now generate personalized certificates without errors.
