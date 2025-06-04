import { FormData } from '../components/FormWizard';
import { PurchaseOrder, PurchaseOrderSchema } from '../schemas/purchaseOrderSchema';

export const transformFormDataToPurchaseOrder = async (
  formData: FormData,
  poNumber: string
): Promise<PurchaseOrder> => {
  // Load lookup data
  const [companyInfoRes, manufacturerContactsRes, shipToContactsRes, productsRes, manufacturerProductsRes, otherItemsRes] = await Promise.all([
    fetch('/src/data/company_info.json'),
    fetch('/src/data/manufacturer_contacts.json'),
    fetch('/src/data/ship_to_contacts.json'),
    fetch('/src/data/products.json'),
    fetch('/src/data/manufacturer_products.json'),
    fetch('/src/data/other_items.json')
  ]);

  const [companyInfo, manufacturerContacts, shipToContacts, productsData, manufacturerProductsData, otherItemsData] = await Promise.all([
    companyInfoRes.json(),
    manufacturerContactsRes.json(),
    shipToContactsRes.json(),
    productsRes.json(),
    manufacturerProductsRes.json(),
    otherItemsRes.json()
  ]);

  const currentDate = new Date().toISOString().split('T')[0];
  const manufacturer = manufacturerContacts[formData.manufacturer];
  const shipTo = shipToContacts[formData.shipTo];
  
  // Get all products to build items array
  const familyProducts = productsData[formData.productFamily] || [];
  const manufacturerProducts = manufacturerProductsData[formData.manufacturer]?.[formData.productFamily] || [];
  const manufacturerOtherItems = otherItemsData[formData.manufacturer] || [];

  const items = Object.entries(formData.products)
    .filter(([_, quantity]) => quantity > 0)
    .map(([productId, quantity]) => {
      // Check if it's a standard product
      const baseProduct = familyProducts.find(p => p.id === productId);
      if (baseProduct) {
        const manufacturerProduct = manufacturerProducts.find(mp => mp.id === productId);
        if (!manufacturerProduct) throw new Error(`Manufacturer product ${productId} not found`);
        
        return {
          item_number: manufacturerProduct.manufacturer_id,
          quantity,
          description: baseProduct.name,
          barcode: "", // Default empty, will be added when needed
          unit_price: manufacturerProduct.price,
          total: quantity * manufacturerProduct.price
        };
      }
      
      // Check if it's an other item
      const otherItem = manufacturerOtherItems.find(p => p.id === productId);
      if (!otherItem) throw new Error(`Product ${productId} not found`);
      
      return {
        item_number: otherItem.sku,
        quantity,
        description: otherItem.name,
        barcode: "", // Default empty
        unit_price: otherItem.price,
        total: quantity * otherItem.price
      };
    });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalBottles = items.reduce((sum, item) => sum + item.quantity, 0);

  // Build packaging instructions
  const packagingInstructions = [];
  
  // Add configured package instructions
  Object.entries(formData.packageInstructions).forEach(([key, value]) => {
    if (value && key !== 'customFields') {
      packagingInstructions.push({
        component: key,
        instructions: value
      });
    }
  });
  
  // Add custom packaging fields
  if (formData.packageInstructions.customFields) {
    formData.packageInstructions.customFields.forEach(field => {
      if (field.label && field.value) {
        packagingInstructions.push({
          component: field.label.toLowerCase().replace(/\s+/g, '_'),
          instructions: field.value
        });
      }
    });
  }

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
