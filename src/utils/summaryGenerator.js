import jsPDF from "jspdf";
import "jspdf-autotable";
import { getImageUrl } from "./imageHelper";

// Robust image loader with timeout
const loadImage = (url) => {
   return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      const timer = setTimeout(() => {
         console.warn("Image load timeout for:", url);
         resolve(null);
      }, 3000);

      img.onload = () => {
         clearTimeout(timer);
         resolve(img);
      };
      img.onerror = () => {
         clearTimeout(timer);
         console.warn("Image load error for:", url);
         resolve(null);
      },
      img.src = url;
   });
};

export const generateSummary = async (order, settings = {}) => {
   console.log("Starting order summary generation...");
   
   try {
      if (!order) throw new Error("Order data is missing");

      const doc = new jsPDF();
      
      const hexToRgb = (hex) => {
         const r = parseInt(hex.slice(1, 3), 16);
         const g = parseInt(hex.slice(3, 5), 16);
         const b = parseInt(hex.slice(5, 7), 16);
         return [r, g, b];
      };

      const primaryColor = settings.theme_color ? hexToRgb(settings.theme_color) : [15, 23, 42]; // Default to dark slate
      const accentColor = [79, 70, 229]; // Indigo
      const slate900 = [15, 23, 42];
      const slate600 = [71, 85, 105];
      const slate400 = [148, 163, 184];

      // --- HEADER SECTION ---
      // Logo (if available)
      if (settings.site_logo) {
         const logoImg = await loadImage(getImageUrl(settings.site_logo));
         if (logoImg) {
            doc.addImage(logoImg, "PNG", 14, 15, 30, 12, undefined, 'FAST');
         }
      } else {
         doc.setFont("helvetica", "bold");
         doc.setFontSize(22);
         doc.setTextColor(...primaryColor);
         doc.text(settings.site_name || "MBW CARS", 14, 25);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...slate900);
      doc.text("ORDER SUMMARY", 196, 25, { align: "right" });

      const displayId = order.orderId ? String(order.orderId).padStart(3, '0') : (order.id ? String(order.id).split('-')[0].padStart(3, '0').toUpperCase() : "N/A");
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate600);
      doc.text(`Order Reference: #${displayId}`, 196, 32, { align: "right" });
      doc.text(`Generated: ${new Date().toLocaleString()}`, 196, 37, { align: "right" });

      // --- CUSTOMER & DELIVERY INFO (SIDE BY SIDE CARDS) ---
      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(248, 250, 252);
      
      // Customer Card
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, 45, 90, 45, 3, 3, "FD");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...slate900);
      doc.text("CUSTOMER DETAILS", 20, 52);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...slate600);
      doc.text(`Name: ${order.customerName || 'N/A'}`, 20, 60);
      doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 20, 66);
      doc.text(`Email: ${order.customerEmail || 'N/A'}`, 20, 72);

      // Delivery Card
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(106, 45, 90, 45, 3, 3, "FD");
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...slate900);
      doc.text("DELIVERY & LOGISTICS", 112, 52);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...slate600);
      const fullAddress = [
         order.shippingAddress,
         order.shippingCity,
         order.shippingState ? `${order.shippingState} ${order.shippingZip || ''}` : order.shippingZip
      ].filter(Boolean).join(', ');
      
      doc.setFont("helvetica", "bold");
      doc.text("SHIPPING ADDRESS", 112, 60);
      doc.setFont("helvetica", "normal");
      doc.text(fullAddress || 'N/A', 112, 68, { maxWidth: 78 });

      // --- ITEMS TABLE ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...slate900);
      doc.text("PURCHASED COLLECTIONS", 14, 105);

      const formatCurr = (val) => {
         return parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      const tableData = order.items.map(item => [
         item.name,
         item.quantity,
         `INR ${formatCurr(item.price)}`,
         `INR ${formatCurr(parseFloat(item.price) * item.quantity)}`
      ]);

      doc.autoTable({
         startY: 110,
         head: [["Description", "Qty", "Unit Price", "Amount"]],
         body: tableData,
         theme: "grid",
         headStyles: { 
            fillColor: primaryColor, 
            textColor: [255, 255, 255], 
            fontStyle: "bold",
            fontSize: 9,
            halign: 'center'
         },
         bodyStyles: { 
            fontSize: 8, 
            textColor: slate600,
            halign: 'center'
         },
         columnStyles: {
            0: { halign: 'left', fontStyle: 'bold', cellWidth: 100 },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' }
         },
         margin: { left: 14, right: 14 }
      });

      // --- FINANCIAL SUMMARY ---
      const finalY = doc.lastAutoTable.finalY + 15;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...slate600);
      
      const summaryLeftX = 130;
      const currencyX = 165; // Fixed position for INR label
      const summaryRightX = 194; // Fixed position for the value
      
      // Calculate item total separately
      const itemsTotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      
      const renderRow = (label, value, y, isTotal = false) => {
         doc.text(label, summaryLeftX, y);
         doc.text("INR", currencyX, y);
         doc.text(formatCurr(value), summaryRightX, y, { align: "right" });
      };

      renderRow("Items Total:", itemsTotal, finalY);

      let currentY = finalY;
      if (order.shipping_amount > 0) {
         currentY += 7;
         renderRow("Shipping Charges:", order.shipping_amount, currentY);
      }

      if (order.discountAmount > 0) {
         currentY += 7;
         doc.setTextColor(16, 185, 129); // Emerald
         renderRow("Discounts:", -order.discountAmount, currentY);
         doc.setTextColor(...slate600);
      }

      currentY += 7;
      renderRow("Taxes & Fees:", (order.tax_amount || 0), currentY);

      doc.setDrawColor(...slate900);
      doc.setLineWidth(0.5);
      doc.line(summaryLeftX, currentY + 4, 196, currentY + 4);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...slate900);
      currentY += 12;
      doc.text("Grand Total:", summaryLeftX, currentY);
      doc.text("INR", currencyX, currentY);
      doc.text(formatCurr(order.total_amount), summaryRightX, currentY, { align: "right" });

      // --- FOOTER ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...slate400);
      doc.text("This is an electronically generated order summary and does not require a physical signature.", 105, pageHeight - 20, { align: "center" });
      doc.text(`${settings.site_name || 'MBW'} - 24/7 Digital Support Enabled`, 105, pageHeight - 15, { align: "center" });

      doc.save(`Order_Summary_${displayId}.pdf`);
      console.log("Summary generated successfully.");
   } catch (error) {
      console.error("Summary generation failed:", error);
      throw error;
   }
};
