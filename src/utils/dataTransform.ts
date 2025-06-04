
import { FormData } from '../components/FormWizard';
import { PurchaseOrder, PurchaseOrderSchema } from '../schemas/purchaseOrderSchema';

export const transformFormDataToPurchaseOrder = async (
  formData: FormData,
  poNumber: string
): Promise<PurchaseOrder> => {
  // Load lookup data
  const [companyInfoRes, manufacturerContactsRes, shipToContactsRes, manufacturerProductsRes, otherItemsRes] = await Promise.all([
    fetch('/src/data/company_info.json'),
    fetch('/src/data/manufacturer_contacts.json'),
    fetch('/src/data/ship_to_contacts.json'),
    fetch('/src/data/manufacturer_products.json'),
    fetch('/src/data/other_items.json')
  ]);

  const [companyInfo, manufacturerContacts, shipToContacts, manufacturerProducts, otherItems] = await Promise.all([
    companyInfoRes.json(),
    manufacturerContactsRes.json(),
    shipToContactsRes.json(),
    manufacturerProductsRes.json(),
    otherItemsRes.json()
  ]);

  const currentDate = new Date().toISOString().split('T')[0];
  const manufacturer = manufacturerContacts[formData.manufacturer];
  const shipTo = shipToContacts[formData.shipTo];
  
  // Get all products to build items array
  const familyProducts = manufacturerProducts[formData.manufacturer]?.[formData.productFamily] || [];
  const manufacturerOtherItems = otherItems[formData.manufacturer] || [];
  const allProducts = [...familyProducts, ...manufacturerOtherItems];

  const items = Object.entries(formData.products)
    .filter(([_, quantity]) => quantity > 0)
    .map(([productId, quantity]) => {
      const product = allProducts.find(p => p.id === productId);
      if (!product) throw new Error(`Product ${productId} not found`);
      
      return {
        item_number: product.sku,
        quantity,
        description: product.name,
        barcode: "", // Default empty
        unit_price: product.price,
        total: quantity * product.price
      };
    });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalBottles = items.reduce((sum, item) => sum + item.quantity, 0);

  // Build packaging instructions
  const packagingInstructions = [];
  if (formData.packageInstructions.bottle) {
    packagingInstructions.push({
      component: "bottle",
      instructions: formData.packageInstructions.bottle
    });
  }
  if (formData.packageInstructions.bottleTop) {
    packagingInstructions.push({
      component: "bottle_top", 
      instructions: formData.packageInstructions.bottleTop
    });
  }
  // Add custom packaging fields
  formData.packageInstructions.customFields.forEach(field => {
    packagingInstructions.push({
      component: field.label.toLowerCase().replace(/\s+/g, '_'),
      instructions: field.value
    });
  });

  // Build annexed items from extra fields
  const annexItems = formData.extraFields.map(field => ({
    title: field.label,
    type: "custom_field", // Default type
    content: field.value
  }));

  const purchaseOrder: PurchaseOrder = {
    po_number: poNumber,
    po_date: currentDate,
    company: companyInfo,
    to_manufacturer: manufacturer,
    ship_to: shipTo,
    general_po_info: {
      product_name: formData.productFamily,
      shipped_via: formData.shippedVia,
      est_delivery_date: formData.estimatedDelivery ? formData.estimatedDelivery.toISOString().split('T')[0] : currentDate,
      payment_terms: formData.terms
    },
    items,
    remarks: formData.remarks || "",
    summary_totals: {
      total_bottles: totalBottles,
      subtotal,
      shipping: 0, // Default 0
      other_fees: 0, // Default 0  
      grand_total: subtotal,
      deposit: 0 // Default 0
    },
    packaging_instructions: packagingInstructions,
    auth_details: {
      date_of_signature: currentDate,
      authority: formData.authorizedBy
    },
    annex_items: annexItems
  };

  // Validate the data
  return PurchaseOrderSchema.parse(purchaseOrder);
};
