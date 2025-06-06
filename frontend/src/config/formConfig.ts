
export interface FieldConfig {
  label?: string;
  placeholder?: string;
  required: boolean;
}

export interface FormConfig {
  endpoint: string;
  fields: {
    // Step 1: Manufacturing
    manufacturer: FieldConfig;
    shipTo: FieldConfig;
    authorizedBy: FieldConfig;
    
    // Step 2: Product and Conditions
    productFamily: FieldConfig;
    shippedVia: FieldConfig;
    estimatedDelivery: FieldConfig;
    terms: FieldConfig;
    
    // Step 3: Order Details
    products: FieldConfig;
    
    // Step 4: Remarks
    remarks: FieldConfig;
    packageInstructions: {
      bottle: FieldConfig;
      bottleTop: FieldConfig;
    };
    
    // Step 5: Extra Fields
    extraFields: FieldConfig;
  };
}

export const formConfig: FormConfig = {
  endpoint: 'https://juliotest.requestcatcher.com/test',
  
  fields: {
    // Step 1: Manufacturing
    manufacturer: {
      label: 'Manufacturer',
      placeholder: 'Select manufacturer',
      required: true
    },
    shipTo: {
      label: 'Ship To',
      placeholder: 'Select shipping destination',
      required: true
    },
    authorizedBy: {
      label: 'Authorized By',
      placeholder: 'Select authorizing person',
      required: true
    },
    
    // Step 2: Product and Conditions
    productFamily: {
      label: 'Product Family',
      placeholder: 'Select product family',
      required: true
    },
    shippedVia: {
      label: 'Shipped Via',
      placeholder: 'Select shipping method',
      required: true
    },
    estimatedDelivery: {
      label: 'Estimated Delivery Date',
      required: false
    },
    terms: {
      label: 'Terms',
      placeholder: 'Select terms',
      required: false
    },
    
    // Step 3: Order Details
    products: {
      label: 'Products',
      required: true
    },
    
    // Step 4: Remarks
    remarks: {
      label: 'Remarks',
      placeholder: 'Enter any additional remarks',
      required: false
    },
    packageInstructions: {
      bottle: {
        label: 'Bottle',
        placeholder: 'Enter bottle instructions',
        required: false
      },
      bottleTop: {
        label: 'Bottle Top',
        placeholder: 'Enter bottle top instructions',
        required: false
      }
    },
    
    // Step 5: Extra Fields
    extraFields: {
      label: 'Additional Custom Fields',
      required: false
    }
  }
};
