
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FormData } from '../FormWizard';

interface PackageInstructionField {
  id: string;
  label: string;
  placeholder: string;
}

interface RemarksStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const RemarksStep: React.FC<RemarksStepProps> = ({ formData, updateFormData }) => {
  const [packageFields, setPackageFields] = useState<PackageInstructionField[]>([]);

  useEffect(() => {
    const loadPackageFields = async () => {
      try {
        const response = await fetch('/data/package_instructions.json');
        const data = await response.json();
        setPackageFields(data);
      } catch (error) {
        console.error('Error loading package instructions:', error);
      }
    };

    loadPackageFields();
  }, []);

  const updatePackageInstruction = (fieldId: string, value: string) => {
    updateFormData({
      packageInstructions: {
        ...formData.packageInstructions,
        [fieldId]: value
      }
    });
  };

  const addCustomField = () => {
    const newField = { label: '', value: '' };
    updateFormData({
      packageInstructions: {
        ...formData.packageInstructions,
        customFields: [...formData.packageInstructions.customFields, newField]
      }
    });
  };

  const updateCustomField = (index: number, field: 'label' | 'value', value: string) => {
    const updatedFields = [...formData.packageInstructions.customFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    updateFormData({
      packageInstructions: {
        ...formData.packageInstructions,
        customFields: updatedFields
      }
    });
  };

  const removeCustomField = (index: number) => {
    const updatedFields = formData.packageInstructions.customFields.filter((_, i) => i !== index);
    updateFormData({
      packageInstructions: {
        ...formData.packageInstructions,
        customFields: updatedFields
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* General Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">General Remarks</Label>
        <Textarea
          id="remarks"
          placeholder="Add any general remarks or notes for this order..."
          value={formData.remarks}
          onChange={(e) => updateFormData({ remarks: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      {/* Package Instructions */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Package Instructions</h4>
        
        {/* Static package instruction fields */}
        {packageFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={formData.packageInstructions[field.id as keyof typeof formData.packageInstructions] as string || ''}
              onChange={(e) => updatePackageInstruction(field.id, e.target.value)}
            />
          </div>
        ))}

        {/* Custom package instruction fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Custom Package Instructions</h5>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomField}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Custom Field
            </Button>
          </div>

          {formData.packageInstructions.customFields.map((field, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`custom-label-${index}`}>Field Label</Label>
                <Input
                  id={`custom-label-${index}`}
                  placeholder="Enter field name..."
                  value={field.label}
                  onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`custom-value-${index}`}>Instructions</Label>
                <div className="flex gap-2">
                  <Input
                    id={`custom-value-${index}`}
                    placeholder="Enter instructions..."
                    value={field.value}
                    onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomField(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RemarksStep;
