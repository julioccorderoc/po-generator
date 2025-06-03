
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { FormData } from '../FormWizard';

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface OrderDetailsStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const OrderDetailsStep: React.FC<OrderDetailsStepProps> = ({ formData, updateFormData }) => {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!formData.productFamily) return;

      try {
        const response = await fetch('/src/data/products.json');
        const productsData = await response.json();
        const familyProducts = productsData[formData.productFamily] || [];
        setAvailableProducts(familyProducts);
        
        // Initialize selected products if they don't exist
        if (selectedProducts.length === 0) {
          setSelectedProducts(familyProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, [formData.productFamily]);

  const updateQuantity = (productId: string, quantity: number) => {
    const updatedProducts = { ...formData.products };
    if (quantity > 0) {
      updatedProducts[productId] = quantity;
    } else {
      delete updatedProducts[productId];
    }
    updateFormData({ products: updatedProducts });
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    const updatedProducts = { ...formData.products };
    delete updatedProducts[productId];
    updateFormData({ products: updatedProducts });
  };

  if (!formData.productFamily) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a product family in the previous step to view available products.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h4 className="text-lg font-medium mb-2">Available Products</h4>
        <p className="text-sm text-gray-600">
          Product Family: {formData.productFamily}
        </p>
      </div>

      <div className="space-y-4">
        {selectedProducts.map((product) => (
          <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor={`quantity-${product.id}`} className="text-sm">
                Quantity:
              </Label>
              <Input
                id={`quantity-${product.id}`}
                type="number"
                min="0"
                className="w-20"
                value={formData.products[product.id] || 0}
                onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeProduct(product.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {selectedProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products available for the selected product family.
        </div>
      )}
    </div>
  );
};

export default OrderDetailsStep;
