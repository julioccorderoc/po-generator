
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormData } from '../FormWizard';

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
          fetch('/src/data/manufacturers.json'),
          fetch('/src/data/ship_to.json'),
          fetch('/src/data/authorized_by.json')
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
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Select
            value={formData.manufacturer}
            onValueChange={(value) => updateFormData({ manufacturer: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select manufacturer" />
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
          <Label htmlFor="shipTo">Ship To</Label>
          <Select
            value={formData.shipTo}
            onValueChange={(value) => updateFormData({ shipTo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shipping destination" />
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
          <Label htmlFor="authorizedBy">Authorized By</Label>
          <Select
            value={formData.authorizedBy}
            onValueChange={(value) => updateFormData({ authorizedBy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select authorizing person" />
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
