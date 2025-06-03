
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FormData } from '../FormWizard';

interface Option {
  id: string;
  name: string;
}

interface ProductConditionsStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const ProductConditionsStep: React.FC<ProductConditionsStepProps> = ({ formData, updateFormData }) => {
  const [productFamilies, setProductFamilies] = useState<Option[]>([]);
  const [shippingMethods, setShippingMethods] = useState<Option[]>([]);
  const [terms, setTerms] = useState<Option[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productFamiliesRes, shippingMethodsRes, termsRes] = await Promise.all([
          fetch('/src/data/product_families.json'),
          fetch('/src/data/shipping_methods.json'),
          fetch('/src/data/terms.json')
        ]);

        const [productFamiliesData, shippingMethodsData, termsData] = await Promise.all([
          productFamiliesRes.json(),
          shippingMethodsRes.json(),
          termsRes.json()
        ]);

        setProductFamilies(productFamiliesData);
        setShippingMethods(shippingMethodsData);
        setTerms(termsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="productFamily">Product Family</Label>
          <Select
            value={formData.productFamily}
            onValueChange={(value) => updateFormData({ productFamily: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product family" />
            </SelectTrigger>
            <SelectContent>
              {productFamilies.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippedVia">Shipped Via</Label>
          <Select
            value={formData.shippedVia}
            onValueChange={(value) => updateFormData({ shippedVia: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shipping method" />
            </SelectTrigger>
            <SelectContent>
              {shippingMethods.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
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
                {formData.estimatedDelivery ? format(formData.estimatedDelivery, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.estimatedDelivery || undefined}
                onSelect={(date) => updateFormData({ estimatedDelivery: date || null })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="terms">Terms</Label>
          <Select
            value={formData.terms}
            onValueChange={(value) => updateFormData({ terms: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment terms" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ProductConditionsStep;
