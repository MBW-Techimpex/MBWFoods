import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import { IconCheck } from '@tabler/icons-react';
import API_BASE from '../config';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { getImageUrl } from '../utils/imageHelper';
import { useNotification } from '../context/NotificationContext';
import { loadRazorpay } from '../utils/paymentHelper';

// ── Pincode Lookup Map (defined outside component so it's always available) ──
const PIN_CODE_MAP = {
  // Tamil Nadu
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu' },
  '600003': { city: 'Chennai', state: 'Tamil Nadu' },
  '600004': { city: 'Chennai', state: 'Tamil Nadu' },
  '600005': { city: 'Chennai', state: 'Tamil Nadu' },
  '600006': { city: 'Chennai', state: 'Tamil Nadu' },
  '600007': { city: 'Chennai', state: 'Tamil Nadu' },
  '600008': { city: 'Chennai', state: 'Tamil Nadu' },
  '600010': { city: 'Chennai', state: 'Tamil Nadu' },
  '600011': { city: 'Chennai', state: 'Tamil Nadu' },
  '600012': { city: 'Chennai', state: 'Tamil Nadu' },
  '600014': { city: 'Chennai', state: 'Tamil Nadu' },
  '600017': { city: 'Chennai', state: 'Tamil Nadu' },
  '600018': { city: 'Chennai', state: 'Tamil Nadu' },
  '600019': { city: 'Chennai', state: 'Tamil Nadu' },
  '600020': { city: 'Chennai', state: 'Tamil Nadu' },
  '600024': { city: 'Chennai', state: 'Tamil Nadu' },
  '600025': { city: 'Chennai', state: 'Tamil Nadu' },
  '600026': { city: 'Chennai', state: 'Tamil Nadu' },
  '600028': { city: 'Chennai', state: 'Tamil Nadu' },
  '600029': { city: 'Chennai', state: 'Tamil Nadu' },
  '600030': { city: 'Chennai', state: 'Tamil Nadu' },
  '600031': { city: 'Chennai', state: 'Tamil Nadu' },
  '600032': { city: 'Chennai', state: 'Tamil Nadu' },
  '600033': { city: 'Chennai', state: 'Tamil Nadu' },
  '600034': { city: 'Chennai', state: 'Tamil Nadu' },
  '600035': { city: 'Chennai', state: 'Tamil Nadu' },
  '600036': { city: 'Chennai', state: 'Tamil Nadu' },
  '600037': { city: 'Chennai', state: 'Tamil Nadu' },
  '600040': { city: 'Chennai', state: 'Tamil Nadu' },
  '600041': { city: 'Chennai', state: 'Tamil Nadu' },
  '600042': { city: 'Chennai', state: 'Tamil Nadu' },
  '600044': { city: 'Chennai', state: 'Tamil Nadu' },
  '600045': { city: 'Chennai', state: 'Tamil Nadu' },
  '600050': { city: 'Chennai', state: 'Tamil Nadu' },
  '600052': { city: 'Chennai', state: 'Tamil Nadu' },
  '600053': { city: 'Chennai', state: 'Tamil Nadu' },
  '600055': { city: 'Chennai', state: 'Tamil Nadu' },
  '600056': { city: 'Chennai', state: 'Tamil Nadu' },
  '600057': { city: 'Chennai', state: 'Tamil Nadu' },
  '600058': { city: 'Chennai', state: 'Tamil Nadu' },
  '600059': { city: 'Chennai', state: 'Tamil Nadu' },
  '600060': { city: 'Chennai', state: 'Tamil Nadu' },
  '600061': { city: 'Chennai', state: 'Tamil Nadu' },
  '600062': { city: 'Chennai', state: 'Tamil Nadu' },
  '600063': { city: 'Chennai', state: 'Tamil Nadu' },
  '600064': { city: 'Chennai', state: 'Tamil Nadu' },
  '600065': { city: 'Chennai', state: 'Tamil Nadu' },
  '600066': { city: 'Chennai', state: 'Tamil Nadu' },
  '600067': { city: 'Chennai', state: 'Tamil Nadu' },
  '600068': { city: 'Chennai', state: 'Tamil Nadu' },
  '600069': { city: 'Chennai', state: 'Tamil Nadu' },
  '600070': { city: 'Chennai', state: 'Tamil Nadu' },
  '600071': { city: 'Chennai', state: 'Tamil Nadu' },
  '600072': { city: 'Chennai', state: 'Tamil Nadu' },
  '600073': { city: 'Chennai', state: 'Tamil Nadu' },
  '600074': { city: 'Chennai', state: 'Tamil Nadu' },
  '600075': { city: 'Chennai', state: 'Tamil Nadu' },
  '600076': { city: 'Chennai', state: 'Tamil Nadu' },
  '600077': { city: 'Chennai', state: 'Tamil Nadu' },
  '600078': { city: 'Chennai', state: 'Tamil Nadu' },
  '600079': { city: 'Chennai', state: 'Tamil Nadu' },
  '600080': { city: 'Chennai', state: 'Tamil Nadu' },
  '600081': { city: 'Chennai', state: 'Tamil Nadu' },
  '600082': { city: 'Chennai', state: 'Tamil Nadu' },
  '600083': { city: 'Chennai', state: 'Tamil Nadu' },
  '600084': { city: 'Chennai', state: 'Tamil Nadu' },
  '600085': { city: 'Chennai', state: 'Tamil Nadu' },
  '600086': { city: 'Chennai', state: 'Tamil Nadu' },
  '600087': { city: 'Chennai', state: 'Tamil Nadu' },
  '600088': { city: 'Chennai', state: 'Tamil Nadu' },
  '600089': { city: 'Chennai', state: 'Tamil Nadu' },
  '600090': { city: 'Chennai', state: 'Tamil Nadu' },
  '600091': { city: 'Chennai', state: 'Tamil Nadu' },
  '600092': { city: 'Chennai', state: 'Tamil Nadu' },
  '600093': { city: 'Chennai', state: 'Tamil Nadu' },
  '600094': { city: 'Chennai', state: 'Tamil Nadu' },
  '600095': { city: 'Chennai', state: 'Tamil Nadu' },
  '600096': { city: 'Chennai', state: 'Tamil Nadu' },
  '600097': { city: 'Chennai', state: 'Tamil Nadu' },
  '600098': { city: 'Chennai', state: 'Tamil Nadu' },
  '600099': { city: 'Chennai', state: 'Tamil Nadu' },
  '600100': { city: 'Chennai', state: 'Tamil Nadu' },
  '600101': { city: 'Chennai', state: 'Tamil Nadu' },
  '600102': { city: 'Chennai', state: 'Tamil Nadu' },
  '600103': { city: 'Chennai', state: 'Tamil Nadu' },
  '600104': { city: 'Chennai', state: 'Tamil Nadu' },
  '600105': { city: 'Chennai', state: 'Tamil Nadu' },
  '600106': { city: 'Chennai', state: 'Tamil Nadu' },
  '600107': { city: 'Chennai', state: 'Tamil Nadu' },
  '600108': { city: 'Chennai', state: 'Tamil Nadu' },
  '600109': { city: 'Chennai', state: 'Tamil Nadu' },
  '600110': { city: 'Chennai', state: 'Tamil Nadu' },
  '600111': { city: 'Chennai', state: 'Tamil Nadu' },
  '600112': { city: 'Chennai', state: 'Tamil Nadu' },
  '600113': { city: 'Chennai', state: 'Tamil Nadu' },
  '600114': { city: 'Chennai', state: 'Tamil Nadu' },
  '600115': { city: 'Chennai', state: 'Tamil Nadu' },
  '600116': { city: 'Chennai', state: 'Tamil Nadu' },
  '600117': { city: 'Chennai', state: 'Tamil Nadu' },
  '600118': { city: 'Chennai', state: 'Tamil Nadu' },
  '600119': { city: 'Chennai', state: 'Tamil Nadu' },
  '600120': { city: 'Chennai', state: 'Tamil Nadu' },
  '600122': { city: 'Chennai', state: 'Tamil Nadu' },
  '600123': { city: 'Kanchipuram', state: 'Tamil Nadu' },
  '600124': { city: 'Chennai', state: 'Tamil Nadu' },
  '600125': { city: 'Chennai', state: 'Tamil Nadu' },
  '600126': { city: 'Chennai', state: 'Tamil Nadu' },
  '600127': { city: 'Chennai', state: 'Tamil Nadu' },
  '600128': { city: 'Chennai', state: 'Tamil Nadu' },
  '600129': { city: 'Chennai', state: 'Tamil Nadu' },
  '600130': { city: 'Chennai', state: 'Tamil Nadu' },
  '631001': { city: 'Arakkonam', state: 'Tamil Nadu' },
  '632001': { city: 'Vellore', state: 'Tamil Nadu' },
  '636001': { city: 'Salem', state: 'Tamil Nadu' },
  '636103': { city: 'Salem', state: 'Tamil Nadu' },
  '641001': { city: 'Coimbatore', state: 'Tamil Nadu' },
  '625001': { city: 'Madurai', state: 'Tamil Nadu' },
  '620001': { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  '613001': { city: 'Thanjavur', state: 'Tamil Nadu' },
  '627001': { city: 'Tirunelveli', state: 'Tamil Nadu' },
  '629001': { city: 'Nagercoil', state: 'Tamil Nadu' },
  '600009': { city: 'Tambaram', state: 'Tamil Nadu' },
  '603001': { city: 'Chengalpattu', state: 'Tamil Nadu' },
  // Karnataka
  '560001': { city: 'Bangalore', state: 'Karnataka' },
  '560034': { city: 'Bangalore', state: 'Karnataka' },
  '560100': { city: 'Bangalore', state: 'Karnataka' },
  '570001': { city: 'Mysore', state: 'Karnataka' },
  // Maharashtra
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '440001': { city: 'Nagpur', state: 'Maharashtra' },
  // Delhi
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110002': { city: 'New Delhi', state: 'Delhi' },
  '110003': { city: 'New Delhi', state: 'Delhi' },
  '110004': { city: 'New Delhi', state: 'Delhi' },
  // Telangana
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '500002': { city: 'Hyderabad', state: 'Telangana' },
  // West Bengal
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  // Gujarat
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  // Rajasthan
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  // Uttar Pradesh
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '208001': { city: 'Kanpur', state: 'Uttar Pradesh' },
  // Kerala
  '682001': { city: 'Kochi', state: 'Kerala' },
  '695001': { city: 'Thiruvananthapuram', state: 'Kerala' },
  // Andhra Pradesh
  '520001': { city: 'Vijayawada', state: 'Andhra Pradesh' },
  '530001': { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
};

const Checkout = () => {
   const { cartItems, addOrder, clearCart } = useCart();
   const { customer, loading: authLoading, verifySession } = useAuth();
   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
   const { settings, formatPrice } = useSettings();
   const [isScrolled, setIsScrolled] = useState(false);
   const [activeStep, setActiveStep] = useState(1);
   const navigate = useNavigate();
   const { showNotification } = useNotification();

   const API_URL = `${API_BASE}/api`;

   const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      paymentMethod: 'razorpay',
      deliveryMethod: 'ship',
      orderNotes: ''
   });
   const [savedAddresses, setSavedAddresses] = useState([]);
   const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
   const [showStep1Suggestions, setShowStep1Suggestions] = useState(false);
   const [errors, setErrors] = useState({});
   const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
   const [atelierHours, setAtelierHours] = useState([]);
   const [deliveryAreas, setDeliveryAreas] = useState([]);
   const [calculatedShipping, setCalculatedShipping] = useState(50); // Minimum 50 Rs base
   const [fetchingLocation, setFetchingLocation] = useState(false);
   const [locationAutoFilled, setLocationAutoFilled] = useState(false);

    // Discount State
   const [promoCode, setPromoCode] = useState('');
   const [applyingDiscount, setApplyingDiscount] = useState(false);
   const [appliedDiscount, setAppliedDiscount] = useState(null);
   const [discountError, setDiscountError] = useState('');

   useEffect(() => {
      const handleScroll = () => {
         setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);

      // Fetch Saved Addresses
      if (customer) {
         fetch(`${API_URL}/addresses`, {
            credentials: 'include'
         })
            .then(res => res.json())
            .then(data => {
               if (Array.isArray(data)) setSavedAddresses(data);
            })
            .catch(err => console.error("Error fetching addresses:", err));
      }

      // Fetch Atelier Hours
      fetch(`${API_BASE}/api/atelier-hours`)
         .then(res => res.json())
         .then(data => {
            if (Array.isArray(data)) setAtelierHours(data);
         })
         .catch(err => console.error("Error fetching atelier hours:", err));

      // Fetch Delivery Areas for shipping calculation
      fetch(`${API_BASE}/api/delivery-areas`)
         .then(res => res.json())
         .then(data => {
            if (Array.isArray(data)) setDeliveryAreas(data);
         })
         .catch(err => console.error("Error fetching delivery areas:", err));

      // Load Razorpay Script
      loadRazorpay();

      return () => window.removeEventListener('scroll', handleScroll);
   }, [customer, authLoading]);

   // Auto-fill form if customer logged in
   useEffect(() => {
      if (customer) {
         setFormData(prev => ({
            ...prev,
            firstName: customer.first_name || prev.firstName,
            lastName: customer.last_name || prev.lastName,
            email: customer.email || prev.email,
            phone: customer.phone || prev.phone
         }));
      }
   }, [customer]);

   // Calculate Totals using high precision
   const subtotal = cartItems.reduce((acc, item) => {
      const base = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
      return acc + (base * item.quantity);
   }, 0);

   // Product-specific shipping total
   const productShippingTotal = cartItems.reduce((acc, item) => {
      const s = typeof item.shipping_price === 'string' ? parseFloat(item.shipping_price.replace(/[^\d.]/g, '')) : (item.shipping_price || 0);
      return acc + (s * item.quantity);
   }, 0);

   // Location-based shipping lookup
   useEffect(() => {
      if (formData.zip && deliveryAreas.length > 0) {
         const match = deliveryAreas.find(a => 
            a.zip_codes.split(',').map(z => z.trim()).includes(formData.zip.trim())
         );
         if (match) {
            setCalculatedShipping(parseFloat(match.shipping_charge || settings.delivery_fee || 50));
         } else {
            setCalculatedShipping(parseFloat(settings.delivery_fee || 50)); // Default from settings
         }
      } else {
        setCalculatedShipping(50);
     }
  }, [formData.zip, deliveryAreas, settings.delivery_fee]);

   // Tax and Shipping Calculation from Settings
   const taxRate = parseFloat(settings.tax_rate || 18);
   const isTamilNadu = formData.state?.toLowerCase().trim() === 'tamil nadu' || formData.state?.toLowerCase().trim() === 'tn';

   const discountAmount = appliedDiscount?.discountAmount || 0;
   const discountedSubtotal = Math.max(0, subtotal - discountAmount);

   // Shipping with Threshold logic
   let finalShipping = calculatedShipping + productShippingTotal;
   
   if (appliedDiscount?.type === 'free_shipping') {
      finalShipping = 0;
   }

   const shipping = finalShipping;

   // Detailed Tax Breakdown (Itemized)
   let cgst = 0;
   let sgst = 0;
   let igst = 0;

   cartItems.forEach(item => {
      // Robust price parsing for all currencies
      const itemBasePrice = typeof item.price === 'number' ? item.price : parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) || 0;
      let itemExtra = 0;
      if (item.options?.chocolates) {
         const match = item.options.chocolates.match(/\+(\d+\.\d+)/);
         if (match) itemExtra += parseFloat(match[1]);
      }
      if (item.options?.stuffedAnimal) {
         const match = item.options.stuffedAnimal.match(/\+(\d+\.\d+)/);
         if (match) itemExtra += parseFloat(match[1]);
      }
      
      const itemSubtotal = (itemBasePrice + itemExtra) * item.quantity;
      
      // Use individual tax_rate if it exists (not null), fallback to global taxRate
      const itemTaxRate = (item.tax_rate !== undefined && item.tax_rate !== null) ? parseFloat(item.tax_rate) : taxRate;

      if (isTamilNadu) {
         cgst += (itemSubtotal * (itemTaxRate / 2)) / 100;
         sgst += (itemSubtotal * (itemTaxRate / 2)) / 100;
      } else {
         igst += (itemSubtotal * itemTaxRate) / 100;
      }
   });

   // Pro-rata discount application to taxes
   if (discountAmount > 0 && subtotal > 0) {
      const discountRatio = discountedSubtotal / subtotal;
      cgst *= discountRatio;
      sgst *= discountRatio;
      igst *= discountRatio;
   }

    const tax = cgst + sgst + igst;
    const total = discountedSubtotal + shipping + tax;

    // COD Restriction Guard
    useEffect(() => {
       if (total > 50000 && formData.paymentMethod === 'cod') {
          setFormData(prev => ({ ...prev, paymentMethod: 'razorpay' }));
          showNotification("Cash on Delivery is unavailable for orders above ₹50,000. Switched to Online Payment.", "info");
       }
    }, [total, formData.paymentMethod]);

   const handleApplyDiscount = async () => {
      if (!promoCode.trim()) return;
      setApplyingDiscount(true);
      setDiscountError('');

      try {
         const res = await fetch(`${API_URL}/discounts/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               code: promoCode,
               cartItems,
               customerId: customer?.id,
               customerEmail: formData.email,
               subtotal
            })
         });

         const data = await res.json();
         if (data.valid) {
            setAppliedDiscount({
               ...data,
               discountAmount: parseFloat(data.discountAmount) || 0
            });
            setDiscountError('');
         } else {
            setAppliedDiscount(null);
            setDiscountError(data.message);
         }
      } catch (err) {
         console.error("Discount validation failed:", err);
         setDiscountError('Failed to validate discount code.');
      } finally {
         setApplyingDiscount(false);
      }
   };



   // Auto-fill form with the default saved address if available
   useEffect(() => {
      if (savedAddresses.length > 0 && !formData.address) {
         const defaultAddress = savedAddresses.find(a => a.is_default) || savedAddresses[0];
         setFormData(prev => ({
            ...prev,
            firstName: defaultAddress.first_name || prev.firstName,
            lastName: defaultAddress.last_name || prev.lastName,
            address: defaultAddress.street || prev.address,
            city: defaultAddress.city || prev.city,
            state: defaultAddress.state || prev.state,
            zip: defaultAddress.zip || prev.zip,
            phone: defaultAddress.phone || prev.phone
         }));
      }
   }, [savedAddresses]);

   // Auto-fetch city & state when a valid 6-digit pincode is entered
   useEffect(() => {
      if (!formData.zip || formData.zip.length !== 6) {
         setLocationAutoFilled(false);
         return;
      }

      // 1. Instant lookup from bundled map
      const localMatch = PIN_CODE_MAP[formData.zip];
      if (localMatch) {
         setFormData(prev => ({ ...prev, city: localMatch.city, state: localMatch.state }));
         setLocationAutoFilled(true);
         setFetchingLocation(false);
         return;
      }

      // 2. API fallback for pincodes not in local map
      setFetchingLocation(true);
      setLocationAutoFilled(false);

      const controller = new AbortController();
      fetch(`https://api.postalpincode.in/pincode/${formData.zip}`, { signal: controller.signal })
         .then(res => res.json())
         .then(data => {
            if (data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
               const po = data[0].PostOffice[0];
               setFormData(prev => ({ ...prev, city: po.District, state: po.State }));
               setLocationAutoFilled(true);
            }
         })
         .catch(err => {
            if (err.name !== 'AbortError') console.warn('Pincode lookup failed:', err.message);
         })
         .finally(() => setFetchingLocation(false));

      return () => controller.abort();
   }, [formData.zip]);

   const cityToStateMap = {
      'Chennai': 'Tamil Nadu', 'Coimbatore': 'Tamil Nadu', 'Madurai': 'Tamil Nadu',
      'Salem': 'Tamil Nadu', 'Tiruchirappalli': 'Tamil Nadu', 'Tambaram': 'Tamil Nadu',
      'Bangalore': 'Karnataka', 'Mysore': 'Karnataka', 'Hubli': 'Karnataka',
      'Mumbai': 'Maharashtra', 'Pune': 'Maharashtra', 'Nagpur': 'Maharashtra',
      'Delhi': 'Delhi', 'New Delhi': 'Delhi',
      'Hyderabad': 'Telangana', 'Kolkata': 'West Bengal',
      'Ahmedabad': 'Gujarat', 'Surat': 'Gujarat',
      'Jaipur': 'Rajasthan', 'Lucknow': 'Uttar Pradesh', 'Kanpur': 'Uttar Pradesh',
      'Kochi': 'Kerala', 'Thiruvananthapuram': 'Kerala',
      'Vijayawada': 'Andhra Pradesh', 'Visakhapatnam': 'Andhra Pradesh',
      'Indore': 'Madhya Pradesh', 'Bhopal': 'Madhya Pradesh',
      'Chandigarh': 'Chandigarh', 'Patna': 'Bihar', 'Guwahati': 'Assam',
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => {
         if (name === 'phone' && /[a-zA-Z]/.test(value)) return prev;
         if (name === 'zip' && (/[^0-9]/.test(value) || value.length > 6)) return prev;
         if (name === 'address' && value.length > 250) return prev;
         if (name === 'orderNotes' && value.length > 100) return prev;
         const newData = { ...prev, [name]: value };

         if (name === 'city') {
            const city = value.trim();
            const foundCity = Object.keys(cityToStateMap).find(c => c.toLowerCase() === city.toLowerCase());
            if (foundCity) {
               newData.state = cityToStateMap[foundCity];
            }
         }
         return newData;
      });
   };

   const selectSavedAddress = (addr) => {
      setFormData(prev => ({
         ...prev,
         firstName: addr.first_name || prev.firstName,
         lastName: addr.last_name || prev.lastName,
         address: addr.street,
         city: addr.city,
         state: addr.state || '',
         zip: addr.zip,
         phone: addr.phone || prev.phone
      }));
      setShowAddressSuggestions(false);
      setShowStep1Suggestions(false);
      setErrors(prev => {
         const newErrors = { ...prev };
         delete newErrors.firstName;
         delete newErrors.lastName;
         delete newErrors.phone;
         delete newErrors.address;
         delete newErrors.city;
         delete newErrors.state;
         delete newErrors.zip;
         return newErrors;
      });
   };

   const validateStep = (step) => {
      const newErrors = {};
      if (step === 1) {
         if (!formData.firstName.trim()) newErrors.firstName = "First name required";
         if (!formData.lastName.trim()) newErrors.lastName = "Last name required";
         if (!formData.email.trim()) newErrors.email = "Email required";
         else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
         if (!formData.phone.trim()) {
            newErrors.phone = "Phone required";
         } else {
            const digitsOnly = formData.phone.replace(/\D/g, '');
            if (digitsOnly.length < 6 || digitsOnly.length > 15) {
               newErrors.phone = "Must be between 6 and 15 digits";
            }
         }
      } else if (step === 2) {
         if (!formData.address.trim()) newErrors.address = "Address required";
         if (!formData.city.trim()) newErrors.city = "City required";
         if (!formData.state.trim()) newErrors.state = "State required";
         if (!formData.zip.trim()) {
            newErrors.zip = "Pin code required";
         } else if (!/^\d{6}$/.test(formData.zip)) {
            newErrors.zip = "Must be exactly 6 digits";
         }
         if (formData.orderNotes && formData.orderNotes.length > 100) newErrors.orderNotes = `Exceeds 100 char limit by ${formData.orderNotes.length - 100}`;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleNextStep = (step) => {
      if (validateStep(step)) {
         setActiveStep(step + 1);
         setTimeout(() => {
            const el = document.getElementById(`step-${step + 1}`);
            if (el) {
               const y = el.getBoundingClientRect().top + window.scrollY - 100;
               window.scrollTo({ top: y, behavior: 'smooth' });
            }
         }, 100);
      } else {
         setTimeout(() => {
            const errorElement = document.querySelector('.border-red-400');
            if (errorElement) {
               const y = errorElement.getBoundingClientRect().top + window.scrollY - 150;
               window.scrollTo({ top: y, behavior: 'smooth' });
               errorElement.focus();
            }
         }, 100);
      }
   };

   const handleOrderSubmission = async (paymentId = null) => {
      const token = localStorage.getItem('customer_token');
      const sessionId = localStorage.getItem('cart_session_id') || `GUEST-${Math.random().toString(36).substr(2, 9)}`;

      const payload = {
         items: cartItems,
         totalAmount: total,
         paymentMethod: formData.paymentMethod,
         paymentId: paymentId,
         customerInfo: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone
         },
         shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip
         },
         name: `${formData.firstName} ${formData.lastName}`,
         email: formData.email,
         phone: formData.phone,
         firstName: formData.firstName,
         lastName: formData.lastName,
         deliveryMethod: formData.deliveryMethod,
         deliveryDate: formData.deliveryDate,
         timeSlot: formData.timeSlot,
         giftMessage: formData.giftMessage,
         occasionType: formData.occasion,
         location: formData.location,
         signature: formData.signature,
         orderNotes: formData.orderNotes,
         sessionId: sessionId,
         discountId: appliedDiscount?.discountId,
         discountAmount: appliedDiscount?.discountAmount
      };

      try {
         const response = await fetch(`${API_URL}/orders/place`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
         });

         if (response.ok) {
            const result = await response.json();

            if (result.token) {
               localStorage.setItem('customer_token', result.token);
               await verifySession();
            }

            // Explicit backend cart liquidation on success
            try {
               await fetch(`${API_BASE}/api/cart/clear`, {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ sessionId })
               });
            } catch (e) {
               console.warn("[CHECKOUT_LIQUIDATION_DELAYED]: Direct cart wipe failed, though order persisted.");
            }

            clearCart();
            navigate('/order-success', {
               state: {
                  items: cartItems,
                  transactionId: paymentId || result.orderId,
                  orderId: result.orderId,
                  total: total,
                  tax_amount: tax,
                  cgst,
                  sgst,
                  igst,
                  shipping_amount: shipping,
                  discountAmount: appliedDiscount?.discountAmount || 0,
                  customerName: `${formData.firstName} ${formData.lastName}`,
                  customerEmail: formData.email,
                  customerPhone: formData.phone,
                  shippingAddress: formData.address,
                  shippingCity: formData.city,
               shippingState: formData.state,
                  shippingZip: formData.zip,
                  paymentMethod: formData.paymentMethod
               }
            });
         } else {
            const err = await response.json();
            console.error(`[ORDER_SUBMIT_FAILURE] Status: ${response.status} URL: ${response.url}`, err);
            setErrorModal({
               isOpen: true,
               title: "Order Blocked",
               message: err.error || err.message || "Failed to finalize your registry selection."
            });
         }
      } catch (err) {
         console.error("[ORDER_SUBMIT_CRASH] Critical failure:", err);
         setErrorModal({
            isOpen: true,
            title: "Connection Error",
            message: "Archive Connection Failure: Could not finalize the transaction."
         });
      }
   };

   const handlePayment = () => {
      const options = {
         key: "rzp_test_SUZjdzjcXcSFpD",
         amount: Math.round(total * 100),
         currency: settings.currency || "INR",
         name: settings.site_name || "MBW Luxury",
         description: "Luxury Performance Components",
         handler: function (response) {
            handleOrderSubmission(response.razorpay_payment_id);
         },
         prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
         },
         theme: { color: settings.theme_color || "#5b21b6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
         showNotification("Payment Failed: " + (response.error.description || "The transaction could not be processed at this time."), "error");
      });
      rzp.open();
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.paymentMethod === 'razorpay') {
         handlePayment();
      } else {
         handleOrderSubmission(); // COD flow
      }
   };

   if (cartItems.length === 0) {
      return (
         <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 shadow-sm">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-slate-700"><path d="m6 2-3 4v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
            </div>
            <h1 className="text-3xl font-serif text-slate-900 dark:text-slate-100 mb-2 italic">Archive is Empty</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">You haven't added any luxury specimens to your registry yet.</p>
            <Link to="/" className="px-10 py-4 bg-brand-primary text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20">
               Start Collecting
            </Link>
         </div>
      );
   }

   const steps = [
      { id: 1, label: 'Contact', icon: (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
      { id: 2, label: 'Delivery', icon: (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg> },
      { id: 3, label: 'Payment', icon: (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg> },
   ];

   return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">
         <Header isScrolled={isScrolled} activePage="" />

         {/* ── Progress Banner ── */}
         <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-16 pb-12">
            <div className="container mx-auto px-6 max-w-5xl">
               <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="space-y-1">
                     <nav className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 flex gap-2">
                        <Link to="/cart" className="hover:text-brand-primary">Cart Archive</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-slate-100">Checkout</span>
                     </nav>
                     <h1 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-slate-100 leading-tight">Complete Your <span className="italic font-light text-brand-primary">Registry</span></h1>
                  </div>

                  {/* Progress Bubbles */}
                  <div className="flex items-center gap-4">
                     {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                           <div className={`flex flex-col items-center gap-2 group transition-all ${activeStep >= step.id ? 'opacity-100' : 'opacity-40'}`}>
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${activeStep === step.id ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110' : activeStep > step.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                 {activeStep > step.id ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg> : <step.icon />}
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest">{step.label}</span>
                           </div>
                           {idx < steps.length - 1 && <div className={`w-8 h-[2px] mb-6 transition-all ${activeStep > step.id ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`} />}
                        </React.Fragment>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         <main className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-12 items-start">

               {/* LEFT: Checkout Steps */}
               <div className="w-full lg:w-2/3 space-y-6">

                  {/* Step 1: Contact Information */}
                  <div id="step-1" className={`bg-white dark:bg-slate-900 rounded-[2rem] border transition-all ${activeStep === 1 ? 'border-brand-primary shadow-2xl p-8' : 'border-slate-100 dark:border-slate-800 opacity-60 p-6'}`}>
                     <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                           <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeStep === 1 ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>01</span>
                           <h3 className="text-xl font-serif text-slate-900 dark:text-slate-100">Personal Information</h3>
                        </div>
                        {activeStep > 1 && <button onClick={() => setActiveStep(1)} className="text-[10px] font-black uppercase text-brand-primary hover:underline">Edit</button>}
                     </div>

                     {activeStep === 1 ? (
                        <div className="space-y-6 animate-fadeIn">
                           {savedAddresses.length > 0 && (
                              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                                 <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest italic">Rapid Identity Matching</h4>
                                    <button
                                       onClick={() => setShowStep1Suggestions(!showStep1Suggestions)}
                                       className="text-[10px] font-black uppercase text-brand-primary hover:underline"
                                    >
                                       {showStep1Suggestions ? "Manual Entry" : "Quick fill from saved profile"}
                                    </button>
                                 </div>
                                 {showStep1Suggestions && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                                       {savedAddresses.map(addr => (
                                          <div
                                             key={addr.id}
                                             onClick={() => selectSavedAddress(addr)}
                                             className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-brand-primary cursor-pointer transition-all hover:shadow-lg group"
                                          >
                                             <p className="text-[10px] font-bold text-brand-primary mb-1 uppercase tracking-tighter">{addr.title} Profile</p>
                                             <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{addr.first_name} {addr.last_name}</p>
                                             <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{addr.phone}</p>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           )}

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest pl-1">First Name</label>
                                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Eleanor" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border ${errors.firstName ? 'border-red-400' : 'border-slate-100 dark:border-slate-800'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-inner dark:text-slate-100`} />
                                  {errors.firstName && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.firstName}</p>}
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest pl-1">Last Name</label>
                                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Vance" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border ${errors.lastName ? 'border-red-400' : 'border-slate-100 dark:border-slate-800'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-inner dark:text-slate-100`} />
                                  {errors.lastName && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.lastName}</p>}
                               </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest pl-1">Email Registry</label>
                                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="eleanor@studio.com" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border ${errors.email ? 'border-red-400' : 'border-slate-100 dark:border-slate-800'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-inner dark:text-slate-100`} />
                                  {errors.email && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.email}</p>}
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest pl-1">Contact Number</label>
                                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (212) 000-000" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border ${errors.phone ? 'border-red-400' : 'border-slate-100 dark:border-slate-800'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-inner dark:text-slate-100`} />
                                  {errors.phone && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.phone}</p>}
                               </div>
                            </div>

                           <button onClick={() => handleNextStep(1)} className="w-full py-5 bg-brand-primary text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20">
                               Continue To Delivery
                            </button>
                        </div>
                      ) : (
                        <div className="flex gap-4 text-xs font-medium text-slate-500 italic">
                           {formData.firstName} {formData.lastName} • {formData.email}
                        </div>
                      )}
                  </div>

                  {/* Step 2: Delivery Specifics */}
                  <div id="step-2" className={`bg-white dark:bg-slate-900 rounded-[2rem] border transition-all ${activeStep === 2 ? 'border-brand-primary shadow-2xl p-8' : 'border-slate-100 dark:border-slate-800 opacity-60 p-6'}`}>
                     <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                           <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeStep === 2 ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>02</span>
                           <h3 className="text-xl font-serif text-slate-900 dark:text-slate-100">Delivery Architecture</h3>
                        </div>
                        {activeStep > 2 && <button onClick={() => setActiveStep(2)} className="text-[10px] font-black uppercase text-brand-primary hover:underline">Edit</button>}
                     </div>

                     {activeStep === 2 && (
                        <div className="space-y-8 animate-fadeIn">
                           {savedAddresses.length > 0 && (
                              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                                 <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest italic">Change Delivery Address</h4>
                                    <button
                                       onClick={() => setShowAddressSuggestions(!showAddressSuggestions)}
                                       className="text-[10px] font-black uppercase text-brand-primary hover:underline"
                                    >
                                       {showAddressSuggestions ? "Close Suggestions" : "Click desired address"}
                                    </button>
                                 </div>
                                 {showAddressSuggestions && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                                       {savedAddresses.map(addr => (
                                          <div
                                             key={addr.id}
                                             onClick={() => selectSavedAddress(addr)}
                                             className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-brand-primary cursor-pointer transition-all hover:shadow-lg group"
                                          >
                                             <p className="text-[10px] font-bold text-brand-primary mb-1 uppercase tracking-tighter">preferred address</p>
                                             <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{addr.street}</p>
                                             <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{addr.city}, {addr.zip}</p>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           )}

                           <div className="space-y-6">
                              <div className="space-y-1.5">
                                 <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Street Address</label>
                                    <span className={`text-[10px] font-bold ${formData.address?.length > 250 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                       {formData.address?.length || 0}/250
                                    </span>
                                 </div>
                                 <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="124 Studio Heights" className={`w-full px-6 py-4 bg-white dark:bg-slate-800 border ${errors.address ? 'border-red-400' : 'border-slate-100 dark:border-slate-800'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm dark:text-slate-100`} />
                                 {errors.address && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.address}</p>}
                              </div>

                               {/* Pincode Field */}
                               <div className="space-y-1.5">
                                  <div className="flex items-center justify-between px-1">
                                     <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Postal / PIN Code</label>
                                     {fetchingLocation && (
                                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-brand-primary animate-pulse">
                                           <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                           Fetching location...
                                        </span>
                                     )}
                                     {locationAutoFilled && !fetchingLocation && (
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                                           Auto-filled
                                        </span>
                                     )}
                                  </div>
                                  <input
                                     type="text"
                                     name="zip"
                                     value={formData.zip}
                                     onChange={handleInputChange}
                                     placeholder="e.g. 600017"
                                     maxLength={6}
                                     className={`w-full px-6 py-4 bg-white dark:bg-slate-800 border ${errors.zip ? 'border-red-400' : 'border-slate-100 dark:border-slate-800'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm dark:text-slate-100`}
                                  />
                                  {errors.zip && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.zip}</p>}
                               </div>

                               {/* City & State — always auto-populated from PIN, not user-editable */}
                               <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-1.5 relative">
                                     <div className="flex items-center gap-1.5 pl-1 mb-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">City</label>
                                        <svg className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                     </div>
                                     <div className="relative">
                                        <input
                                           type="text"
                                           name="city"
                                           value={formData.city}
                                           readOnly
                                           placeholder="Auto-filled from PIN"
                                           className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                                              errors.city ? 'border-red-400' :
                                              locationAutoFilled ? 'border-emerald-300 dark:border-emerald-800' :
                                              'border-slate-100 dark:border-slate-800'
                                           } rounded-2xl text-sm font-bold outline-none transition-all shadow-sm dark:text-slate-100 cursor-not-allowed select-none`}
                                        />
                                        {fetchingLocation && (
                                           <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                              <svg className="animate-spin w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                           </div>
                                        )}
                                        {locationAutoFilled && !fetchingLocation && (
                                           <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                                           </div>
                                        )}
                                     </div>
                                     {errors.city && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.city}</p>}
                                  </div>
                                  <div className="space-y-1.5">
                                     <div className="flex items-center gap-1.5 pl-1 mb-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">State</label>
                                        <svg className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                     </div>
                                     <div className="relative">
                                        <input
                                           type="text"
                                           name="state"
                                           value={formData.state}
                                           readOnly
                                           placeholder="Auto-filled from PIN"
                                           className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                                              errors.state ? 'border-red-400' :
                                              locationAutoFilled ? 'border-emerald-300 dark:border-emerald-800' :
                                              'border-slate-100 dark:border-slate-800'
                                           } rounded-2xl text-sm font-bold outline-none transition-all shadow-sm dark:text-slate-100 cursor-not-allowed select-none`}
                                        />
                                        {fetchingLocation && (
                                           <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                              <svg className="animate-spin w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                           </div>
                                        )}
                                        {locationAutoFilled && !fetchingLocation && (
                                           <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                                           </div>
                                        )}
                                     </div>
                                     {errors.state && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.state}</p>}
                                  </div>
                               </div>

                              <div className="space-y-1.5 relative">
                                 <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Delivery Instructions (Optional)</label>
                                    <span className={`text-[10px] font-bold ${formData.orderNotes?.length > 100 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                       {formData.orderNotes?.length || 0}/100 {formData.orderNotes?.length > 100 && `(+${formData.orderNotes.length - 100} extra)`}
                                    </span>
                                 </div>
                                 <textarea name="orderNotes" value={formData.orderNotes} onChange={handleInputChange} placeholder="Special delivery instructions, gate codes, etc." className={`w-full px-6 py-4 bg-white dark:bg-slate-800 border ${errors.orderNotes || formData.orderNotes?.length > 100 ? 'border-red-400' : 'border-slate-100 dark:border-slate-800'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm min-h-[100px] dark:text-slate-100`} />
                                 {errors.orderNotes && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.orderNotes}</p>}
                              </div>
                           </div>

                           <button onClick={() => handleNextStep(2)} className="w-full py-5 bg-brand-primary text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20">
                              Proceed to Payment
                           </button>
                        </div>
                     )}

                     {activeStep > 2 && (
                        <div className="flex gap-4 text-xs font-medium text-slate-500 italic">
                           {formData.address}, {formData.city}
                        </div>
                     )}
                  </div>

                  {/* Step 3: Payment Terminal */}
                  <div id="step-3" className={`bg-white dark:bg-slate-900 rounded-[2rem] border transition-all ${activeStep === 3 ? 'border-brand-primary shadow-2xl p-8' : 'border-slate-100 dark:border-slate-800 opacity-60 p-6'}`}>
                     <div className="flex items-center gap-4 mb-8">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeStep === 3 ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>03</span>
                        <h3 className="text-xl font-serif text-slate-900 dark:text-slate-100">Secure Payment</h3>
                     </div>

                     {activeStep === 3 && (
                        <div className="space-y-8 animate-fadeIn">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <button
                                 type="button"
                                 onClick={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}
                                 className={`p-6 border-2 rounded-[2rem] flex items-center gap-4 transition-all ${formData.paymentMethod === 'razorpay' ? 'border-brand-primary bg-violet-50 dark:bg-violet-900/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'}`}
                              >
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.paymentMethod === 'razorpay' ? 'bg-white text-brand-primary shadow-sm' : 'bg-slate-50 text-slate-400 dark:text-slate-500'}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                 </div>
                                 <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Online Payment</p>
                                    <p className="text-[8px] text-slate-500 font-bold mt-0.5">Secure Razorpay Terminal</p>
                                 </div>
                              </button>

                              <button
                                 type="button"
                                 onClick={() => {
                                    if (total > 50000) {
                                       showNotification("Cash on Delivery is unavailable for orders above ₹50,000.", "warning");
                                    } else {
                                       showNotification("Cash on Delivery Selected. Please keep the exact amount ready.", "info");
                                       setFormData({ ...formData, paymentMethod: 'cod' });
                                    }
                                 }}
                                 className={`p-6 border-2 rounded-[2rem] flex items-center gap-4 transition-all ${total > 50000 ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${formData.paymentMethod === 'cod' ? 'border-brand-primary bg-violet-50 dark:bg-violet-900/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'}`}
                              >
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.paymentMethod === 'cod' ? 'bg-white text-brand-primary shadow-sm' : 'bg-slate-50 text-slate-400 dark:text-slate-500'}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
                                 </div>
                                 <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Cash on Delivery</p>
                                    <p className="text-[8px] text-slate-500 font-bold mt-0.5">{total > 50000 ? 'Not available above ₹50,000' : 'Pay upon order arrival'}</p>
                                 </div>
                              </button>
                           </div>

                           <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                              <p className="text-xs text-slate-500 italic leading-relaxed font-medium">
                                 By confirming, you agree to our <a href="/terms-conditions" target="_blank" rel="noopener noreferrer" className="text-brand-primary font-bold hover:underline cursor-pointer">Terms of Service</a> and standard handling protocols.
                              </p>
                           </div>

                           <button onClick={handleSubmit} className="w-full py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-brand-primary dark:hover:bg-brand-accent hover:text-white transition-all shadow-2xl">
                              Authorize Transaction — {formatPrice(total)}
                           </button>
                        </div>
                      )}
                  </div>
               </div>

               {/* RIGHT: High-Precision Summary */}
               <div className="w-full lg:w-1/3">
                   <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-2xl sticky top-32 flex flex-col max-h-[calc(100vh-140px)]">
                      {/* Fixed Header */}
                      <div className="flex justify-between items-center mb-6 shrink-0">
                         <h4 className="text-xl font-serif text-slate-900 dark:text-slate-100">Registry Summary</h4>
                         <Link to="/cart" className="text-[9px] font-black uppercase text-brand-primary bg-violet-50 dark:bg-violet-900/20 px-3 py-1 rounded-full border border-brand-primary/10 dark:border-brand-primary/20">Modify Bag</Link>
                      </div>

                      {/* Fixed Promo Section */}
                      <div className="space-y-2 mb-4 shrink-0">
                         <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest pl-1">Promo Code</label>
                         <div className="flex gap-2">
                            <input
                               type="text"
                               value={promoCode}
                               onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                               placeholder="ENTER CODE"
                               disabled={appliedDiscount}
                               className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-brand-primary outline-none transition-all shadow-inner dark:text-slate-100"
                            />
                            {appliedDiscount ? (
                               <button
                                  onClick={() => { setAppliedDiscount(null); setPromoCode(''); }}
                                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700"
                               >
                                  Remove
                               </button>
                            ) : (
                               <button
                                  onClick={handleApplyDiscount}
                                  disabled={applyingDiscount || !promoCode}
                                  className="px-4 py-3 bg-brand-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-accent disabled:opacity-50 transition-all shadow-lg shadow-brand-primary/20"
                               >
                                  {applyingDiscount ? '...' : 'Apply'}
                               </button>
                            )}
                         </div>
                         {discountError && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{discountError}</p>}
                         {appliedDiscount && <p className="text-[9px] text-emerald-500 font-bold uppercase pl-1">{appliedDiscount.message}</p>}
                      </div>

                       {/* Scrollable Items List */}
                       <div className="space-y-4 overflow-y-auto no-scrollbar flex-grow min-h-[140px] mb-4">
                          {cartItems.map(item => {
                             const base = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
                             return (
                                <div key={item.cartKey || item.id} className="flex gap-4 group">
                                   <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-50 dark:border-slate-800">
                                      <img src={getImageUrl(item.image)} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="" />
                                   </div>
                                   <div className="flex-grow min-w-0">
                                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Qty: {item.quantity} • {formatPrice(base)} ea</p>
                                   </div>
                                   <p className="text-xs font-sans font-black text-slate-900 dark:text-slate-100">{formatPrice(base * item.quantity)}</p>
                                </div>
                             );
                          })}
                       </div>

                       {/* Fixed Calculation Section */}
                       <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-500 font-medium text-xs">Subtotal</span>
                             <span className="text-slate-900 dark:text-slate-100 font-bold text-xs">{formatPrice(subtotal)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-500 font-medium text-xs">Shipping</span>
                             <span className="text-slate-900 dark:text-slate-100 font-bold text-xs">{shipping === 0 ? <span className="text-emerald-500 uppercase text-[10px] font-black tracking-widest">Free</span> : formatPrice(shipping)}</span>
                          </div>
                          
                          {isTamilNadu ? (
                             <>
                                <div className="flex justify-between items-center text-sm">
                                   <span className="text-slate-500 font-medium text-xs">CGST ({(taxRate / 2).toFixed(1)}%)</span>
                                   <span className="text-slate-900 dark:text-slate-100 font-bold text-xs">{formatPrice(cgst)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                   <span className="text-slate-500 font-medium text-xs">SGST ({(taxRate / 2).toFixed(1)}%)</span>
                                   <span className="text-slate-900 dark:text-slate-100 font-bold text-xs">{formatPrice(sgst)}</span>
                                </div>
                             </>
                          ) : (
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium text-xs">IGST ({taxRate}%)</span>
                                <span className="text-slate-900 dark:text-slate-100 font-bold text-xs">{formatPrice(igst)}</span>
                             </div>
                          )}

                          {appliedDiscount && (
                             <div className="py-2 px-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex justify-between items-center animate-fadeIn">
                                <span className="text-[9px] font-black uppercase text-emerald-700 tracking-widest">Savings</span>
                                <span className="text-xs font-sans font-black text-emerald-700">-{formatPrice(totalSavings)}</span>
                             </div>
                          )}

                          {appliedDiscount?.type === 'buy_x_get_y' && parseFloat(appliedDiscount.discountAmount) > 0 && (
                             <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.1em] text-center italic py-1">
                                ✨ Offer Activated
                             </p>
                          )}

                          <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 mt-2">
                             <span className="text-base font-serif text-slate-900 dark:text-slate-100 italic">Total</span>
                             <div className="text-right">
                                <p className="text-xl font-sans font-bold text-slate-900 dark:text-slate-100 tracking-tight">{formatPrice(total)}</p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest"></p>
                             </div>
                          </div>
                       </div>
                    </div>
                </div>
            </div>
         </main>

         <CartSidebar />
         <Footer />

         <Modal
            isOpen={errorModal.isOpen}
            onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
            title={errorModal.title}
            footer={
               <button
                  onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                  className="w-full py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-brand-primary dark:hover:bg-brand-accent hover:text-white transition-all shadow-2xl"
               >
                  Understood
               </button>
            }
         >
            <div className="flex flex-col items-center text-center space-y-8 py-4">
               <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
               </div>
               <div className="space-y-3">
                  <h4 className="text-xl font-serif text-slate-900 dark:text-slate-100 italic">System Interruption</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                     {errorModal.message}
                  </p>
               </div>
            </div>
         </Modal>
         <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => {
               setIsAuthModalOpen(false);
            }} 
            initialMode="register" 
         />
      </div>
   );
};

export default Checkout;
