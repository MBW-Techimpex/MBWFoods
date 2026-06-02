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
      };
      img.src = url;
   });
};

const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() + " Only";
};

const cleanAddressLine = (city, state, pincode) => {
   return [city, state, pincode]
      .map(s => String(s || '').trim())
      .filter(Boolean)
      .join(', ');
};

export const generateInvoice = async (order, settings = {}, action = 'download') => {
   console.log("Starting intelligent tax invoice generation...");

   try {
      if (!order) throw new Error("Order data is missing");

      const doc = new jsPDF();
      const hexToRgb = (hex) => {
         const r = parseInt(hex.slice(1, 3), 16);
         const g = parseInt(hex.slice(3, 5), 16);
         const b = parseInt(hex.slice(5, 7), 16);
         return [r, g, b];
      };

      const slate900 = [15, 23, 42];
      const slate600 = [71, 85, 105];
      const slate400 = [148, 163, 184];

      // --- ADVANCED GST DETECTION ---
      const homeState = (settings.state_name || 'Tamil Nadu').toLowerCase().trim();
      let destState = (order.shipping_state || order.shippingState || '').toLowerCase().trim();
      
      // Fallback: If state is missing, try to detect from zip (very common for legacy orders)
      const zip = String(order.shipping_zip || order.shippingZip || '');
      if (!destState) {
         if (zip.startsWith('560') || zip.startsWith('57') || zip.startsWith('58') || zip.startsWith('59')) {
            destState = 'karnataka';
         } else if (zip.startsWith('60') || zip.startsWith('61') || zip.startsWith('62') || zip.startsWith('63') || zip.startsWith('64')) {
            destState = 'tamil nadu';
         } else {
            destState = 'tamil nadu'; // Final fallback
         }
      }

      const isInterState = homeState !== destState;

      // --- LOGO & BRANDING ---
      if (settings.site_logo) {
         const logoUrl = getImageUrl(settings.site_logo);
         const img = await loadImage(logoUrl);
         if (img) doc.addImage(img, 'PNG', 14, 12, 25, 15);
      }

      const companyName = (settings.site_name || "MBW CAR ACCESSORIES").toUpperCase();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...slate900);
      doc.text(companyName, 14, 35);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate600);
      const companyAddr = settings.headquarters_address || settings.address || "Nashville, Tennessee";
      const splitAddr = doc.splitTextToSize(companyAddr, 80);
      doc.text(splitAddr, 14, 40);

      const nextY = 40 + (splitAddr.length * 4);

      // --- RIGHT SIDE INFO ---
      doc.setFontSize(10);
      doc.text(`State/UT Code: ${settings.state_code || '33'}`, 196, 15, { align: "right" });

      doc.setFontSize(11);
      doc.text("Shipping Address :", 196, 35, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const custName = order.customer_name || order.customerName || "Valued Customer";
      doc.text(custName, 196, 40, { align: "right" });
      
      const shipAddress = order.shipping_address || order.shippingAddress || "N/A";
      const splitShip = doc.splitTextToSize(shipAddress, 60);
      doc.text(splitShip, 196, 45, { align: "right" });

      const shipCity = order.shipping_city || order.shippingCity || '';
      const shipState = order.shipping_state || order.shippingState || '';
      const cityZip = cleanAddressLine(shipCity, shipState, zip);
      const addrY = 45 + (splitShip.length * 4);
      doc.text(cityZip, 196, addrY, { align: "right" });
      doc.text("IN", 196, addrY + 4, { align: "right" });



      // --- BILLING ADDRESS ---
      const billingY = nextY + 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Billing Address :", 14, billingY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(custName, 14, billingY + 5);
      const billAddress = order.billing_address || order.billingAddress || shipAddress;
      const splitBill = doc.splitTextToSize(billAddress, 80);
      doc.text(splitBill, 14, billingY + 10);
      const billCity = order.billing_city || order.billingCity || shipCity;
      const billState = order.billing_state || order.billingState || shipState;
      const billZip = String(order.billing_zip || order.billingZip || zip || '');
      const billCityZip = cleanAddressLine(billCity, billState, billZip);
      doc.text(billCityZip, 14, billingY + 10 + (splitBill.length * 4));

      // --- ORDER & INVOICE DETAILS ---
      const detailY = Math.max(addrY + 35, billingY + 25);
      const displayId = String(order.id).split('-')[0].padStart(3, '0');
      const invoicePrefix = (settings.site_name || "MBW").split(' ')[0].toUpperCase();
      const orderDate = (order.created_at || order.createdAt) ? new Date(order.created_at || order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Order Number: ${order.orderId || displayId}`, 14, detailY);
      doc.text(`Order Date: ${orderDate}`, 14, detailY + 5);

      doc.text(`Invoice Number : ${invoicePrefix}-${displayId}`, 196, detailY, { align: "right" });
      doc.text(`Invoice Details : TN-${invoicePrefix}-${Date.now()}`, 196, detailY + 5, { align: "right" });
      doc.text(`Invoice Date : ${orderDate}`, 196, detailY + 10, { align: "right" });

      // --- TAX TABLE ---
      const items = order.items || [];
      const taxRate = 18; 
      const rows = [];
      let calculatedTotalTax = 0;
      let calculatedGrandTotal = 0;

      items.forEach((item, idx) => {
         const priceIncTax = parseFloat(item.price);
         const qty = item.quantity;
         const totalIncTax = priceIncTax * qty;
         const netAmount = totalIncTax / (1 + (taxRate/100));
         const taxAmount = totalIncTax - netAmount;

         calculatedTotalTax += taxAmount;
         calculatedGrandTotal += totalIncTax;

         if (isInterState) {
            rows.push([idx + 1, item.name, netAmount.toFixed(2), "0.00", qty, netAmount.toFixed(2), "18%", "IGST", taxAmount.toFixed(2), totalIncTax.toFixed(2)]);
         } else {
            rows.push([idx + 1, item.name, netAmount.toFixed(2), "0.00", qty, netAmount.toFixed(2), "9%", "CGST", (taxAmount / 2).toFixed(2), totalIncTax.toFixed(2)]);
            rows.push(["", "", "", "", "", "", "9%", "SGST", (taxAmount / 2).toFixed(2), ""]);
         }
      });

      const shippingPrice = parseFloat(order.shipping_amount || 0);
      if (shippingPrice > 0) {
         const shipNetAmount = shippingPrice / (1 + (taxRate/100));
         const shipTax = shippingPrice - shipNetAmount;
         calculatedTotalTax += shipTax;
         calculatedGrandTotal += shippingPrice;

         if (isInterState) {
            rows.push([items.length + 1, "Shipping Charges", shipNetAmount.toFixed(2), "0.00", 1, shipNetAmount.toFixed(2), "18%", "IGST", shipTax.toFixed(2), shippingPrice.toFixed(2)]);
         } else {
            rows.push([items.length + 1, "Shipping Charges", shipNetAmount.toFixed(2), "0.00", 1, shipNetAmount.toFixed(2), "9%", "CGST", (shipTax / 2).toFixed(2), shippingPrice.toFixed(2)]);
            rows.push(["", "", "", "", "", "", "9%", "SGST", (shipTax / 2).toFixed(2), ""]);
         }
      }

      doc.autoTable({
         startY: detailY + 20,
         head: [["Sl.\nNo", "Description", "Unit\nPrice", "Discount", "Qty", "Net\nAmount", "Tax\nRate", "Tax\nType", "Tax\nAmount", "Total\nAmount"]],
         body: rows,
         theme: "grid",
         headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontSize: 7, halign: 'center', fontStyle: 'bold' },
         styles: { fontSize: 7, textColor: [0, 0, 0] },
         columnStyles: { 0: { halign: 'center', cellWidth: 8 }, 1: { cellWidth: 60 }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'center' }, 5: { halign: 'right' }, 6: { halign: 'center' }, 7: { halign: 'center' }, 8: { halign: 'right' }, 9: { halign: 'right' } },
         margin: { left: 14, right: 14 }
      });

      let finalY = doc.lastAutoTable.finalY;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.rect(14, finalY, 182, 8);
      doc.text("TOTAL:", 16, finalY + 5.5);
      doc.text(calculatedTotalTax.toFixed(2), 177, finalY + 5.5, { align: "right" });
      doc.text(calculatedGrandTotal.toFixed(2), 195, finalY + 5.5, { align: "right" });
      
      finalY += 8;
      doc.rect(14, finalY, 182, 12);
      doc.text("Amount in Words:", 16, finalY + 4);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(numberToWords(Math.round(calculatedGrandTotal)), 16, finalY + 9);

      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...slate400);
      doc.text("This is a computer generated invoice and does not require physical signature.", 105, pageHeight - 15, { align: "center" });

      const fileName = `${invoicePrefix}_Invoice_${displayId}.pdf`;
      if (action === 'view') {
         window.open(doc.output('bloburl'), '_blank');
      } else {
         doc.save(fileName);
      }
   } catch (error) {
      console.error("Invoice System Error:", error);
      throw error;
   }
};
