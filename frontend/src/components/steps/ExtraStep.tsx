
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FormData } from '../FormWizard';

interface ExtraStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const ExtraStep: React.FC<ExtraStepProps> = ({ formData, updateFormData }) => {
  const addExtraField = () => {
    const updatedFields = [
      ...formData.extraFields,
      { label: '', value: '' }
    ];
    updateFormData({ extraFields: updatedFields });
  };

  const updateExtraField = (index: number, field: 'label' | 'value', value: string) => {
    const updatedFields = [...formData.extraFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    updateFormData({ extraFields: updatedFields });
  };

  const removeExtraField = (index: number) => {
    const updatedFields = formData.extraFields.filter((_, i) => i !== index);
    updateFormData({ extraFields: updatedFields });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium mb-2">Additional Custom Fields</h4>
        <p className="text-sm text-gray-600">
          Add any additional fields that you need for this order.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={addExtraField}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Field
          </Button>
        </div>

        {formData.extraFields.map((field, index) => (
          <div key={index} className="flex gap-4 items-end p-4 border rounded-lg">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`extra-label-${index}`}>Field Label</Label>
              <Input
                id={`extra-label-${index}`}
                value={field.label}
                onChange={(e) => updateExtraField(index, 'label', e.target.value)}
                placeholder="Enter field label"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor={`extra-value-${index}`}>Field Value</Label>
              <Input
                id={`extra-value-${index}`}
                value={field.value}
                onChange={(e) => updateExtraField(index, 'value', e.target.value)}
                placeholder="Enter field value"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeExtraField(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {formData.extraFields.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            No custom fields added yet. Click "Add Custom Field" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtraStep;
