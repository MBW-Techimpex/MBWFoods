import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  React.useLayoutEffect(() => {
    const mainContent = document.querySelector('main');
    
    if (isOpen) {
      if (mainContent) {
        // Save current scroll position
        const scrollPos = mainContent.scrollTop;
        mainContent.dataset.savedScroll = scrollPos.toString();
        
        // Lock scrolling
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        mainContent.style.paddingRight = `${scrollbarWidth}px`;
        mainContent.style.overflow = 'hidden';
      }
      
      const style = document.createElement('style');
      style.id = 'modal-lock-style';
      style.innerHTML = `
        body, html { 
          overflow: hidden !important; 
        }
      `;
      document.head.appendChild(style);
    } else {
      const style = document.getElementById('modal-lock-style');
      if (style) style.remove();
      
      if (mainContent) {
        const saved = mainContent.dataset.savedScroll;
        mainContent.style.overflow = 'auto';
        mainContent.style.paddingRight = '';
        
        if (saved) {
          const savedPos = parseInt(saved, 10);
          mainContent.scrollTop = savedPos;
          
          // Double-check with a frame to ensure content is ready
          requestAnimationFrame(() => {
            if (mainContent) mainContent.scrollTop = savedPos;
          });
        }
      }
    }

    return () => {
      const style = document.getElementById('modal-lock-style');
      if (style) style.remove();
      if (mainContent) {
        mainContent.style.overflow = 'auto';
        mainContent.style.paddingRight = '';
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[1001] bg-slate-900/60 backdrop-blur-sm overflow-y-auto py-10 sm:py-20 px-4 flex justify-center items-start no-scrollbar"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] pointer-events-auto flex flex-col cursor-default overflow-hidden relative"
              style={{ maxHeight: '82vh' }}
            >
              {/* Modal Header - Fixed at top */}
              <div className="p-7 px-8 flex items-center justify-between flex-shrink-0 border-b border-slate-100 bg-white z-20">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-white hover:shadow-xl transition-all group"
                >
                  <IconX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
              
              {/* Modal Body - Scrollable internal area */}
              <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white no-scrollbar scroll-smooth z-10">
                  {children}
              </div>

              {/* Modal Footer - Fixed at bottom */}
              {footer && (
                <div className="p-7 px-8 border-t border-slate-100 bg-slate-50/50 flex-shrink-0 z-20">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;



