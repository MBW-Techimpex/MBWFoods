import React from "react";
import { createPortal } from "react-dom";
import { IconTrash, IconExclamationCircle, IconX } from "@tabler/icons-react";

/**
 * A modern, premium delete confirmation modal.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onConfirm - Function to call when confirming deletion
 * @param {string} props.title - The title of the item being deleted
 * @param {string} [props.message] - Optional custom message
 * @param {boolean} [props.loading] - Optional loading state for the delete button
 */
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  loading = false 
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-bloom-in pointer-events-auto">
        <div className="p-10 flex flex-col items-center text-center">
          {/* Icon Circle */}
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-red-500 mb-6">
            <IconTrash size={32} stroke={2} />
          </div>

          <h3 className="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">
            Are you sure?
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed px-4">
            {message || (
              <>
                You are about to delete <span className="text-red-600 font-bold">"{title}"</span>. 
                <br />This action cannot be undone.
              </>
            )}
          </p>

          <div className="w-full h-px bg-slate-50 my-8"></div>

          <div className="w-full flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-sm transition-all shadow-lg shadow-red-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteConfirmModal;
