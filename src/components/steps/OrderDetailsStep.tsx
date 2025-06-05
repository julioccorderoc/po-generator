
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { FormData } from '../FormWizard';
import { formatMoney, formatNumber } from '@/utils/formatters';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
}

interface ManufacturerProduct {
  id: string;
  manufacturer_id: string;
  price: number;
}

interface OtherItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  barcode: string;
}

interface OrderDetailsStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const OrderDetailsStep: React.FC<OrderDetailsStepProps> = ({ formData, updateFormData }) => {
  const [allProducts, setAllProducts] = useState<(Product & { price: number })[]>([]);
  const [otherItems, setOtherItems] = useState<OtherItem[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!formData.manufacturer || formData.productFamilies.length === 0) return;

      try {
        const [productsRes, manufacturerProductsRes, otherItemsRes] = await Promise.all([
          fetch('/data/products.json'),
          fetch('/data/manufacturer_products.json'),
          fetch('/data/other_items.json')
        ]);
        
        const [productsData, manufacturerProductsData, otherItemsData] = await Promise.all([
          productsRes.json(),
          manufacturerProductsRes.json(),
          otherItemsRes.json()
        ]);

        // Get products from all selected families
        let allFamilyProducts: Product[] = [];
        let allManufacturerProducts: ManufacturerProduct[] = [];

        formData.productFamilies.forEach(familyId => {
          const familyProducts: Product[] = productsData[familyId] || [];
          const manufacturerProducts: ManufacturerProduct[] = manufacturerProductsData[formData.manufacturer]?.[familyId] || [];
          
          allFamilyProducts = [...allFamilyProducts, ...familyProducts];
          allManufacturerProducts = [...allManufacturerProducts, ...manufacturerProducts];
        });

        // Combine product info with pricing
        const combinedProducts = allFamilyProducts.map(product => {
          const manufacturerProduct = allManufacturerProducts.find(mp => mp.id === product.id);
          return {
            ...product,
            price: manufacturerProduct?.price || 0
          };
        }).filter(product => product.price > 0);

        // Get other items for this manufacturer
        const manufacturerOtherItems: OtherItem[] = otherItemsData[formData.manufacturer] || [];
        
        setAllProducts(combinedProducts);
        setOtherItems(manufacturerOtherItems);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, [formData.manufacturer, formData.productFamilies]);

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
    const updatedProducts = { ...formData.products };
    delete updatedProducts[productId];
    updateFormData({ products: updatedProducts });
  };

  const calculateSubtotal = (product: (Product & { price: number }) | OtherItem) => {
    const quantity = formData.products[product.id] || 0;
    return quantity * product.price;
  };

  const calculateTotal = () => {
    return [...allProducts, ...otherItems].reduce((total, product) => {
      return total + calculateSubtotal(product);
    }, 0);
  };

  const getSelectedProductsCount = () => {
    return allProducts.reduce((total, product) => {
      return total + (formData.products[product.id] || 0);
    }, 0);
  };

  if (!formData.manufacturer) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a manufacturer in the previous step.
      </div>
    );
  }

  if (formData.productFamilies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select at least one product family in the previous step to view available products.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="mb-4">
          <h4 className="text-lg font-medium mb-2">Available Products</h4>
          <p className="text-sm text-gray-600">
            Manufacturer: {formData.manufacturer} | Product Families: {formData.productFamilies.join(', ')}
          </p>
        </div>

        {/* Regular Products */}
        <div className="space-y-4">
          <h5 className="font-medium text-gray-800">Standard Products</h5>
          {allProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                <div className="text-sm text-gray-500">Barcode: {product.barcode}</div>
                <div className="text-sm font-medium text-green-600">{formatMoney(product.price)}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor={`quantity-${product.id}`} className="text-sm">
                  Qty:
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

        {/* Other Items */}
        {otherItems.length > 0 && (
          <div className="space-y-4">
            <h5 className="font-medium text-gray-800">Other Items</h5>
            {otherItems.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                  <div className="text-sm text-gray-500">Barcode: {product.barcode}</div>
                  <div className="text-sm font-medium text-green-600">{formatMoney(product.price)}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`quantity-${product.id}`} className="text-sm">
                    Qty:
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
        )}

        {allProducts.length === 0 && otherItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products available for the selected manufacturer and product families.
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(formData.products).length === 0 ? (
              <p className="text-sm text-gray-500">No items selected</p>
            ) : (
              <>
                <div className="space-y-3">
                  {[...allProducts, ...otherItems]
                    .filter(product => formData.products[product.id] > 0)
                    .map((product) => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-gray-500">
                            {formatNumber(formData.products[product.id])} × {formatMoney(product.price)}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatMoney(calculateSubtotal(product))}
                        </div>
                      </div>
                    ))}
                </div>
                <hr />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Products:</span>
                    <span>{formatNumber(getSelectedProductsCount())}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">{formatMoney(calculateTotal())}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetailsStep;
