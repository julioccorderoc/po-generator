
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FormData } from '../FormWizard';

interface ProductConditionsStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const ProductConditionsStep: React.FC<ProductConditionsStepProps> = ({ formData, updateFormData }) => {
  const [productFamilies, setProductFamilies] = useState<{ id: string; name: string }[]>([]);
  const [shippingMethods, setShippingMethods] = useState<{ id: string; name: string }[]>([]);
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
  const [availableFamilies, setAvailableFamilies] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [familiesRes, shippingRes, termsRes, manufacturerProductsRes] = await Promise.all([
          fetch('/data/product_families.json'),
          fetch('/data/shipping_methods.json'),
          fetch('/data/terms.json'),
          fetch('/data/manufacturer_products.json')
        ]);

        const [familiesData, shippingData, termsData, manufacturerProductsData] = await Promise.all([
          familiesRes.json(),
          shippingRes.json(),
          termsRes.json(),
          manufacturerProductsRes.json()
        ]);

        setProductFamilies(familiesData);
        setShippingMethods(shippingData);
        setTerms(termsData);

        // Filter available families based on manufacturer
        if (formData.manufacturer && manufacturerProductsData[formData.manufacturer]) {
          const manufacturerFamilies = Object.keys(manufacturerProductsData[formData.manufacturer]);
          const filteredFamilies = familiesData.filter((family: { id: string; name: string }) => 
            manufacturerFamilies.includes(family.id)
          );
          setAvailableFamilies(filteredFamilies);
        } else {
          setAvailableFamilies([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [formData.manufacturer]);

  const handleFamilyToggle = (familyId: string, checked: boolean) => {
    const updatedFamilies = checked 
      ? [...formData.productFamilies, familyId]
      : formData.productFamilies.filter(id => id !== familyId);
    
    updateFormData({ productFamilies: updatedFamilies });
  };

  const removeFamilyTag = (familyId: string) => {
    const updatedFamilies = formData.productFamilies.filter(id => id !== familyId);
    updateFormData({ productFamilies: updatedFamilies });
  };

  return (
    <div className="space-y-6">
      {!formData.manufacturer && (
        <div className="text-center py-8 text-gray-500">
          Please select a manufacturer in the previous step to view available product families.
        </div>
      )}
      
      {formData.manufacturer && (
        <>
          <div className="space-y-4">
            <Label>Product Families *</Label>
            
            {/* Selected families display */}
            {formData.productFamilies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.productFamilies.map((familyId) => {
                  const family = availableFamilies.find(f => f.id === familyId);
                  return family ? (
                    <div key={familyId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {family.name}
                      <button
                        onClick={() => removeFamilyTag(familyId)}
                        className="hover:bg-blue-200 rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {/* Available families checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFamilies.map((family) => (
                <div key={family.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={family.id}
                    checked={formData.productFamilies.includes(family.id)}
                    onCheckedChange={(checked) => handleFamilyToggle(family.id, checked as boolean)}
                  />
                  <Label htmlFor={family.id} className="text-sm font-normal cursor-pointer">
                    {family.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippedVia">Shipped Via</Label>
            <Select value={formData.shippedVia} onValueChange={(value) => updateFormData({ shippedVia: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select shipping method" />
              </SelectTrigger>
              <SelectContent>
                {shippingMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estimated Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.estimatedDelivery && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.estimatedDelivery ? format(formData.estimatedDelivery, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.estimatedDelivery || undefined}
                  onSelect={(date) => updateFormData({ estimatedDelivery: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms</Label>
            <Select value={formData.terms} onValueChange={(value) => updateFormData({ terms: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select terms" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductConditionsStep;
