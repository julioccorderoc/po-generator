
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormData } from '../FormWizard';
import { formConfig } from '@/config/formConfig';

interface Option {
  id: string;
  name: string;
}

interface ManufacturingStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const ManufacturingStep: React.FC<ManufacturingStepProps> = ({ formData, updateFormData }) => {
  const [manufacturers, setManufacturers] = useState<Option[]>([]);
  const [shipToOptions, setShipToOptions] = useState<Option[]>([]);
  const [authorizedByOptions, setAuthorizedByOptions] = useState<Option[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [manufacturersRes, shipToRes, authorizedByRes] = await Promise.all([
          fetch('/data/manufacturers.json'),
          fetch('/data/ship_to.json'),
          fetch('/data/authorized_by.json')
        ]);

        const [manufacturersData, shipToData, authorizedByData] = await Promise.all([
          manufacturersRes.json(),
          shipToRes.json(),
          authorizedByRes.json()
        ]);

        setManufacturers(manufacturersData);
        setShipToOptions(shipToData);
        setAuthorizedByOptions(authorizedByData);
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
          <Label htmlFor="manufacturer">
            {formConfig.fields.manufacturer.label}
            {formConfig.fields.manufacturer.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={formData.manufacturer}
            onValueChange={(value) => updateFormData({ manufacturer: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={formConfig.fields.manufacturer.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {manufacturers.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipTo">
            {formConfig.fields.shipTo.label}
            {formConfig.fields.shipTo.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={formData.shipTo}
            onValueChange={(value) => updateFormData({ shipTo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={formConfig.fields.shipTo.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {shipToOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="authorizedBy">
            {formConfig.fields.authorizedBy.label}
            {formConfig.fields.authorizedBy.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={formData.authorizedBy}
            onValueChange={(value) => updateFormData({ authorizedBy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={formConfig.fields.authorizedBy.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {authorizedByOptions.map((option) => (
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

export default ManufacturingStep;
