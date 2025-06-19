# Delete Confirmation Dialog Implementation

## Overview
Replaced the browser's native `window.confirm()` dialog with a custom shadcn/ui `AlertDialog` component for a better user experience when deleting templates.

## Components Added

### 1. AlertDialog Component (`src/components/ui/alert-dialog.tsx`)
- Based on Radix UI's AlertDialog primitive
- Provides consistent styling with the rest of the application
- Includes proper accessibility features

### 2. DeleteConfirmDialog Component (`src/components/ui/delete-confirm-dialog.tsx`)
- Reusable wrapper around AlertDialog
- Specifically designed for delete confirmations
- Features:
  - Customizable title and description
  - Destructive styling for the confirm button
  - Trash icon for visual context
  - Proper ARIA attributes for accessibility

## Implementation

### Before:
```javascript
const handleDeleteTemplate = async (templateId: string) => {
  if (window.confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
    const deleted = await deleteTemplate(templateId)
    if (deleted) {
      console.log("Template deleted successfully")
    }
  }
}
```

### After:
```javascript
const handleDeleteTemplate = async (templateId: string) => {
  const deleted = await deleteTemplate(templateId)
  if (deleted) {
    console.log("Template deleted successfully")
  }
}
```

The confirmation is now handled by the `DeleteConfirmDialog` component in the `TemplateCard`:

```tsx
<DeleteConfirmDialog
  title="Delete Template"
  description={`Are you sure you want to delete "${template.name}"? This action cannot be undone and will permanently remove the template and all its questions.`}
  onConfirm={() => onDelete(template.id)}
>
  <DropdownMenuItem 
    className="text-red-600 focus:text-red-600"
    onSelect={(e) => e.preventDefault()}
  >
    <Trash2 className="mr-2 h-4 w-4" />
    Delete
  </DropdownMenuItem>
</DeleteConfirmDialog>
```

## Features

1. **Better UX**: Native-looking dialog that matches the app's design system
2. **Accessibility**: Proper ARIA attributes and keyboard navigation
3. **Responsive**: Works well on both desktop and mobile
4. **Reusable**: Can be used throughout the application for any delete confirmation
5. **Customizable**: Title, description, and styling can be customized per use case

## Usage

The `DeleteConfirmDialog` can be used anywhere in the application where a delete confirmation is needed:

```tsx
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

<DeleteConfirmDialog
  title="Custom Title"
  description="Custom description text"
  onConfirm={() => handleDelete()}
>
  <Button variant="destructive">Delete Item</Button>
</DeleteConfirmDialog>
```

## Testing

- ✅ Template deletion works correctly
- ✅ Dialog appears when clicking delete
- ✅ Dialog closes on cancel
- ✅ Dialog closes and executes delete on confirm
- ✅ No console errors or warnings
- ✅ Maintains proper focus management and accessibility
