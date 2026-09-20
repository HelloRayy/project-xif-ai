import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

/**
 * ConfirmAlertModal - Standardized confirmation dialog
 * @param {Object} alertState - { open: boolean, title: string, description: string, confirmLabel?: string, cancelLabel?: string, variant?: 'default'|'destructive', onConfirm?: Function }
 * @param {Function} onClose - Callback to close dialog
 */
export default function ConfirmAlertModal({ alertState, onClose }) {
  if (!alertState) return null;

  return (
    <AlertDialog open={!!alertState.open} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
            {alertState.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-600 dark:text-zinc-400">
            {alertState.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {alertState.cancelLabel && (
            <AlertDialogCancel
              onClick={onClose}
              className="h-9 px-3.5 text-xs font-medium rounded-lg border-border"
            >
              {alertState.cancelLabel}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            className={cn(
              "h-9 px-4 text-xs font-medium rounded-lg text-white",
              alertState.variant === 'destructive'
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={() => {
              if (alertState.onConfirm) alertState.onConfirm();
              onClose();
            }}
          >
            {alertState.confirmLabel || alertState.actionLabel || 'Mengerti'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
